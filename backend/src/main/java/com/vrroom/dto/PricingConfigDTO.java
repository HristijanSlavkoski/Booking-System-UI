package com.vrroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingConfigDTO {
    private String id;
    private List<PricingTierDTO> tiers;
    private BigDecimal weekendMultiplier;
    private BigDecimal holidayMultiplier;
    private BigDecimal groupDiscount;
    private Integer groupDiscountThreshold;
    private Boolean active;
}
