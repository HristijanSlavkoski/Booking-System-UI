package com.vrroom.service;

import com.vrroom.dto.BookingDTO;
import com.vrroom.dto.CreateBookingRequest;
import com.vrroom.model.enums.BookingStatus;
import java.util.List;

public interface BookingService
{
    List<BookingDTO> getAllBookings();

    List<BookingDTO> getBookingsByUserId(String userId);

    List<BookingDTO> getBookingsByStatus(BookingStatus status);

    BookingDTO getBookingById(String id);

    BookingDTO createBooking(CreateBookingRequest request, String userId) throws Exception;

    BookingDTO updateBookingStatus(String id, BookingStatus status);

    void cancelBooking(String id);
}
