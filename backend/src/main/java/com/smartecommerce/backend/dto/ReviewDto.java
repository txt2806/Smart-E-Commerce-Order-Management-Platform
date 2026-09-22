package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ReviewDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateReviewRequest {
        private Long productId;
        private Integer rating;
        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewResponseDto {
        private Long id;
        private Long productId;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
        private String authorName;
        private String authorTier;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductReviewSummaryDto {
        private Long productId;
        private Double averageRating;
        private Long totalReviews;
        private Map<Integer, Long> distribution; // e.g. 5: 120, 4: 30, 3: 5, 2: 1, 1: 0
        private List<ReviewResponseDto> reviews;
    }
}
