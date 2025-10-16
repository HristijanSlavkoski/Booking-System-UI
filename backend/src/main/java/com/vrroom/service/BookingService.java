package com.vrroom.service;

import com.vrroom.domain.enums.BookingStatus;
import com.vrroom.dto.BookingDTO;
import com.vrroom.dto.CreateBookingRequest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingService {

    List<BookingDTO> getAllBookings();

    List<BookingDTO> getBookingsByUserId(String userId);

    List<BookingDTO> getBookingsByStatus(BookingStatus status);

    BookingDTO getBookingById(String id);

    BookingDTO createBooking(CreateBookingRequest request, String userId);

    BookingDTO updateBookingStatus(String id, BookingStatus status);

    void cancelBooking(String id);

    Integer getAvailableSlots(LocalDate date, LocalTime time);

    boolean isSlotAvailable(LocalDate date, LocalTime time, Integer requestedRooms);
}
