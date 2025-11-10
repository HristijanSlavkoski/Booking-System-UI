package com.vrroom.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Preview of pricing for a single game, date and player count.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingPreviewDTO
{
    /**
     * Base price without promotions (for this game, date, player count).
     */
    private BigDecimal basePrice;

    /**
     * Final price after promotions (but before gift cards, etc.).
     */
    private BigDecimal finalPrice;

    /**
     * basePrice - finalPrice.
     */
    private BigDecimal discountAmount;

    /**
     * Promotion discount fraction: 0.50 = 50% off, 0.20 = 20% off.
     */
    private double discountFraction;

    /**
     * Name of the applied promotion, if any (e.g. "November 50% Off").
     */
    private String promotionName;
}
