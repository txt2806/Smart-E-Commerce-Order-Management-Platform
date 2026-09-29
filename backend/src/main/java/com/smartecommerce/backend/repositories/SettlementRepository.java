package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByStoreId(Long storeId);
    List<Settlement> findByStatus(Settlement.Status status);
}
