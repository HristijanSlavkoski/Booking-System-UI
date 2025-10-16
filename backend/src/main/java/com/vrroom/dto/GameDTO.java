package com.vrroom.dto;

import com.vrroom.domain.enums.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {
    private String id;
    private String name;
    private String description;
    private Integer duration;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Difficulty difficulty;
    private String imageUrl;
    private Boolean active;
}
