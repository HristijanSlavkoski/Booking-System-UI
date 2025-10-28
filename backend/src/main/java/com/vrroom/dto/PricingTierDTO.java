package com.vrroom.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

/**
 * @author Hristijan Slavkoski
 */
@Data
@Builder
public class PricingTierDTO
{
    private String id;
    private Integer minPlayers;
    private Integer maxPlayers;
    private BigDecimal pricePerPlayer;
}
