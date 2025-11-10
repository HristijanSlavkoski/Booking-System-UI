package com.vrroom.service.impl;

import com.vrroom.domain.entity.GiftCard;
import com.vrroom.domain.enums.GiftCardStatus;
import com.vrroom.exception.ResourceNotFoundException;
import com.vrroom.repository.GiftCardRepository;
import com.vrroom.service.GiftCardService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Gift card lifecycle:
 * CREATED -> HELD (holdGiftCard)
 * HELD -> REDEEMED (redeemGiftCard)
 * HELD -> CREATED (releaseGiftCard)
 * peekDiscount never mutates state.
 *
 * If your current enum uses ACTIVE instead of CREATED, replace CREATED with ACTIVE below.
 */

/**
 * @author Hristijan Slavkoski
 */
@RequiredArgsConstructor
@Service
public class GiftCardServiceImpl implements GiftCardService
{
    private final GiftCardRepository giftCardRepository;

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
