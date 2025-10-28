package com.vrroom.repository;

import com.vrroom.domain.entity.Game;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameRepository extends JpaRepository<Game, String>
{
    List<Game> findByActiveTrue();

    List<Game> findByDifficulty(Integer difficulty);

    List<Game> findByActiveTrueAndDifficulty(Integer difficulty);

    Optional<Game> findByCode(String code);
}
