package com.vrroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigDTO {
    private String id;
    private Integer maxConcurrentBookings;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Integer slotDurationMinutes;
    private PricingConfigDTO pricingConfig;
    private BigDecimal taxPercentage;
    private List<HolidayDTO> holidays;
}
