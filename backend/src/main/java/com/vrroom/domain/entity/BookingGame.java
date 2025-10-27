package com.vrroom.domain.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "booking_games")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingGame
{

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @Column(nullable = false)
    private Integer roomNumber;

    @Column(nullable = false)
    private Integer playerCount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
