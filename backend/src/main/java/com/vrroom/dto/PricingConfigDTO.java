package com.vrroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingConfigDTO {
    private String id;
    private Integer minPlayers;
    private Integer maxPlayers;
    private BigDecimal basePrice;
    private BigDecimal additionalPlayerPrice;
    private BigDecimal weekendMultiplier;
    private BigDecimal holidayMultiplier;
    private BigDecimal groupDiscount;
    private Integer groupDiscountThreshold;
    private Boolean active;
}
