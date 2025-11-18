package com.vrroom.service.impl;

import com.vrroom.model.entity.User;
import com.vrroom.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserInitializationService
{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void initializeDefaultUsers()
    {
        if (userRepository.count() > 0)
        {
            log.info("Users already exist in database. Skipping default user creation.");
            return;
        }

        log.info("Creating default users...");

        // Create admin user
        if (userRepository.findByEmail("admin@vrroom.com").isEmpty())
        {
            User adminUser = User.builder()
                    .email("admin@vrroom.com")
                    .firstName("Admin")
                    .lastName("User")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("+389 70 123 456")
                    .roles(Set.of("ADMIN", "USER"))
                    .active(true)
                    .build();
            userRepository.save(adminUser);
            log.info("✅ ADMIN USER created: admin@vrroom.com / admin123");
        }

        // Create normal user
        if (userRepository.findByEmail("user@vrroom.com").isEmpty())
        {
            User normalUser = User.builder()
                    .email("user@vrroom.com")
                    .firstName("Regular")
                    .lastName("User")
                    .password(passwordEncoder.encode("user123"))
                    .phone("+389 70 987 654")
                    .roles(Set.of("USER"))
                    .active(true)
                    .build();
            userRepository.save(normalUser);
            log.info("✅ REGULAR USER created: user@vrroom.com / user123");
        }

        log.info("================================================");
        log.info("Default users created successfully!");
        log.info("================================================");
    }
}
