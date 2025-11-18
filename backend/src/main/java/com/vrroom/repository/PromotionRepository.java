package com.vrroom.repository;

import com.vrroom.model.entity.Promotion;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PromotionRepository extends JpaRepository<Promotion, String>
{
    List<Promotion> findAllByActiveTrue();

    /**
     * Returns all active promotions that apply to the given game (or all games)
     * for the given date.
     *
     * - Global promos: p.game IS NULL
     * - Game-specific promos: p.game.id = :gameId
     */
    @Query("""
            SELECT p FROM Promotion p
            WHERE p.active = true
              AND p.validFrom <= :date
              AND p.validTo >= :date
              AND (p.game IS NULL OR p.game.id = :gameId)
            """)
    List<Promotion> findActiveForGameOrGlobal(
            @Param("gameId") String gameId,
            @Param("date") LocalDate date);
}
