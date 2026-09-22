package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.ReviewDto;
import com.smartecommerce.backend.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ReviewDto.ProductReviewSummaryDto> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviewSummary(productId));
    }

    @PostMapping
    public ResponseEntity<ReviewDto.ReviewResponseDto> createReview(@RequestBody ReviewDto.CreateReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(request));
    }
}
