package com.vrroom.service;

import com.vrroom.dto.HolidayDTO;
import com.vrroom.dto.PricingConfigDTO;
import com.vrroom.dto.SystemConfigDTO;

import java.time.LocalDate;
import java.util.List;

public interface ConfigService {

    SystemConfigDTO getSystemConfig();

    PricingConfigDTO getActivePricingConfig();

    PricingConfigDTO createPricingConfig(PricingConfigDTO pricingConfigDTO);

    PricingConfigDTO updatePricingConfig(String id, PricingConfigDTO pricingConfigDTO);

    List<HolidayDTO> getAllHolidays();

    List<HolidayDTO> getActiveHolidays();

    HolidayDTO createHoliday(HolidayDTO holidayDTO);

    HolidayDTO updateHoliday(String id, HolidayDTO holidayDTO);

    void deleteHoliday(String id);

    boolean isHoliday(LocalDate date);
}
