package com.vrroom.service.impl;

import com.vrroom.dto.BookingDTO;
import com.vrroom.dto.BookingGameDTO;
import com.vrroom.dto.CreateBookingRequest;
import com.vrroom.exception.InsufficientCapacityException;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.model.entity.Booking;
import com.vrroom.model.entity.BookingGame;
import com.vrroom.model.entity.Game;
import com.vrroom.model.entity.User;
import com.vrroom.model.enums.BookingStatus;
import com.vrroom.model.enums.GiftCardStatus;
import com.vrroom.model.enums.PaymentMethod;
import com.vrroom.repository.BookingGameRepository;
import com.vrroom.repository.BookingRepository;
import com.vrroom.repository.GameRepository;
import com.vrroom.repository.GiftCardRepository;
import com.vrroom.repository.UserRepository;
import com.vrroom.service.AvailabilityService;
import com.vrroom.service.BookingService;
import com.vrroom.service.EmailService;
import com.vrroom.service.GiftCardService;
import com.vrroom.service.PaymentService;
import com.vrroom.service.PricingService;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService
{
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final EmailService emailService;
    private final GiftCardService giftCardService;
    private final PricingService pricingService;
    private final GiftCardRepository giftCardRepository;
    private final BookingGameRepository bookingGameRepository;
    private final PaymentService paymentService;
    private final AvailabilityService availabilityService;

    @Override
    public List<BookingDTO> getAllBookings()
    {
        log.debug("Fetching all bookings");
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getBookingsByUserId(String userId)
    {
        log.debug("Fetching bookings for user: {}", userId);
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getBookingsByStatus(BookingStatus status)
    {
        log.debug("Fetching bookings by status: {}", status);
        return bookingRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDTO getBookingById(String id)
    {
        log.debug("Fetching booking by id: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToDTO(booking);
    }

    public BookingDTO getBookingByIdForUser(String id, User user)
    {
        log.debug("Fetching booking by id: {} for user: {}", id, user.getId());
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Security check: user can only access their own bookings unless admin
        if (!user.getRoles().contains("ADMIN") &&
                (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())))
        {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }

        return mapToDTO(booking);
    }

    @Override
    @Transactional
    public BookingDTO createBooking(CreateBookingRequest request, String userId) throws Exception
    {
        log.info("Creating booking for user: {}", request.getCustomerEmail());

        BigDecimal subtotal = pricingService.calculateTotalPriceForBooking(request);
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank())
        {
            discount = giftCardService.peekDiscount(request.getDiscountCode());
        }
        BigDecimal total = subtotal.subtract(discount);
        if (total.signum() < 0)
        {
            total = BigDecimal.ZERO;
        }

        if (!availabilityService.isSlotAvailable(request.getBookingDate(), request.getBookingTime(), request.getNumberOfRooms()))
        {
            throw new InsufficientCapacityException("Not enough rooms available for the selected time slot");
        }

        var lockStatuses = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        // TODO: Check this, its suspicious
        bookingGameRepository.lockGamesForSlot(request.getBookingDate(), request.getBookingTime(), lockStatuses);

        User user = null;
        boolean authenticated = userId != null && !userId.isBlank();
        if (authenticated)
        {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }
        // TODO: Add email to subscription

        // 5) Build Booking (status HOLD/PENDING_PAYMENT)
        Booking booking = Booking.builder()
                .user(user)
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .status(BookingStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .customerFirstName(request.getCustomerFirstName())
                .customerLastName(request.getCustomerLastName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .totalPrice(total)
                .build();

        // Attach games (validate existence, players range is enforced in PricingService; still OK to double-check)
        var gameIds = request.getGames().stream().map(CreateBookingRequest.BookingGameRequest::getGameId).toList();
        var gamesById = gameRepository.findAllById(gameIds).stream()
                .collect(Collectors.toMap(Game::getId, g -> g));
        if (gamesById.size() != gameIds.size())
        {
            throw new ResourceNotFoundException("One or more games not found.");
        }

        for (var line : request.getGames())
        {
            Game game = gamesById.get(line.getGameId());
            var bg = BookingGame.builder()
                    .game(game)
                    .roomNumber(line.getRoomNumber())
                    .playerCount(line.getPlayerCount())
                    .build();
            booking.addBookingGame(bg);
        }

        // 6) Hold the gift card (no redeem yet)
        if (request.getDiscountCode() != null && !request.getDiscountCode().isBlank())
        {
            giftCardService.holdGiftCard(request.getDiscountCode());
            booking.setGiftCard(giftCardRepository.findByCode(request.getDiscountCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Gift card not found")));
        }

        // 7) Persist
        Booking saved = bookingRepository.save(booking);
        log.info("Booking created with id {}", saved.getId());

        BookingDTO bookingDTO = mapToDTO(saved);
        // 8) Fire domain event; email after commit\
        String paymentUrl = null;
        if (request.getPaymentMethod() == PaymentMethod.ONLINE)
        {
            // TODO: booking instead of bookingDTO
            // paymentUrl = paymentService.createCheckoutSession(bookingDTO);
            bookingDTO.setPaymentUrl("https://www.youtube.com");
            // TODO: Schedule timeout job to release hold if unpaid (e.g., 15 min)
        }

        // emailService.sendBookingConfirmation(bookingDTO);

        return bookingDTO;
    }

    @Transactional
    public BookingDTO confirmBooking(String bookingId)
    {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (b.getStatus() != BookingStatus.PENDING)
        {
            throw new IllegalStateException("Only PENDING_PAYMENT bookings can be confirmed");
        }

        if (b.getGiftCard() != null)
        {
            giftCardService.redeemGiftCard(b.getGiftCard().getCode(), b.getId());
        }

        b.setStatus(BookingStatus.CONFIRMED);
        return mapToDTO(bookingRepository.save(b));
    }

    @Transactional
    public void cancelBooking(String id)
    {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (b.getStatus() == BookingStatus.CANCELLED)
        {
            return;
        }

        if (b.getGiftCard() != null && b.getGiftCard().getStatus().equals(GiftCardStatus.HELD))
        {
            giftCardService.releaseGiftCard(b.getGiftCard().getCode());
            b.setGiftCard(null);
        }
        b.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(b);
    }

    @Transactional
    public void cancelBookingForUser(String id, User user)
    {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Security check: user can only cancel their own bookings unless admin
        if (!user.getRoles().contains("ADMIN") &&
                (booking.getUser() == null || !booking.getUser().getId().equals(user.getId())))
        {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED)
        {
            return;
        }

        if (booking.getGiftCard() != null && booking.getGiftCard().getStatus().equals(GiftCardStatus.HELD))
        {
            giftCardService.releaseGiftCard(booking.getGiftCard().getCode());
            booking.setGiftCard(null);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public BookingDTO updateBookingStatus(String id, BookingStatus status)
    {
        log.info("Updating booking status to: {} for id: {}", status, id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking status updated successfully");
        return mapToDTO(updatedBooking);
    }

    private BookingDTO mapToDTO(Booking booking)
    {
        List<BookingGameDTO> bookingGameDTOs = booking.getBookingGames().stream()
                .map(bg -> BookingGameDTO.builder()
                        .id(bg.getId())
                        .gameId(bg.getGame().getId())
                        .gameName(bg.getGame().getName())
                        .roomNumber(bg.getRoomNumber())
                        .playerCount(bg.getPlayerCount())
                        .build())
                .collect(Collectors.toList());

        String userId = (booking.getUser() != null) ? booking.getUser().getId() : null;

        return BookingDTO.builder()
                .id(booking.getId())
                .userId(userId)
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .customerFirstName(booking.getCustomerFirstName())
                .customerLastName(booking.getCustomerLastName())
                .customerEmail(booking.getCustomerEmail())
                .customerPhone(booking.getCustomerPhone())
                .bookingGames(bookingGameDTOs)
                .createdAt(booking.getCreatedAt())
                .build();
    }

}
