package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.UserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDetailRepository extends JpaRepository<UserDetail, Long> {
    List<UserDetail> findByUserId(Long userId);
}
