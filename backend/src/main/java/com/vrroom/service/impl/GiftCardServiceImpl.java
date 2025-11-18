package com.vrroom.service.impl;

import com.vrroom.model.entity.GiftCard;
import com.vrroom.model.enums.GiftCardStatus;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GiftCardRepository;
import com.vrroom.service.GiftCardService;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Gift card lifecycle:
 * CREATED/ACTIVE -> HELD (holdGiftCard)
 * HELD -> REDEEMED (redeemGiftCard)
 * HELD -> ACTIVE (releaseGiftCard)
 * peekDiscount never mutates state.
 *
 * @author Hristijan Slavkoski
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class GiftCardServiceImpl implements GiftCardService
{
    private final GiftCardRepository giftCardRepository;

    @PostConstruct
    @Transactional
    public void initTestGiftCards()
    {
        long count = giftCardRepository.count();
        if (count > 0)
        {
            log.info("Gift cards already present (count = {}). Skipping test seed.", count);
            return;
        }

        log.info("Seeding default test gift cards...");

        List<GiftCard> cards = new ArrayList<>();

        for (int i = 1; i <= 10; i++)
        {
            String code = String.format("TEST-GC-%04d", i); // TEST-GC-0001 ... TEST-GC-0010

            GiftCard card = GiftCard.builder()
                    .code(code)
                    .price(BigDecimal.valueOf(1000)) // 💰 1000 per card
                    .status(GiftCardStatus.ACTIVE) // directly ACTIVE so you can use them
                    .build();

            cards.add(card);
        }

        giftCardRepository.saveAll(cards);

        log.info("Created {} test gift cards:", cards.size());
        cards.forEach(c -> log.info("  Gift card code: {} (amount: {})", c.getCode(), c.getPrice()));
    }

    @Override
    @Transactional
    public BigDecimal peekDiscount(String code)
    {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found: " + code));

        if (GiftCardStatus.REDEEMED == card.getStatus())
        {
            throw new IllegalStateException("Gift card already redeemed.");
        }
        if (GiftCardStatus.INACTIVE == card.getStatus())
        {
            throw new IllegalStateException("Gift card not activated yet.");
        }
        if (GiftCardStatus.HELD == card.getStatus())
        {
            throw new IllegalStateException("Gift card is being used by someone else.");
        }
        if (GiftCardStatus.EXPIRED == card.getStatus())
        {
            throw new IllegalStateException("Gift card is expired.");
        }

        return card.getPrice();
    }

    @Override
    @Transactional
    public void holdGiftCard(String code)
    {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found: " + code));

        if (card.getStatus() == GiftCardStatus.REDEEMED)
        {
            throw new IllegalStateException("Gift card already redeemed.");
        }
        if (GiftCardStatus.INACTIVE == card.getStatus())
        {
            throw new IllegalStateException("Gift card not activated yet.");
        }
        if (GiftCardStatus.HELD == card.getStatus())
        {
            throw new IllegalStateException("Gift card is being used by someone else.");
        }
        if (GiftCardStatus.EXPIRED == card.getStatus())
        {
            throw new IllegalStateException("Gift card is expired.");
        }

        card.setStatus(GiftCardStatus.HELD);
        giftCardRepository.save(card);
    }

    @Override
    @Transactional
    public void redeemGiftCard(String code, String bookingId)
    {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found: " + code));

        if (card.getStatus() == GiftCardStatus.REDEEMED)
        {
            throw new IllegalStateException("Gift card already redeemed.");
        }
        if (GiftCardStatus.INACTIVE == card.getStatus())
        {
            throw new IllegalStateException("Gift card not activated yet.");
        }
        if (GiftCardStatus.EXPIRED == card.getStatus())
        {
            throw new IllegalStateException("Gift card is expired.");
        }

        card.setStatus(GiftCardStatus.REDEEMED);
        card.setUsedAt(LocalDateTime.now());
        giftCardRepository.save(card);
    }

    @Override
    @Transactional
    public void releaseGiftCard(String code)
    {
        GiftCard card = giftCardRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Gift card not found: " + code));

        if (card.getStatus() == GiftCardStatus.REDEEMED)
        {
            throw new IllegalStateException("Gift card already redeemed.");
        }
        if (GiftCardStatus.INACTIVE == card.getStatus())
        {
            throw new IllegalStateException("Gift card not activated yet.");
        }
        if (GiftCardStatus.EXPIRED == card.getStatus())
        {
            throw new IllegalStateException("Gift card is expired.");
        }

        card.setStatus(GiftCardStatus.ACTIVE);
        giftCardRepository.save(card);
    }
}
