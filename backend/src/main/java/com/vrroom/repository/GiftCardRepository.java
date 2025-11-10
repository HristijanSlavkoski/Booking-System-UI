package com.vrroom.repository;

import com.vrroom.domain.entity.GiftCard;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiftCardRepository extends JpaRepository<GiftCard, Long>
{
    Optional<GiftCard> findByCode(String code);
}
