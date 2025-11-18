package com.vrroom.service.impl;

import com.vrroom.model.entity.Holiday;
import com.vrroom.model.entity.PricingConfig;
import com.vrroom.model.entity.PricingTier;
import com.vrroom.model.entity.Promotion; // NEW
import com.vrroom.model.entity.SystemConfig;
import com.vrroom.dto.HolidayDTO;
import com.vrroom.dto.PricingConfigDTO;
import com.vrroom.dto.PricingTierDTO;
import com.vrroom.dto.SystemConfigDTO;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.HolidayRepository;
import com.vrroom.repository.PricingConfigRepository;
import com.vrroom.repository.PromotionRepository; // NEW
import com.vrroom.repository.SystemConfigRepository;
import com.vrroom.service.ConfigService;
import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConfigServiceImpl implements ConfigService
{
    private final SystemConfigRepository systemConfigRepository;
    private final PricingConfigRepository pricingConfigRepository;
    private final HolidayRepository holidayRepository;
    private final PromotionRepository promotionRepository; // NEW

    @PostConstruct
    @Transactional
    public void initializeDefaultConfig()
    {
        long systemConfigCount = systemConfigRepository.count();
        if (systemConfigCount == 0)
        {
            SystemConfig systemConfig = SystemConfig.builder()
                    .maxConcurrentBookings(2)
                    .openingTime(LocalTime.of(12, 0))
                    .closingTime(LocalTime.of(22, 0))
                    .slotDurationMinutes(60)
                    .taxPercentage(BigDecimal.valueOf(18.00))
                    .build();
            systemConfigRepository.save(systemConfig);
        }

        long pricingConfigCount = pricingConfigRepository.count();
        if (pricingConfigCount == 0)
        {
            PricingConfig pricingConfig = PricingConfig.builder()
                    .active(true)
                    .build();

            pricingConfig = pricingConfigRepository.save(pricingConfig);

            List<PricingTier> tiers = List.of(
                    PricingTier.builder().pricingConfig(pricingConfig).minPlayers(2).maxPlayers(2).pricePerPlayer(BigDecimal.valueOf(1000))
                            .build(),
                    PricingTier.builder().pricingConfig(pricingConfig).minPlayers(3).maxPlayers(3).pricePerPlayer(BigDecimal.valueOf(950))
                            .build(),
                    PricingTier.builder().pricingConfig(pricingConfig).minPlayers(4).maxPlayers(5).pricePerPlayer(BigDecimal.valueOf(900))
                            .build(),
                    PricingTier.builder().pricingConfig(pricingConfig).minPlayers(6).maxPlayers(6).pricePerPlayer(BigDecimal.valueOf(850))
                            .build());
            pricingConfig.setTiers(tiers);
            pricingConfigRepository.save(pricingConfig);
        }

        long holidayCount = holidayRepository.count();
        if (holidayCount == 0)
        {
            log.info("Creating default holidays...");
            List<Holiday> defaultHolidays = List.of(
                    Holiday.builder().name("New Year's Day").date(LocalDate.of(2025, 1, 1)).active(true).build(),
                    Holiday.builder().name("Christmas Day").date(LocalDate.of(2024, 12, 25)).active(true).build(),
                    Holiday.builder().name("Independence Day").date(LocalDate.of(2025, 9, 8)).active(true).build());
            holidayRepository.saveAll(defaultHolidays);
            log.info("Default holidays created");
        }

        // NEW: create default promotion if none exists
        long promoCount = promotionRepository.count();
        if (promoCount == 0)
        {
            log.info("Creating default promotion: 50% off all games 20–30 November 2025");
            Promotion novPromo = Promotion.builder()
                    .name("November 50% Off")
                    .description("50% discount on all games from 20th to 30th November 2025")
                    .discount(BigDecimal.valueOf(0.50)) // 50% off
                    .validFrom(LocalDate.of(2025, 11, 20))
                    .validTo(LocalDate.of(2025, 11, 30))
                    .game(null) // null => applies to ALL games
                    .active(true)
                    .build();
            promotionRepository.save(novPromo);
        }
    }

    @Override
    public SystemConfigDTO getSystemConfig()
    {
        SystemConfig systemConfig = systemConfigRepository.findLatestConfig()
                .orElseThrow(() -> new ResourceNotFoundException("System configuration not found"));

        PricingConfigDTO pricingConfigDTO = getActivePricingConfig();
        List<HolidayDTO> holidays = getActiveHolidays();

        return SystemConfigDTO.builder()
                .id(systemConfig.getId())
                .maxConcurrentBookings(systemConfig.getMaxConcurrentBookings())
                .openingTime(systemConfig.getOpeningTime())
                .closingTime(systemConfig.getClosingTime())
                .slotDurationMinutes(systemConfig.getSlotDurationMinutes())
                .pricingConfig(pricingConfigDTO)
                .holidays(holidays)
                .taxPercentage(systemConfig.getTaxPercentage())
                .build();
    }

    @Override
    public PricingConfigDTO getActivePricingConfig()
    {
        PricingConfig pricingConfig = pricingConfigRepository.findActiveConfig()
                .orElseThrow(() -> new ResourceNotFoundException("Active pricing configuration not found"));

        return mapPricingToDTO(pricingConfig);
    }

    @Override
    @Transactional
    public PricingConfigDTO createPricingConfig(PricingConfigDTO pricingConfigDTO)
    {
        log.info("Creating new pricing configuration");
        PricingConfig pricingConfig = PricingConfig.builder()
                .active(true)
                .build();

        PricingConfig saved = pricingConfigRepository.save(pricingConfig);
        log.info("Pricing configuration created with id: {}", saved.getId());
        return mapPricingToDTO(saved);
    }

    @Override
    @Transactional
    public PricingConfigDTO updatePricingConfig(String id, PricingConfigDTO pricingConfigDTO)
    {
        log.info("Updating pricing configuration with id: {}", id);
        PricingConfig pricingConfig = pricingConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing configuration not found with id: " + id));

        pricingConfig.setActive(pricingConfigDTO.getActive());

        PricingConfig updated = pricingConfigRepository.save(pricingConfig);
        log.info("Pricing configuration updated");
        return mapPricingToDTO(updated);
    }

    @Override
    public List<HolidayDTO> getAllHolidays()
    {
        return holidayRepository.findAll().stream()
                .map(this::mapHolidayToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<HolidayDTO> getActiveHolidays()
    {
        return holidayRepository.findByActiveTrue().stream()
                .map(this::mapHolidayToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HolidayDTO createHoliday(HolidayDTO holidayDTO)
    {
        log.info("Creating holiday: {}", holidayDTO.getName());
        Holiday holiday = Holiday.builder()
                .name(holidayDTO.getName())
                .date(holidayDTO.getDate())
                .active(true)
                .build();

        Holiday saved = holidayRepository.save(holiday);
        log.info("Holiday created with id: {}", saved.getId());
        return mapHolidayToDTO(saved);
    }

    @Override
    @Transactional
    public HolidayDTO updateHoliday(String id, HolidayDTO holidayDTO)
    {
        log.info("Updating holiday with id: {}", id);
        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));

        holiday.setName(holidayDTO.getName());
        holiday.setDate(holidayDTO.getDate());
        holiday.setActive(holidayDTO.getActive());

        Holiday updated = holidayRepository.save(holiday);
        log.info("Holiday updated");
        return mapHolidayToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteHoliday(String id)
    {
        log.info("Deleting holiday with id: {}", id);
        if (!holidayRepository.existsById(id))
        {
            throw new ResourceNotFoundException("Holiday not found with id: " + id);
        }
        holidayRepository.deleteById(id);
        log.info("Holiday deleted");
    }

    @Override
    public boolean isHoliday(LocalDate date)
    {
        return holidayRepository.existsByDateAndActiveTrue(date);
    }

    private PricingConfigDTO mapPricingToDTO(PricingConfig pc)
    {
        return PricingConfigDTO.builder()
                .id(pc.getId())
                .active(pc.getActive())
                .tiers(pc.getTiers().stream().map(t -> PricingTierDTO.builder()
                        .id(t.getId())
                        .minPlayers(t.getMinPlayers())
                        .maxPlayers(t.getMaxPlayers())
                        .pricePerPlayer(t.getPricePerPlayer())
                        .build()).toList())
                .build();
    }

    private HolidayDTO mapHolidayToDTO(Holiday holiday)
    {
        return HolidayDTO.builder()
                .id(holiday.getId())
                .name(holiday.getName())
                .date(holiday.getDate())
                .active(holiday.getActive())
                .build();
    }
}
