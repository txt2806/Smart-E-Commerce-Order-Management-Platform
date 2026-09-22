package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findBySellerOrderId(Long sellerOrderId);
    List<OrderItem> findBySellerOrderOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product LEFT JOIN FETCH oi.sellerOrder so LEFT JOIN FETCH so.store WHERE so.order.id IN (:orderIds)")
    List<OrderItem> findByOrderIdInWithDetails(@Param("orderIds") List<Long> orderIds);

    @Query("SELECT oi FROM OrderItem oi LEFT JOIN FETCH oi.product WHERE oi.sellerOrder.id IN (:sellerOrderIds)")
    List<OrderItem> findBySellerOrderIdInWithProduct(@Param("sellerOrderIds") List<Long> sellerOrderIds);
}
