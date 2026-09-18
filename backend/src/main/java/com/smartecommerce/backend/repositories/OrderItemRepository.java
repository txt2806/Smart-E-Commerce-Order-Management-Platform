package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findBySellerOrderId(Long sellerOrderId);
    List<OrderItem> findBySellerOrderOrderId(Long orderId);
}
