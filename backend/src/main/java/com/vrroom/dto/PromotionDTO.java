package com.vrroom.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Hristijan Slavkoski
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO
{
    private String id;

    private String name;

    private String description;

    /**
     * 0.50 = 50% off.
     */
    private BigDecimal discount;

    private LocalDate validFrom;

    private LocalDate validTo;

    /**
     * If null => applies to all games.
     */
    private String gameId;

    /**
     * Optional convenience field for UI display.
     */
    private String gameName;

    private Boolean active;
}
