package com.vrroom.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingGameDTO
{
    private String id;
    private String gameId;
    private String gameName;
    private Integer roomNumber;
    private Integer playerCount;
    private BigDecimal price;
}
