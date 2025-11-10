package com.vrroom.service;

import com.vrroom.dto.BookingDTO;

public interface EmailService
{
    void sendBookingConfirmation(BookingDTO booking);

    void sendBookingCancellation(BookingDTO booking);

    void sendPaymentConfirmation(BookingDTO booking);
}
