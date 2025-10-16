package com.vrroom.service;

import com.vrroom.dto.BookingDTO;

public interface PaymentService {

    String createCheckoutSession(BookingDTO booking) throws Exception;

    boolean verifyWebhookSignature(String payload, String signature);

    void handleSuccessfulPayment(String sessionId) throws Exception;

    void handleFailedPayment(String sessionId) throws Exception;
}
