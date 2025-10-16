package com.vrroom.service.impl;

import com.vrroom.domain.entity.Game;
import com.vrroom.domain.enums.Difficulty;
import com.vrroom.dto.GameDTO;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GameRepository;
import com.vrroom.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GameServiceImpl implements GameService {

    private final GameRepository gameRepository;

    @Override
    public List<GameDTO> getAllGames() {
        log.debug("Fetching all games");
        return gameRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameDTO> getActiveGames() {
        log.debug("Fetching active games");
        return gameRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameDTO> getGamesByDifficulty(Difficulty difficulty) {
        log.debug("Fetching games by difficulty: {}", difficulty);
        return gameRepository.findByActiveTrueAndDifficulty(difficulty).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GameDTO getGameById(String id) {
        log.debug("Fetching game by id: {}", id);
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        return mapToDTO(game);
    }

    @Override
    @Transactional
    public GameDTO createGame(GameDTO gameDTO) {
        log.info("Creating new game: {}", gameDTO.getName());
        Game game = Game.builder()
                .name(gameDTO.getName())
                .description(gameDTO.getDescription())
                .duration(gameDTO.getDuration())
                .minPlayers(gameDTO.getMinPlayers())
                .maxPlayers(gameDTO.getMaxPlayers())
                .difficulty(gameDTO.getDifficulty())
                .imageUrl(gameDTO.getImageUrl())
                .active(true)
                .build();

        Game savedGame = gameRepository.save(game);
        log.info("Game created successfully with id: {}", savedGame.getId());
        return mapToDTO(savedGame);
    }

    @Override
    @Transactional
    public GameDTO updateGame(String id, GameDTO gameDTO) {
        log.info("Updating game with id: {}", id);
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));

        game.setName(gameDTO.getName());
        game.setDescription(gameDTO.getDescription());
        game.setDuration(gameDTO.getDuration());
        game.setMinPlayers(gameDTO.getMinPlayers());
        game.setMaxPlayers(gameDTO.getMaxPlayers());
        game.setDifficulty(gameDTO.getDifficulty());
        game.setImageUrl(gameDTO.getImageUrl());
        game.setActive(gameDTO.getActive());

        Game updatedGame = gameRepository.save(game);
        log.info("Game updated successfully");
        return mapToDTO(updatedGame);
    }

    @Override
    @Transactional
    public void deleteGame(String id) {
        log.info("Deleting game with id: {}", id);
        if (!gameRepository.existsById(id)) {
            throw new ResourceNotFoundException("Game not found with id: " + id);
        }
        gameRepository.deleteById(id);
        log.info("Game deleted successfully");
    }

    @Override
    @Transactional
    public void deactivateGame(String id) {
        log.info("Deactivating game with id: {}", id);
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        game.setActive(false);
        gameRepository.save(game);
        log.info("Game deactivated successfully");
    }

    private GameDTO mapToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .name(game.getName())
                .description(game.getDescription())
                .duration(game.getDuration())
                .minPlayers(game.getMinPlayers())
                .maxPlayers(game.getMaxPlayers())
                .difficulty(game.getDifficulty())
                .imageUrl(game.getImageUrl())
                .active(game.getActive())
                .build();
    }
}
