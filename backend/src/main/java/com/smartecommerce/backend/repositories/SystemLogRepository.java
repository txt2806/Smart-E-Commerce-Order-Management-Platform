package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findByActionOrderByCreatedAtDesc(String action);
    List<SystemLog> findTop20ByOrderByCreatedAtDesc();
}
