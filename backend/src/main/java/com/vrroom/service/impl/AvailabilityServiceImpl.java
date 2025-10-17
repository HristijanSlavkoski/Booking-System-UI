package com.vrroom.service.impl;

import com.vrroom.dto.Availability.DayScheduleDto;
import com.vrroom.dto.Availability.TimeSlotAvailabilityDto;
import com.vrroom.service.AvailabilityService;
import java.time.*;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
// TODO: Make it interface
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService
{

    // how many rooms you can run in parallel
    @Value("${vrroom.max-concurrent-bookings:2}")
    private int maxConcurrentBookings;

    // Example: 09:00–21:00 inclusive, step 60 minutes
    private static final int START_HOUR = 9;
    private static final int END_HOUR = 21;
    private static final int STEP_MINUTES = 60;

    // Inject your repositories here
    // private final BookingRepository bookingRepository;
    // private final ReservationRepository reservationRepository;

    public List<DayScheduleDto> getAvailabilityForRange(
            LocalDate start, LocalDate end, String maybeGameId)
    {
        if (end.isBefore(start))
        {
            throw new IllegalArgumentException("endDate must be >= startDate");
        }

        List<String> times = generateTimes();

        List<DayScheduleDto> days = new ArrayList<>();
        LocalDate cursor = start;
        LocalDate today = LocalDate.now();

        while (!cursor.isAfter(end))
        {
            final LocalDate day = cursor;
            String dayName = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            List<TimeSlotAvailabilityDto> slots = times.stream()
                    .map(t -> buildSlot(day, t, today, maybeGameId))
                    .collect(Collectors.toList());

            days.add(new DayScheduleDto(day, day.toString(), dayName, slots));

            cursor = cursor.plusDays(1);
        }

        return days;
    }

    private List<String> generateTimes()
    {
        return IntStream.iterate(START_HOUR, h -> h + (STEP_MINUTES / 60))
                .limit(((END_HOUR - START_HOUR) * 60) / STEP_MINUTES + 1)
                .mapToObj(h -> String.format("%02d:%02d", h, 0))
                .collect(Collectors.toList());
    }

    private TimeSlotAvailabilityDto buildSlot(
            LocalDate date, String time, LocalDate today, String gameId)
    {
        // Past times are unavailable
        boolean isPast = isPast(date, time, today);
        if (isPast)
        {
            return new TimeSlotAvailabilityDto(time, "unavailable", 0, maxConcurrentBookings);
        }

        // ====== TODO: replace with real DB counts ======
        // Example idea:
        // int activeBookings = bookingRepository.countConfirmedByDateAndTimeAndGame(date, time,
        // gameId);
        // int holds = reservationRepository.countActiveHoldsByDateAndTimeAndGame(date, time, gameId);
        int activeBookings = 0;
        int holds = 0;
        // ===============================================

        int used = activeBookings + holds;
        int remaining = Math.max(0, maxConcurrentBookings - used);

        if (activeBookings >= maxConcurrentBookings)
        {
            return new TimeSlotAvailabilityDto(time, "booked", 0, maxConcurrentBookings);
        }
        else if (holds > 0 && remaining > 0)
        {
            return new TimeSlotAvailabilityDto(time, "reserved", remaining, maxConcurrentBookings);
        }
        else
        {
            return new TimeSlotAvailabilityDto(time, "available", remaining, maxConcurrentBookings);
        }
    }

    private boolean isPast(LocalDate date, String time, LocalDate today)
    {
        if (date.isBefore(today))
            return true;
        if (date.isAfter(today))
            return false;

        // same day: compare time
        LocalTime slotTime = LocalTime.of(
                Integer.parseInt(time.substring(0, 2)), Integer.parseInt(time.substring(3, 5)));
        return slotTime.isBefore(LocalTime.now());
    }
}
