package com.vrroom.dto;

import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO
{
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Set<String> roles;
    private Boolean active;
    private LocalDateTime createdAt;
}
