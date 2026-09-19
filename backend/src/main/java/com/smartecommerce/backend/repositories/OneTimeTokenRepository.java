package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.OneTimeToken;
import com.smartecommerce.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OneTimeTokenRepository extends JpaRepository<OneTimeToken, Long> {
    Optional<OneTimeToken> findByToken(String token);
    void deleteByUser(User user);
}
