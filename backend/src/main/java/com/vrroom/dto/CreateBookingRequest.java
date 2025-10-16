package com.vrroom.dto;

import com.vrroom.domain.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be today or in the future")
    private LocalDate bookingDate;

    @NotNull(message = "Booking time is required")
    private LocalTime bookingTime;

    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "At least 1 room is required")
    @Max(value = 10, message = "Maximum 10 rooms allowed")
    private Integer numberOfRooms;

    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total price must be greater than 0")
    private BigDecimal totalPrice;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Customer first name is required")
    private String customerFirstName;

    @NotBlank(message = "Customer last name is required")
    private String customerLastName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    @NotBlank(message = "Customer phone is required")
    private String customerPhone;

    @NotEmpty(message = "At least one game must be selected")
    private List<BookingGameRequest> games;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingGameRequest {
        @NotBlank(message = "Game ID is required")
        private String gameId;

        @NotNull(message = "Room number is required")
        @Min(value = 1, message = "Room number must be at least 1")
        private Integer roomNumber;

        @NotNull(message = "Player count is required")
        @Min(value = 1, message = "At least 1 player is required")
        private Integer playerCount;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        private BigDecimal price;
    }
}
