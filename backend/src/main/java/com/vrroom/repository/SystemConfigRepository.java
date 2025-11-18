package com.vrroom.repository;

import com.vrroom.model.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {

    @Query("SELECT sc FROM SystemConfig sc ORDER BY sc.createdAt DESC LIMIT 1")
    Optional<SystemConfig> findLatestConfig();
}
