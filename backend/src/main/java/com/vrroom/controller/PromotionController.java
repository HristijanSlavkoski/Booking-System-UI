package com.vrroom.controller;

import com.vrroom.dto.PromotionDTO;
import com.vrroom.service.PromotionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PromotionController
{
    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getAllPromotions()
    {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions()
    {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionDTO dto)
    {
        PromotionDTO created = promotionService.createPromotion(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDTO> updatePromotion(
            @PathVariable String id,
            @RequestBody PromotionDTO dto)
    {
        return ResponseEntity.ok(promotionService.updatePromotion(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePromotion(@PathVariable String id)
    {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }
}
