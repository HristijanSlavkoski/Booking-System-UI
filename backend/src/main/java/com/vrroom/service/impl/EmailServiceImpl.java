package com.vrroom.service.impl;

import com.vrroom.dto.BookingDTO;
import com.vrroom.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService
{

    private final JavaMailSender mailSender;

    @Value("${email.from}")
    private String emailFrom;

    @Value("${email.from-name}")
    private String emailFromName;

    @Value("${email.enabled}")
    private boolean emailEnabled;

    @Override
    public void sendBookingConfirmation(BookingDTO booking)
    {
        if (!emailEnabled)
        {
            log.info("Email disabled, skipping booking confirmation email");
            return;
        }

        try
        {
            String subject = "Booking Confirmation - VR Escape Room";
            String body = buildBookingConfirmationEmail(booking);
            sendEmail(booking.getCustomerEmail(), subject, body);
            log.info("✅ Booking confirmation email sent to: {}", booking.getCustomerEmail());
        }
        catch (Exception e)
        {
            log.error("Failed to send booking confirmation email", e);
        }
    }

    @Override
    public void sendBookingCancellation(BookingDTO booking)
    {
        if (!emailEnabled)
        {
            log.info("Email disabled, skipping cancellation email");
            return;
        }

        try
        {
            String subject = "Booking Cancelled - VR Escape Room";
            String body = buildBookingCancellationEmail(booking);
            sendEmail(booking.getCustomerEmail(), subject, body);
            log.info("✅ Booking cancellation email sent to: {}", booking.getCustomerEmail());
        }
        catch (Exception e)
        {
            log.error("Failed to send booking cancellation email", e);
        }
    }

    @Override
    public void sendPaymentConfirmation(BookingDTO booking)
    {
        if (!emailEnabled)
        {
            log.info("Email disabled, skipping payment confirmation email");
            return;
        }

        try
        {
            String subject = "Payment Confirmed - VR Escape Room";
            String body = buildPaymentConfirmationEmail(booking);
            sendEmail(booking.getCustomerEmail(), subject, body);
            log.info("✅ Payment confirmation email sent to: {}", booking.getCustomerEmail());
        }
        catch (Exception e)
        {
            log.error("Failed to send payment confirmation email", e);
        }
    }

    private void sendEmail(String to, String subject, String body) throws MessagingException, UnsupportedEncodingException
    {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(emailFrom, emailFromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);

        mailSender.send(message);
    }

    private String buildBookingConfirmationEmail(BookingDTO booking)
    {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                                .detail-label { font-weight: bold; color: #667eea; }
                                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
                                .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>🎮 Booking Confirmed!</h1>
                                </div>
                                <div class="content">
                                    <p>Dear %s,</p>
                                    <p>Your VR Escape Room booking has been confirmed! Get ready for an amazing adventure!</p>

                                    <div class="booking-details">
                                        <h3>Booking Details</h3>
                                        <div class="detail-row">
                                            <span class="detail-label">Booking ID:</span>
                                            <span>%s</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Date:</span>
                                            <span>%s</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Time:</span>
                                            <span>%s</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Number of Rooms:</span>
                                            <span>%d</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Total Price:</span>
                                            <span>%s MKD</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Payment Method:</span>
                                            <span>%s</span>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-label">Status:</span>
                                            <span>%s</span>
                                        </div>
                                    </div>

                                    <p><strong>Important Information:</strong></p>
                                    <ul>
                                        <li>Please arrive 15 minutes before your scheduled time</li>
                                        <li>Bring a valid ID for check-in</li>
                                        <li>Comfortable clothing recommended</li>
                                        <li>Minimum age requirement: 12 years old</li>
                                    </ul>

                                    <p>If you need to cancel or modify your booking, please contact us at least 24 hours in advance.</p>

                                    <p>See you soon! 🚀</p>
                                </div>
                                <div class="footer">
                                    <p>VR Escape Room - Immersive Virtual Reality Experiences</p>
                                    <p>Contact: info@vrroom.com | Phone: +389 70 123 456</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                booking.getCustomerFirstName(),
                booking.getId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getNumberOfRooms(),
                booking.getTotalPrice(),
                booking.getPaymentMethod(),
                booking.getStatus());
    }

    private String buildBookingCancellationEmail(BookingDTO booking)
    {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Booking Cancelled</h1>
                                </div>
                                <div class="content">
                                    <p>Dear %s,</p>
                                    <p>Your booking (ID: %s) scheduled for %s at %s has been cancelled.</p>
                                    <p>If you have any questions or would like to make a new booking, please don't hesitate to contact us.</p>
                                    <p>We hope to see you soon!</p>
                                </div>
                                <div class="footer">
                                    <p>VR Escape Room | Contact: info@vrroom.com</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                booking.getCustomerFirstName(),
                booking.getId(),
                booking.getBookingDate(),
                booking.getBookingTime());
    }

    private String buildPaymentConfirmationEmail(BookingDTO booking)
    {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #11998e 0%%, #38ef7d 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                                .payment-success { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #38ef7d; }
                                .amount { font-size: 32px; color: #11998e; font-weight: bold; }
                                .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>✅ Payment Confirmed!</h1>
                                </div>
                                <div class="content">
                                    <p>Dear %s,</p>
                                    <p>Thank you! Your payment has been successfully processed.</p>

                                    <div class="payment-success">
                                        <h2>Payment Received</h2>
                                        <div class="amount">%s MKD</div>
                                        <p>Transaction ID: %s</p>
                                    </div>

                                    <p><strong>Booking Details:</strong></p>
                                    <ul>
                                        <li>Date: %s</li>
                                        <li>Time: %s</li>
                                        <li>Number of Rooms: %d</li>
                                    </ul>

                                    <p>Your booking is now fully confirmed. We're looking forward to your visit!</p>
                                </div>
                                <div class="footer">
                                    <p>VR Escape Room | Contact: info@vrroom.com</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                booking.getCustomerFirstName(),
                booking.getTotalPrice(),
                booking.getId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getNumberOfRooms());
    }
}
