package com.vrroom.service;

import com.vrroom.dto.GameDTO;
import java.util.List;

public interface GameService
{

    List<GameDTO> getAllGames();

    List<GameDTO> getActiveGames();

    List<GameDTO> getGamesByDifficulty(Integer difficulty);

    GameDTO getGameById(String id);

    GameDTO getGameByCode(String id);

    GameDTO createGame(GameDTO gameDTO);

    GameDTO updateGame(String id, GameDTO gameDTO);

    void deleteGame(String id);

    void deactivateGame(String id);
}
