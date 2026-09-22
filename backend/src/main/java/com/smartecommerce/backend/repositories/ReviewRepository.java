package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.customer c LEFT JOIN FETCH c.user u WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<Review> findByProductIdWithUser(@Param("productId") Long productId);

    @Query("SELECT COALESCE(AVG(r.rating), 5.0) FROM Review r WHERE r.product.id = :productId")
    Double calculateAverageRatingByProductId(@Param("productId") Long productId);

    long countByProductId(Long productId);

    Optional<Review> findFirstByCustomerUserIdAndProductId(Long customerUserId, Long productId);
}
