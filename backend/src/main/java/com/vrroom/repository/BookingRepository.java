package com.vrroom.repository;

import com.vrroom.domain.entity.Booking;
import com.vrroom.domain.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(b.numberOfRooms) FROM Booking b " +
           "WHERE b.bookingDate = :date " +
           "AND b.bookingTime = :time " +
           "AND b.status IN ('PENDING', 'CONFIRMED')")
    Integer countBookedRoomsByDateAndTime(
        @Param("date") LocalDate date,
        @Param("time") LocalTime time
    );

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.bookingGames bg " +
           "LEFT JOIN FETCH bg.game " +
           "WHERE b.id = :id")
    Booking findByIdWithGames(@Param("id") String id);

    @Query("""
        select b.bookingDate as date, b.bookingTime as time, b.status as status,
               b.createdAt as createdAt, b.numberOfRooms as rooms
        from Booking b
        where b.bookingDate between :start and :end
    """)
    List<BookingFlatRow> findFlatForRange(LocalDate start, LocalDate end);

    interface BookingFlatRow {
        LocalDate getDate();
        LocalTime getTime();
        BookingStatus getStatus();
        Instant getCreatedAt();
        Integer getRooms();
    }
}
