package com.vrroom.controller;

import com.vrroom.dto.PricingPreviewDTO;
import com.vrroom.service.PricingService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pricing")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PricingController
{
    private final PricingService pricingService;

    /**
     * Example:
     * GET /pricing/preview?gameId=123&date=2025-11-22&players=4
     */
    @GetMapping("/preview")
    public ResponseEntity<PricingPreviewDTO> previewPrice(
            @RequestParam String gameId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int players)
    {
        return ResponseEntity.ok(pricingService.previewPrice(gameId, date, players));
    }
}
