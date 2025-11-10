package com.vrroom.service;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;

/**
 * @author Hristijan Slavkoski
 */
public interface GiftCardService
{
    @Transactional
    BigDecimal peekDiscount(String code);

    @Transactional
    void holdGiftCard(String code);

    @Transactional
    void redeemGiftCard(String code, String bookingId);

    @Transactional
    void releaseGiftCard(String code);
}
