package com.vrroom.service.impl;

import com.vrroom.domain.entity.Game;
import com.vrroom.domain.entity.Promotion;
import com.vrroom.dto.PromotionDTO;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GameRepository;
import com.vrroom.repository.PromotionRepository;
import com.vrroom.service.PromotionService;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PromotionServiceImpl implements PromotionService
{
    private final PromotionRepository promotionRepository;
    private final GameRepository gameRepository;

    @Override
    public List<PromotionDTO> getAllPromotions()
    {
        return promotionRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionDTO> getActivePromotions()
    {
        return promotionRepository.findAllByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PromotionDTO createPromotion(PromotionDTO dto)
    {
        log.info("Creating promotion: {}", dto.getName());

        Game game = null;
        if (dto.getGameId() != null)
        {
            game = gameRepository.findById(dto.getGameId())
                    .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + dto.getGameId()));
        }

        Promotion promotion = Promotion.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .discount(dto.getDiscount())
                .validFrom(dto.getValidFrom())
                .validTo(dto.getValidTo())
                .game(game)
                .active(dto.getActive() != null ? dto.getActive() : Boolean.TRUE)
                .build();

        Promotion saved = promotionRepository.save(promotion);
        log.info("Promotion created with id: {}", saved.getId());

        return toDto(saved);
    }

    @Override
    @Transactional
    public PromotionDTO updatePromotion(String id, PromotionDTO dto)
    {
        log.info("Updating promotion with id: {}", id);

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion not found with id: " + id));

        promotion.setName(dto.getName());
        promotion.setDescription(dto.getDescription());
        promotion.setDiscount(dto.getDiscount());
        promotion.setValidFrom(dto.getValidFrom());
        promotion.setValidTo(dto.getValidTo());
        promotion.setActive(dto.getActive());

        if (dto.getGameId() != null)
        {
            Game game = gameRepository.findById(dto.getGameId())
                    .orElseThrow(() -> new ResourceNotFoundException("Game not found with id: " + dto.getGameId()));
            promotion.setGame(game);
        }
        else
        {
            // null => global promotion
            promotion.setGame(null);
        }

        Promotion updated = promotionRepository.save(promotion);
        log.info("Promotion updated");

        return toDto(updated);
    }

    @Override
    @Transactional
    public void deletePromotion(String id)
    {
        log.info("Deleting promotion with id: {}", id);

        if (!promotionRepository.existsById(id))
        {
            throw new ResourceNotFoundException("Promotion not found with id: " + id);
        }

        promotionRepository.deleteById(id);
        log.info("Promotion deleted");
    }

    @Override
    public Optional<PromotionDTO> findBestPromotionForGameAndDate(String gameId, LocalDate date)
    {
        List<Promotion> promotions = promotionRepository.findActiveForGameOrGlobal(gameId, date);

        return promotions.stream()
                .filter(p -> p.getDiscount() != null)
                .max(Comparator.comparing(Promotion::getDiscount))
                .map(this::toDto);
    }

    @Override
    public double resolveDiscountForGameAndDate(String gameId, LocalDate date)
    {
        return findBestPromotionForGameAndDate(gameId, date)
                .map(dto -> dto.getDiscount() != null ? dto.getDiscount().doubleValue() : 0.0)
                .orElse(0.0);
    }

    private PromotionDTO toDto(Promotion promotion)
    {
        return PromotionDTO.builder()
                .id(promotion.getId())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .discount(promotion.getDiscount())
                .validFrom(promotion.getValidFrom())
                .validTo(promotion.getValidTo())
                .gameId(promotion.getGame() != null ? promotion.getGame().getId() : null)
                .gameName(promotion.getGame() != null ? promotion.getGame().getName() : null)
                .active(promotion.getActive())
                .build();
    }
}
