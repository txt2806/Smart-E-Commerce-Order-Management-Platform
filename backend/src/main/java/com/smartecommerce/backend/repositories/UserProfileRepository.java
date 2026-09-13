package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Boolean existsByPhone(String phone);
    Boolean existsByEmail(String email);
}