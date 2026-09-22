package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findBySellerOrderId(Long sellerOrderId);
    List<Delivery> findBySellerOrderIdIn(List<Long> sellerOrderIds);
}
