package com.vrroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO
{
    private String id;
    private String name;
    private String code;
    private String description;
    private Integer duration;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Integer difficulty;
    private String imageUrl;
    private Boolean active;
}
