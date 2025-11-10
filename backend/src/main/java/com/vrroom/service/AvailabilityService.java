package com.vrroom.service;

import com.vrroom.dto.Availability;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

public interface AvailabilityService
{
    @Transactional
    boolean isSlotAvailable(LocalDate date, LocalTime time, Integer requestedRooms);

    List<Availability.DayScheduleDto> getAvailabilityForRange(LocalDate startDate, LocalDate endDate, String gameId);
}
