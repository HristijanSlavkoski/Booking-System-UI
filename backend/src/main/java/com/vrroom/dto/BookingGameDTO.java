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
public class BookingGameDTO {
    private String id;
    private String gameId;
    private String gameName;
    private Integer roomNumber;
    private Integer playerCount;
    private BigDecimal price;
}
