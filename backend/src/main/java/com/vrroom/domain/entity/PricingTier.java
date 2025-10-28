package com.vrroom.domain.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * @author Hristijan Slavkoski
 */
// PricingTier.java
@Entity
@Table(name = "pricing_tier")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PricingTier
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pricing_config_id", nullable = false)
    private PricingConfig pricingConfig;

    @Column(nullable = false)
    private Integer minPlayers;

    @Column(nullable = false)
    private Integer maxPlayers;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerPlayer;
}
