package com.vrroom.controller;

import com.vrroom.dto.HolidayDTO;
import com.vrroom.dto.PricingConfigDTO;
import com.vrroom.dto.SystemConfigDTO;
import com.vrroom.service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ConfigController {

    private final ConfigService configService;

    @GetMapping
    public ResponseEntity<SystemConfigDTO> getSystemConfig() {
        return ResponseEntity.ok(configService.getSystemConfig());
    }

    @GetMapping("/pricing")
    public ResponseEntity<PricingConfigDTO> getActivePricingConfig() {
        return ResponseEntity.ok(configService.getActivePricingConfig());
    }

    @PostMapping("/pricing")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingConfigDTO> createPricingConfig(@Valid @RequestBody PricingConfigDTO pricingConfigDTO) {
        PricingConfigDTO created = configService.createPricingConfig(pricingConfigDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/pricing/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingConfigDTO> updatePricingConfig(
            @PathVariable String id,
            @Valid @RequestBody PricingConfigDTO pricingConfigDTO) {
        return ResponseEntity.ok(configService.updatePricingConfig(id, pricingConfigDTO));
    }

    @GetMapping("/holidays")
    public ResponseEntity<List<HolidayDTO>> getAllHolidays() {
        return ResponseEntity.ok(configService.getAllHolidays());
    }

    @GetMapping("/holidays/active")
    public ResponseEntity<List<HolidayDTO>> getActiveHolidays() {
        return ResponseEntity.ok(configService.getActiveHolidays());
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HolidayDTO> createHoliday(@Valid @RequestBody HolidayDTO holidayDTO) {
        HolidayDTO created = configService.createHoliday(holidayDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/holidays/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HolidayDTO> updateHoliday(
            @PathVariable String id,
            @Valid @RequestBody HolidayDTO holidayDTO) {
        return ResponseEntity.ok(configService.updateHoliday(id, holidayDTO));
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteHoliday(@PathVariable String id) {
        configService.deleteHoliday(id);
        return ResponseEntity.noContent().build();
    }
}
