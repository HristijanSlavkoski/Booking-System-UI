package com.vrroom.dto;

/**
 * @author Hristijan Slavkoski
 */
import java.time.LocalDate;
import java.util.List;

public class Availability
{
    public record TimeSlotAvailabilityDto(
            String time, String status, int availableSpots, int maxSpots)
    {
    }

    public record DayScheduleDto(
            LocalDate date, String dateString, String dayName, List<TimeSlotAvailabilityDto> slots)
    {
    }
}
