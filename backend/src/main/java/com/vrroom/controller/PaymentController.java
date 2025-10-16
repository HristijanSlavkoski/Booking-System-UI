package com.vrroom.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.vrroom.dto.BookingDTO;
import com.vrroom.service.BookingService;
import com.vrroom.service.PaymentService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final BookingService bookingService;

    @PostMapping("/create-checkout-session/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@PathVariable String bookingId) {
        try {
            BookingDTO booking = bookingService.getBookingById(bookingId);
            String checkoutUrl = paymentService.createCheckoutSession(booking);

            return ResponseEntity.ok(Map.of(
                    "checkoutUrl", checkoutUrl,
                    "sessionId", checkoutUrl.substring(checkoutUrl.lastIndexOf("/") + 1)
            ));
        } catch (Exception e) {
            log.error("Failed to create checkout session", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to create payment session: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(name = "Stripe-Signature", required = false) String sigHeader) {

        log.info("Received Stripe webhook");

        if (sigHeader == null) {
            log.warn("Missing Stripe-Signature header");
            return ResponseEntity.badRequest().body("Missing Stripe-Signature");
        }

        final Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, paymentService.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid webhook signature", e);
            return ResponseEntity.status(400).body("Invalid signature");
        }

        log.info("Processing event: {}", event.getType());

        try {
            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    var obj = event.getDataObjectDeserializer().getObject().orElse(null);
                    if (obj instanceof com.stripe.model.checkout.Session s) {
                        paymentService.handleSuccessfulPayment(s.getId());
                    }
                }
                case "checkout.session.expired" -> {
                    var obj = event.getDataObjectDeserializer().getObject().orElse(null);
                    if (obj instanceof com.stripe.model.checkout.Session s) {
                        paymentService.handleFailedPayment(s.getId());
                    }
                }
                default -> log.info("Unhandled event type: {}", event.getType());
            }
            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            return ResponseEntity.status(500).body("Webhook processing failed");
        }
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getSessionStatus(@PathVariable String sessionId) {
        try {
            Session session = Session.retrieve(sessionId);
            return ResponseEntity.ok(Map.of(
                    "status", session.getPaymentStatus(),
                    "bookingId", session.getMetadata().getOrDefault("booking_id", "")
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve session", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }
}
