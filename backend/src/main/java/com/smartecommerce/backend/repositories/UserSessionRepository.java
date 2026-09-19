package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.User;
import com.smartecommerce.backend.entities.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findBySessionKey(String sessionKey);

    @Modifying
    @Query("UPDATE UserSession s SET s.isRevoked = true WHERE s.user = :user")
    void revokeAllByUser(User user);
}
