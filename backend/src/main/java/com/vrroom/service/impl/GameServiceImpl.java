package com.vrroom.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vrroom.domain.entity.Game;
import com.vrroom.dto.GameDTO;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GameRepository;
import com.vrroom.service.GameService;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GameServiceImpl implements GameService
{

    private final GameRepository gameRepository;
    private final ObjectMapper objectMapper;

    @PostConstruct
    @Transactional
    public void loadDefaultGames()
    {
        long count = gameRepository.count();
        if (count > 0)
        {
            log.info("Games already exist in database. Skipping default game loading. Total games: {}", count);
            return;
        }

        log.info("Loading default games from JSON file...");
        try
        {
            ClassPathResource resource = new ClassPathResource("data/default-games.json");
            InputStream inputStream = resource.getInputStream();

            List<GameDTO> defaultGames = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<GameDTO>>()
                    {
                    });

            for (GameDTO gameDTO : defaultGames)
            {
                Game game = Game.builder()
                        .name(gameDTO.getName())
                        .code(gameDTO.getCode())
                        .description(gameDTO.getDescription())
                        .duration(gameDTO.getDuration())
                        .minPlayers(gameDTO.getMinPlayers())
                        .maxPlayers(gameDTO.getMaxPlayers())
                        .difficulty(gameDTO.getDifficulty())
                        .imageUrl(gameDTO.getImageUrl())
                        .active(true)
                        .build();

                gameRepository.save(game);
                log.info("Loaded game: {}", game.getName());
            }

            log.info("Successfully loaded {} default games", defaultGames.size());
        }
        catch (IOException e)
        {
            log.error("Failed to load default games from JSON", e);
            throw new RuntimeException("Failed to initialize default games", e);
        }
    }

    @Override
    public List<GameDTO> getAllGames()
    {
        log.debug("Fetching all games");
        return gameRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameDTO> getActiveGames()
    {
        log.debug("Fetching active games");
        return gameRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameDTO> getGamesByDifficulty(Integer difficulty)
    {
        log.debug("Fetching games by difficulty: {}", difficulty);
        return gameRepository.findByActiveTrueAndDifficulty(difficulty).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GameDTO getGameById(String id)
    {
        log.debug("Fetching game by id: {}", id);
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        return mapToDTO(game);
    }

    @Override
    public GameDTO getGameByCode(String code)
    {
        log.debug("Fetching game by code: {}", code);
        Game game = gameRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with code: " + code));
        return mapToDTO(game);
    }

    @Override
    @Transactional
    public GameDTO createGame(GameDTO gameDTO)
    {
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
    public GameDTO updateGame(String id, GameDTO gameDTO)
    {
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
    public void deleteGame(String id)
    {
        log.info("Deleting game with id: {}", id);
        if (!gameRepository.existsById(id))
        {
            throw new ResourceNotFoundException("Game not found with id: " + id);
        }
        gameRepository.deleteById(id);
        log.info("Game deleted successfully");
    }

    @Override
    @Transactional
    public void deactivateGame(String id)
    {
        log.info("Deactivating game with id: {}", id);
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + id));
        game.setActive(false);
        gameRepository.save(game);
        log.info("Game deactivated successfully");
    }

    private GameDTO mapToDTO(Game game)
    {
        return GameDTO.builder()
                .id(game.getId())
                .name(game.getName())
                .code(game.getCode())
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
