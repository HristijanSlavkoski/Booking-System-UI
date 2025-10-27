package com.vrroom.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "pricing_config")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class PricingConfig
{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private Integer minPlayers;

    @Column(nullable = false)
    private Integer maxPlayers;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal additionalPlayerPrice;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weekendMultiplier = BigDecimal.valueOf(1.2);

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal holidayMultiplier = BigDecimal.valueOf(1.5);

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal groupDiscount = BigDecimal.valueOf(0.1);

    @Column(nullable = false)
    @Builder.Default
    private Integer groupDiscountThreshold = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
