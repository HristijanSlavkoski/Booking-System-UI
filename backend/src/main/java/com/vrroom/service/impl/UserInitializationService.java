package com.vrroom.service.impl;

import com.vrroom.domain.entity.User;
import com.vrroom.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserInitializationService {

    private final UserRepository userRepository;

    @PostConstruct
    @Transactional
    public void initializeDefaultUsers() {
        long userCount = userRepository.count();
        if (userCount > 0) {
            log.info("Users already exist in database. Skipping default user creation. Total users: {}", userCount);
            return;
        }

        log.info("Creating default users...");

        User adminUser = User.builder()
                .keycloakId("admin-keycloak-id")
                .email("admin@vrroom.com")
                .firstName("Admin")
                .lastName("User")
                .phone("+389 70 123 456")
                .roles(Set.of("ADMIN", "USER"))
                .active(true)
                .build();

        User normalUser = User.builder()
                .keycloakId("user-keycloak-id")
                .email("user@vrroom.com")
                .firstName("Regular")
                .lastName("User")
                .phone("+389 70 987 654")
                .roles(Set.of("USER"))
                .active(true)
                .build();

        userRepository.save(adminUser);
        userRepository.save(normalUser);

        log.info("✅ Default users created successfully!");
        log.info("================================================");
        log.info("ADMIN USER:");
        log.info("  Email: admin@vrroom.com");
        log.info("  Password: admin");
        log.info("  Roles: ADMIN, USER");
        log.info("================================================");
        log.info("REGULAR USER:");
        log.info("  Email: user@vrroom.com");
        log.info("  Password: user");
        log.info("  Roles: USER");
        log.info("================================================");
        log.info("⚠️  NOTE: These users must also be created in Keycloak!");
        log.info("See README.md for Keycloak setup instructions.");
        log.info("================================================");
    }
}
