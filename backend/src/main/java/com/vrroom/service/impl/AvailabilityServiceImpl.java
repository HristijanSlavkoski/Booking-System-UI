package com.vrroom.service.impl;

import com.vrroom.domain.entity.SystemConfig;
import com.vrroom.domain.enums.BookingStatus;
import com.vrroom.dto.Availability.DayScheduleDto;
import com.vrroom.dto.Availability.TimeSlotAvailabilityDto;
import com.vrroom.repository.BookingRepository;
import com.vrroom.repository.SystemConfigRepository;
import com.vrroom.service.AvailabilityService;
import io.micrometer.common.lang.Nullable;
import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
// TODO: Make it interface
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService
{

    private final SystemConfigRepository systemConfigRepository;

    private final BookingRepository bookingRepository;

    private static final Duration HOLD_WINDOW = Duration.ofMinutes(15);

    public List<DayScheduleDto> getAvailabilityForRange(LocalDate start, LocalDate end, @Nullable String maybeGameId)
    {
        if (end.isBefore(start))
            throw new IllegalArgumentException("endDate must be >= startDate");

        final Optional<SystemConfig> cfg = systemConfigRepository.findLatestConfig();
        if (cfg.isEmpty())
        {
            // TODO: Error
            return null;
        }
        final int maxConcurrent = cfg.get().getMaxConcurrentBookings(); // e.g. 2
        final LocalTime open = cfg.get().getOpeningTime(); // e.g. 12:00
        final LocalTime close = cfg.get().getClosingTime(); // e.g. 21:00
        final int slotMins = cfg.get().getSlotDurationMinutes(); // e.g. 60

        final Map<String, Integer> roomsTaken = preloadRoomsTaken(start, end, maybeGameId);

        final List<String> times = generateTimes(open, close, slotMins);
        final LocalDate today = LocalDate.now();

        List<DayScheduleDto> days = new ArrayList<>();
        LocalDate cursor = start;

        while (!cursor.isAfter(end))
        {
            final LocalDate day = cursor;
            String dayName = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            List<TimeSlotAvailabilityDto> slots = times.stream()
                    .map(t -> buildSlot(day, t, today, maxConcurrent, roomsTaken))
                    .toList();

            days.add(new DayScheduleDto(day, day.toString(), dayName, slots));
            cursor = cursor.plusDays(1);
        }

        return days;
    }

    /** One pass over bookings → map key "YYYY-MM-DD|HH:mm" -> rooms taken */
    private Map<String, Integer> preloadRoomsTaken(
            LocalDate start, LocalDate end, @Nullable String maybeGameId)
    {
        final Instant now = Instant.now();
        final Instant holdCutoff = now.minus(HOLD_WINDOW);

        // ----- If rooms are generic -----
        List<BookingRepository.BookingFlatRow> rows = bookingRepository.findFlatForRange(start, end);

        Map<String, Integer> map = new HashMap<>();
        for (var r : rows)
        {
            // Treat PENDING as occupied only if still within hold window
            if (r.getStatus() == BookingStatus.PENDING && r.getCreatedAt().isBefore(holdCutoff))
            {
                continue; // expired hold → ignore
            }

            String key = key(r.getDate(), r.getTime());
            map.merge(key, safeRooms(r.getRooms()), Integer::sum);
        }
        return map;
    }

    private static int safeRooms(Integer n)
    {
        return n == null ? 0 : Math.max(0, n);
    }

    private static String key(LocalDate d, LocalTime t)
    {
        return d + "|" + t.truncatedTo(ChronoUnit.MINUTES).toString(); // "2025-10-29|10:00"
    }

    private List<String> generateTimes(LocalTime open, LocalTime close, int mins)
    {
        List<String> slots = new ArrayList<>();
        LocalTime t = open;
        while (t.isBefore(close))
        {
            slots.add(t.truncatedTo(ChronoUnit.MINUTES).toString()); // "HH:mm"
            t = t.plusMinutes(mins);
        }
        return slots;
    }

    private TimeSlotAvailabilityDto buildSlot(
            LocalDate day,
            String timeStr,
            LocalDate today,
            int maxConcurrent,
            Map<String, Integer> roomsTaken)
    {
        // Past slots are unavailable
        if (isPast(day, timeStr, today))
        {
            return new TimeSlotAvailabilityDto(timeStr, "unavailable", 0, maxConcurrent);
        }

        final int booked = roomsTaken.getOrDefault(day + "|" + timeStr, 0);
        final int available = Math.max(0, maxConcurrent - booked);

        String status = available > 0 ? "available" : "booked";
        return new TimeSlotAvailabilityDto(timeStr, status, available, maxConcurrent);
    }

    private boolean isPast(LocalDate day, String timeStr, LocalDate today)
    {
        final LocalTime time = LocalTime.parse(timeStr); // "HH:mm"
        final LocalDateTime dt = LocalDateTime.of(day, time);
        return dt.isBefore(LocalDateTime.now());
    }
}
