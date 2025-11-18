package com.vrroom.repository;

import com.vrroom.model.entity.PricingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PricingConfigRepository extends JpaRepository<PricingConfig, String> {

    @Query("SELECT pc FROM PricingConfig pc WHERE pc.active = true ORDER BY pc.createdAt DESC LIMIT 1")
    Optional<PricingConfig> findActiveConfig();
}
