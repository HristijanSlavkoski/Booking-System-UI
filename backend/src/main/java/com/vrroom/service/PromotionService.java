package com.vrroom.service;

import com.vrroom.dto.PromotionDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromotionService
{
    List<PromotionDTO> getAllPromotions();

    List<PromotionDTO> getActivePromotions();

    PromotionDTO createPromotion(PromotionDTO dto);

    PromotionDTO updatePromotion(String id, PromotionDTO dto);

    void deletePromotion(String id);

    /**
     * Returns the best (highest discount) promotion for this game & date, if any.
     * gameId can be null to look only at global promos.
     */
    Optional<PromotionDTO> findBestPromotionForGameAndDate(String gameId, LocalDate date);

    /**
     * Convenience: just the discount fraction double (0.5 = 50%).
     */
    double resolveDiscountForGameAndDate(String gameId, LocalDate date);
}
