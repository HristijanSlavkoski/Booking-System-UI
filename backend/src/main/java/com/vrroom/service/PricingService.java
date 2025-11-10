package com.vrroom.service;

import com.vrroom.dto.CreateBookingRequest;
import java.math.BigDecimal;
import java.time.LocalDate;

import com.vrroom.dto.PricingPreviewDTO;
import org.springframework.transaction.annotation.Transactional;

public interface PricingService
{
    @Transactional
    BigDecimal calculateTotalPriceForBooking(CreateBookingRequest req);

    /**
     * Preview pricing for a single game/date/player count without creating a booking.
     */
    PricingPreviewDTO previewPrice(String gameId, LocalDate date, int players);
}

