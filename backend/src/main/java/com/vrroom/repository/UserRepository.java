package com.vrroom.repository;

import com.vrroom.model.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String>
{
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
