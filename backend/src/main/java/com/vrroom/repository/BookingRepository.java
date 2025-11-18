package com.vrroom.repository;

import com.vrroom.model.entity.Booking;
import com.vrroom.model.enums.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String>
{
    List<Booking> findByUserId(String userId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByBookingDate(LocalDate bookingDate);
    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    // ✅ Count rooms via BookingGame, not Booking.numberOfRooms
    @Query("""
        select count(distinct bg.roomNumber) from BookingGame bg
        join bg.booking b
        where b.bookingDate = :date
          and b.bookingTime = :time
          and b.status in (
              com.vrroom.model.enums.BookingStatus.PENDING,
              com.vrroom.model.enums.BookingStatus.CONFIRMED
          )
    """)
    Integer countBookedRoomsByDateAndTime(@Param("date") LocalDate date,
                                       @Param("time") LocalTime time);

    @Query("""
        select b from Booking b
        left join fetch b.bookingGames bg
        left join fetch bg.game
        where b.id = :id
    """)
    Booking findByIdWithGames(@Param("id") String id);

    // ✅ Flat view: compute rooms as count(distinct bg.roomNumber)
    @Query("""
        select b.bookingDate as date,
               b.bookingTime as time,
               b.status      as status,
               b.createdAt   as createdAt,
               count(distinct bg.roomNumber) as rooms
        from Booking b
        left join b.bookingGames bg
        where b.bookingDate between :start and :end
        group by b.bookingDate, b.bookingTime, b.status, b.createdAt
    """)
    List<BookingFlatRow> findFlatForRange(@Param("start") LocalDate start,
                                          @Param("end") LocalDate end);

    interface BookingFlatRow {
        LocalDate getDate();
        LocalTime getTime();
        BookingStatus getStatus();
        Instant getCreatedAt();
        Integer getRooms(); // <- count() returns Long
    }
}
