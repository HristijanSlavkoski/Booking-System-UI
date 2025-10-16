package com.vrroom.repository;

import com.vrroom.domain.entity.Game;
import com.vrroom.domain.enums.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, String> {

    List<Game> findByActiveTrue();

    List<Game> findByDifficulty(Difficulty difficulty);

    List<Game> findByActiveTrueAndDifficulty(Difficulty difficulty);
}
