package com.vrroom.service;

import com.vrroom.domain.entity.Game;
import com.vrroom.domain.enums.Difficulty;
import com.vrroom.dto.GameDTO;

import java.util.List;

public interface GameService {

    List<GameDTO> getAllGames();

    List<GameDTO> getActiveGames();

    List<GameDTO> getGamesByDifficulty(Difficulty difficulty);

    GameDTO getGameById(String id);

    GameDTO createGame(GameDTO gameDTO);

    GameDTO updateGame(String id, GameDTO gameDTO);

    void deleteGame(String id);

    void deactivateGame(String id);
}
