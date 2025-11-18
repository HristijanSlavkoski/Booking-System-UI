package com.vrroom.repository;

import com.vrroom.model.entity.BookingGame;
import com.vrroom.model.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingGameRepository extends JpaRepository<BookingGame, String>
{

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                select bg from BookingGame bg
                join fetch bg.booking b
                where b.bookingDate = :date and b.bookingTime = :time
                  and b.status in (:statuses)
            """)
    List<BookingGame> lockGamesForSlot(@Param("date") LocalDate date,
            @Param("time") LocalTime time,
            @Param("statuses") List<BookingStatus> statuses);

    boolean existsByBooking_BookingDateAndBooking_BookingTimeAndRoomNumberAndBooking_StatusIn(
            LocalDate date, LocalTime time, Integer roomNumber, List<BookingStatus> statuses);
}
