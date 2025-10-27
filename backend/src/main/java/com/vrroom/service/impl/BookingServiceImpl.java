package com.vrroom.service.impl;

import com.vrroom.domain.entity.Booking;
import com.vrroom.domain.entity.BookingGame;
import com.vrroom.domain.entity.Game;
import com.vrroom.domain.entity.User;
import com.vrroom.domain.enums.BookingStatus;
import com.vrroom.dto.BookingDTO;
import com.vrroom.dto.BookingGameDTO;
import com.vrroom.dto.CreateBookingRequest;
import com.vrroom.exception.InsufficientCapacityException;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.BookingRepository;
import com.vrroom.repository.GameRepository;
import com.vrroom.repository.SystemConfigRepository;
import com.vrroom.repository.UserRepository;
import com.vrroom.service.BookingService;
import com.vrroom.service.EmailService;
import java.time.LocalDate;
import java.time.LocalTime;
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
    private final SystemConfigRepository systemConfigRepository;
    private final EmailService emailService;

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

    @Override
    @Transactional
    public BookingDTO createBooking(CreateBookingRequest request, String userId)
    {
        log.info("Creating booking for user: {}", userId);

        // --- 1) Basic validation ---
        if (request == null)
        {
            throw new IllegalArgumentException("Request must not be null");
        }
        if (request.getBookingDate() == null || request.getBookingTime() == null)
        {
            throw new IllegalArgumentException("bookingDate and bookingTime are required");
        }
        if (request.getNumberOfRooms() == null || request.getNumberOfRooms() <= 0)
        {
            throw new IllegalArgumentException("numberOfRooms must be > 0");
        }
        if (request.getGames() == null || request.getGames().isEmpty())
        {
            throw new IllegalArgumentException("At least one game must be provided");
        }

        // --- 2) Capacity check (keep your existing logic) ---
        if (!isSlotAvailable(request.getBookingDate(), request.getBookingTime(), request.getNumberOfRooms()))
        {
            throw new InsufficientCapacityException("Not enough rooms available for the selected time slot");
        }

        // --- 3) Load user if authenticated; otherwise validate guest contact info ---
        User user = null;
        boolean authenticated = userId != null && !userId.isBlank();
        if (authenticated)
        {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        }
        else
        {
            // guest path: we need at least an email or phone to contact the customer
            boolean hasEmail = request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank();
            boolean hasPhone = request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank();
            if (!hasEmail && !hasPhone)
            {
                throw new IllegalArgumentException("For guest bookings, customerEmail or customerPhone is required.");
            }
        }

        // --- 4) Build the booking entity ---
        Booking booking = Booking.builder()
                .user(user) // null means guest booking
                .bookingDate(request.getBookingDate())
                .bookingTime(request.getBookingTime())
                .numberOfRooms(request.getNumberOfRooms())
                .totalPrice(request.getTotalPrice()) // keep if you precompute; otherwise consider summing games below
                .status(BookingStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .customerFirstName(request.getCustomerFirstName())
                .customerLastName(request.getCustomerLastName())
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone())
                .build();

        // (Optional) If user is logged in and no customer email was supplied, default to user's email (if you have it)
        if (user != null && (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()))
        {
            try
            {
                // adjust if your User entity has a different getter
                var emailFromUser = user.getEmail();
                if (emailFromUser != null && !emailFromUser.isBlank())
                {
                    booking.setCustomerEmail(emailFromUser);
                }
            }
            catch (Exception ignore)
            {
            }
        }

        // --- 5) Attach games (validate each) ---
        for (CreateBookingRequest.BookingGameRequest gameRequest : request.getGames())
        {
            if (gameRequest == null || gameRequest.getGameId() == null || gameRequest.getGameId().isBlank())
            {
                throw new IllegalArgumentException("Each game must have a valid gameId");
            }

            Game game = gameRepository.findById(gameRequest.getGameId())
                    .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + gameRequest.getGameId()));

            BookingGame bookingGame = BookingGame.builder()
                    .game(game)
                    .roomNumber(gameRequest.getRoomNumber())
                    .playerCount(gameRequest.getPlayerCount())
                    .price(gameRequest.getPrice())
                    .build();

            booking.addBookingGame(bookingGame);
        }

        // (Optional) If totalPrice is null, compute from game prices:
        // if (booking.getTotalPrice() == null) {
        // BigDecimal sum = booking.getBookingGames().stream()
        // .map(bg -> bg.getPrice() == null ? BigDecimal.ZERO : bg.getPrice())
        // .reduce(BigDecimal.ZERO, BigDecimal::add);
        // booking.setTotalPrice(sum);
        // }

        // --- 6) Persist & notify ---
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with id: {}", savedBooking.getId());

        BookingDTO bookingDTO = mapToDTO(savedBooking);

        // Ensure your email service works for both flows.
        // If it uses bookingDTO.customerEmail, make sure it's set above.
        emailService.sendBookingConfirmation(bookingDTO);

        return bookingDTO;
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

    @Override
    @Transactional
    public void cancelBooking(String id)
    {
        log.info("Cancelling booking with id: {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        log.info("Booking cancelled successfully");
    }

    @Override
    public Integer getAvailableSlots(LocalDate date, LocalTime time)
    {
        Integer maxRooms = systemConfigRepository.findLatestConfig()
                .map(config -> config.getMaxConcurrentBookings())
                .orElse(2);

        Integer bookedRooms = bookingRepository.countBookedRoomsByDateAndTime(date, time);
        if (bookedRooms == null)
        {
            bookedRooms = 0;
        }

        return maxRooms - bookedRooms;
    }

    @Override
    public boolean isSlotAvailable(LocalDate date, LocalTime time, Integer requestedRooms)
    {
        Integer availableSlots = getAvailableSlots(date, time);
        return availableSlots >= requestedRooms;
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
                        .price(bg.getPrice())
                        .build())
                .collect(Collectors.toList());

        String userId = (booking.getUser() != null) ? booking.getUser().getId() : null;

        return BookingDTO.builder()
                .id(booking.getId())
                .userId(userId)
                .bookingDate(booking.getBookingDate())
                .bookingTime(booking.getBookingTime())
                .numberOfRooms(booking.getNumberOfRooms())
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
