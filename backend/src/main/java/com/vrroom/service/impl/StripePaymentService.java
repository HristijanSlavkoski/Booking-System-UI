package com.vrroom.service.impl;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.vrroom.domain.enums.BookingStatus;
import com.vrroom.dto.BookingDTO;
import com.vrroom.service.BookingService;
import com.vrroom.service.EmailService;
import com.vrroom.service.PaymentService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripePaymentService implements PaymentService {

    private final BookingService bookingService;
    private final EmailService emailService;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        log.info("✅ Stripe initialized");
    }

    @Override
    public String createCheckoutSession(BookingDTO booking) throws Exception {
        log.info("Creating Stripe checkout session for booking: {}", booking.getId());

        BigDecimal totalPrice = booking.getTotalPrice();
        long amountInCents = totalPrice.multiply(BigDecimal.valueOf(100)).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("mkd")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("VR Escape Room Booking")
                                                                .setDescription(
                                                                        String.format("Booking for %d rooms on %s at %s - %s %s",
                                                                                booking.getNumberOfRooms(),
                                                                                booking.getBookingDate(),
                                                                                booking.getBookingTime(),
                                                                                booking.getCustomerFirstName(),
                                                                                booking.getCustomerLastName())
                                                                )
                                                                .build()
                                                )
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                )
                .putMetadata("booking_id", booking.getId())
                .putMetadata("user_email", booking.getCustomerEmail())
                .build();

        Session session = Session.create(params);

        log.info("✅ Stripe checkout session created: {}", session.getId());
        return session.getUrl();
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);
            log.info("✅ Webhook signature verified for event: {}", event.getType());
            return true;
        } catch (SignatureVerificationException e) {
            log.error("⚠️ Webhook signature verification failed", e);
            return false;
        }
    }

    @Override
    public void handleSuccessfulPayment(String sessionId) throws Exception {
        log.info("Processing successful payment for session: {}", sessionId);

        Session session = Session.retrieve(sessionId);
        String bookingId = session.getMetadata().get("booking_id");

        if (bookingId != null) {
            BookingDTO booking = bookingService.updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
            emailService.sendPaymentConfirmation(booking);
            log.info("✅ Booking {} confirmed after successful payment", bookingId);
        } else {
            log.warn("⚠️ No booking ID found in session metadata");
        }
    }

    @Override
    public void handleFailedPayment(String sessionId) throws Exception {
        log.info("Processing failed payment for session: {}", sessionId);

        Session session = Session.retrieve(sessionId);
        String bookingId = session.getMetadata().get("booking_id");

        if (bookingId != null) {
            BookingDTO booking = bookingService.updateBookingStatus(bookingId, BookingStatus.CANCELLED);
            emailService.sendBookingCancellation(booking);
            log.info("Booking {} cancelled after failed payment", bookingId);
        }
    }
}
