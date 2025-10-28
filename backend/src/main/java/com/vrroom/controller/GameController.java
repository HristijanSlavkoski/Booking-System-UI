package com.vrroom.controller;

import com.vrroom.dto.GameDTO;
import com.vrroom.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class GameController {

    private final GameService gameService;

    @GetMapping
    public ResponseEntity<List<GameDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/active")
    public ResponseEntity<List<GameDTO>> getActiveGames() {
        return ResponseEntity.ok(gameService.getActiveGames());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable String id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @GetMapping("/{code}")
    public ResponseEntity<GameDTO> getGameByCode(@PathVariable String code) {
        return ResponseEntity.ok(gameService.getGameByCode(code));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<GameDTO>> getGamesByDifficulty(@PathVariable Integer difficulty) {
        return ResponseEntity.ok(gameService.getGamesByDifficulty(difficulty));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> createGame(@Valid @RequestBody GameDTO gameDTO) {
        GameDTO created = gameService.createGame(gameDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GameDTO> updateGame(
            @PathVariable String id,
            @Valid @RequestBody GameDTO gameDTO) {
        return ResponseEntity.ok(gameService.updateGame(id, gameDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGame(@PathVariable String id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateGame(@PathVariable String id) {
        gameService.deactivateGame(id);
        return ResponseEntity.noContent().build();
    }
}
