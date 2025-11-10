package com.vrroom.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayDTO
{
    private String id;
    private String name;
    private LocalDate date;
    private Boolean active;
}
