package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.ReviewDto;
import com.smartecommerce.backend.entities.Customer;
import com.smartecommerce.backend.entities.Product;
import com.smartecommerce.backend.entities.Review;
import com.smartecommerce.backend.entities.User;
import com.smartecommerce.backend.repositories.CustomerRepository;
import com.smartecommerce.backend.repositories.ProductRepository;
import com.smartecommerce.backend.repositories.ReviewRepository;
import com.smartecommerce.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public ReviewDto.ProductReviewSummaryDto getProductReviewSummary(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));

        List<Review> reviews = reviewRepository.findByProductIdWithUser(productId);

        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        for (Review r : reviews) {
            int score = Math.max(1, Math.min(5, r.getRating()));
            distribution.put(score, distribution.get(score) + 1);
        }

        double avg = reviews.isEmpty() 
                ? (product.getRating() != null ? product.getRating() : 5.0)
                : reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        avg = Math.round(avg * 10.0) / 10.0;

        long total = reviews.isEmpty() && product.getReviews() != null && product.getReviews() > 0 
                ? product.getReviews() 
                : reviews.size();

        List<ReviewDto.ReviewResponseDto> reviewDtos = reviews.stream().map(this::mapToDto).collect(Collectors.toList());

        return ReviewDto.ProductReviewSummaryDto.builder()
                .productId(productId)
                .averageRating(avg)
                .totalReviews(total)
                .distribution(distribution)
                .reviews(reviewDtos)
                .build();
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ReviewDto.ReviewResponseDto createReview(ReviewDto.CreateReviewRequest req) {
        if (req.getProductId() == null) {
            throw new IllegalArgumentException("Thiếu productId.");
        }
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Số sao đánh giá phải từ 1 đến 5.");
        }

        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + req.getProductId()));

        Customer customer = resolveCurrentCustomer();

        Review review = new Review();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setRating(req.getRating());
        review.setComment(req.getComment() != null ? req.getComment().trim() : "");
        review.setCreatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);

        // Recalculate average rating & total reviews
        Double newAvg = reviewRepository.calculateAverageRatingByProductId(product.getId());
        long newCount = reviewRepository.countByProductId(product.getId());

        double roundedAvg = Math.round(newAvg * 10.0) / 10.0;
        product.setRating(roundedAvg);
        product.setReviews((int) newCount);
        productRepository.save(product);

        return mapToDto(saved);
    }

    private Customer resolveCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            User user = userRepository.findByUsername(auth.getName()).orElse(null);
            if (user != null) {
                Customer customer = customerRepository.findById(user.getId()).orElse(null);
                if (customer != null) {
                    return customer;
                }
            }
        }

        // Fallback for guest/demo orders
        List<Customer> all = customerRepository.findAll();
        if (!all.isEmpty()) {
            return all.get(0);
        }

        throw new IllegalStateException("Hệ thống chưa có tài khoản khách hàng nào để ghi nhận đánh giá.");
    }

    private ReviewDto.ReviewResponseDto mapToDto(Review r) {
        String author = "Khách Hàng Smart Store";
        String tier = "MEMBER";

        if (r.getCustomer() != null) {
            if (r.getCustomer().getUser() != null && r.getCustomer().getUser().getUsername() != null) {
                author = r.getCustomer().getUser().getUsername();
            }
            if (r.getCustomer().getMembershipTier() != null) {
                tier = r.getCustomer().getMembershipTier().name();
            }
        }

        return ReviewDto.ReviewResponseDto.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .authorName(author)
                .authorTier(tier)
                .build();
    }
}
