package com.vrroom.service.impl;

import com.vrroom.domain.entity.Game;
import com.vrroom.domain.entity.PricingConfig;
import com.vrroom.domain.entity.PricingTier;
import com.vrroom.dto.CreateBookingRequest;
import com.vrroom.dto.PricingPreviewDTO;
import com.vrroom.dto.PromotionDTO;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GameRepository;
import com.vrroom.repository.PricingConfigRepository;
import com.vrroom.service.PricingService;
import com.vrroom.service.PromotionService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author Hristijan Slavkoski
 */
@Service
@RequiredArgsConstructor
public class PricingServiceImpl implements PricingService
{

    private final GameRepository gameRepository;
    private final PricingConfigRepository pricingConfigRepository;
    private final PromotionService promotionService;

    @Override
    @Transactional
    public BigDecimal calculateTotalPriceForBooking(CreateBookingRequest req)
    {
        final PricingConfig cfg = getActiveConfig();
        final LocalDate bookingDate = req.getBookingDate();

        Map<String, Game> gamesById = gameRepository.findAllById(
                req.getGames().stream()
                        .map(CreateBookingRequest.BookingGameRequest::getGameId)
                        .toList())
                .stream()
                .collect(Collectors.toMap(Game::getId, g -> g));

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateBookingRequest.BookingGameRequest lineReq : req.getGames())
        {
            Game game = Optional.ofNullable(gamesById.get(lineReq.getGameId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + lineReq.getGameId()));

            BigDecimal lineTotal = calculateTotalPriceForBooking(lineReq, game, cfg, bookingDate);
            subtotal = subtotal.add(lineTotal);
        }

        return subtotal;
    }

    @Override
    public PricingPreviewDTO previewPrice(String gameId, LocalDate date, int players)
    {
        PricingConfig cfg = getActiveConfig();

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found: " + gameId));

        if (players < game.getMinPlayers() || players > game.getMaxPlayers())
        {
            throw new IllegalArgumentException("Player count " + players + " not allowed for game '"
                    + game.getName() + "' (" + game.getMinPlayers() + "-" + game.getMaxPlayers() + ")");
        }

        // 1) Base price
        BigDecimal pricePerPlayer = findTierPrice(cfg.getTiers(), players);
        BigDecimal baseTotal = pricePerPlayer.multiply(BigDecimal.valueOf(players));

        // 2) Best promotion (if any)
        Optional<PromotionDTO> bestPromoOpt = promotionService.findBestPromotionForGameAndDate(gameId, date);

        double discountFraction = bestPromoOpt
                .map(p -> p.getDiscount() != null ? p.getDiscount().doubleValue() : 0.0)
                .orElse(0.0);

        String promoName = bestPromoOpt
                .map(PromotionDTO::getName)
                .orElse(null);

        // 3) Apply discount
        BigDecimal finalTotal = applyDiscount(baseTotal, BigDecimal.valueOf(discountFraction));
        BigDecimal discountAmount = baseTotal.subtract(finalTotal).setScale(2, RoundingMode.HALF_UP);

        return PricingPreviewDTO.builder()
                .basePrice(baseTotal.setScale(2, RoundingMode.HALF_UP))
                .finalPrice(finalTotal)
                .discountAmount(discountAmount)
                .discountFraction(discountFraction)
                .promotionName(promoName)
                .build();
    }

    private BigDecimal calculateTotalPriceForBooking(CreateBookingRequest.BookingGameRequest lineReq,
            Game game,
            PricingConfig cfg,
            LocalDate bookingDate)
    {
        int players = lineReq.getPlayerCount();
        if (players < game.getMinPlayers() || players > game.getMaxPlayers())
        {
            throw new IllegalArgumentException("Player count " + players + " not allowed for game '"
                    + game.getName() + "' (" + game.getMinPlayers() + "-" + game.getMaxPlayers() + ")");
        }

        // 1) Base price from tiers
        BigDecimal pricePerPlayer = findTierPrice(cfg.getTiers(), players);
        BigDecimal baseLineTotal = pricePerPlayer.multiply(BigDecimal.valueOf(players));

        // 2) Promotion discount for this game and date (0.0 – 1.0)
        double promoDiscountFraction = promotionService.resolveDiscountForGameAndDate(game.getId(), bookingDate);
        BigDecimal promoDiscount = BigDecimal.valueOf(promoDiscountFraction);

        // 3) Apply promo discount (if none, fraction = 0.0 and we just return base price)
        return applyDiscount(baseLineTotal, promoDiscount);
    }

    private BigDecimal findTierPrice(List<PricingTier> tiers, int players)
    {
        for (PricingTier t : tiers)
        {
            if (players >= t.getMinPlayers() && players <= t.getMaxPlayers())
            {
                return t.getPricePerPlayer();
            }
        }
        throw new IllegalArgumentException("No pricing tier matches " + players + " players");
    }

    private PricingConfig getActiveConfig()
    {
        return pricingConfigRepository.findActiveConfig()
                .orElseThrow(() -> new IllegalStateException("Active pricing config not found"));
    }

    /**
     * amount * (1 - discountFraction), where discountFraction is e.g. 0.50 for 50%.
     * If discountFraction <= 0, returns amount unchanged.
     */
    private BigDecimal applyDiscount(BigDecimal amount, BigDecimal discountFraction)
    {
        if (discountFraction == null || discountFraction.compareTo(BigDecimal.ZERO) <= 0)
        {
            return amount.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal multiplier = BigDecimal.ONE.subtract(discountFraction);
        return amount.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }
}
