package com.vrroom.dto;

import com.vrroom.model.enums.BookingStatus;
import com.vrroom.model.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private String id;
    private String userId;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Integer numberOfRooms;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private PaymentMethod paymentMethod;
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;
    private List<BookingGameDTO> bookingGames;
    private LocalDateTime createdAt;
    private String paymentUrl;
}
