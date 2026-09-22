package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.customer c LEFT JOIN FETCH c.user LEFT JOIN FETCH o.shippingDetail WHERE c.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByCustomerUserIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("userId") Long userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.customer c LEFT JOIN FETCH c.user LEFT JOIN FETCH o.shippingDetail ORDER BY o.createdAt DESC")
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'CANCELLED'")
    BigDecimal calculateTotalGmv();
}
