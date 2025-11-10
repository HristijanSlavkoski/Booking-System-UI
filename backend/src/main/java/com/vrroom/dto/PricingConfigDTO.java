package com.vrroom.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingConfigDTO
{
    private String id;
    private List<PricingTierDTO> tiers;
    private Boolean active;
}
