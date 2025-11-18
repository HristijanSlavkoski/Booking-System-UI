package com.vrroom.repository;

import com.vrroom.model.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, String> {

    List<Holiday> findByActiveTrue();

    Optional<Holiday> findByDateAndActiveTrue(LocalDate date);

    boolean existsByDateAndActiveTrue(LocalDate date);
}
