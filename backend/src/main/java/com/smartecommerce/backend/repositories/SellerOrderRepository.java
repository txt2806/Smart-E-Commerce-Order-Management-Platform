package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.SellerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerOrderRepository extends JpaRepository<SellerOrder, Long> {
    List<SellerOrder> findByStoreIdOrderByOrderCreatedAtDesc(Long storeId);
    List<SellerOrder> findByStoreId(Long storeId);
    List<SellerOrder> findByOrderId(Long orderId);
}
