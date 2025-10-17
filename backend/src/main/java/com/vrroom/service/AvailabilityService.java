package com.vrroom.service;

import com.vrroom.dto.Availability;
import java.time.*;
import java.util.*;

public interface AvailabilityService
{
    List<Availability.DayScheduleDto> getAvailabilityForRange(LocalDate startDate, LocalDate endDate, String gameId);
}
