package com.smartecommerce.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    @Column(name = "subname")
    private String subname;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "hover_image_url", columnDefinition = "TEXT")
    private String hoverImageUrl;

    @Column(name = "sku")
    private String sku;

    @Column(name = "stock")
    private Integer stock = 10;

    @Column(name = "rating")
    private Double rating = 5.0;

    @Column(name = "reviews")
    private Integer reviews = 100;

    @Column(name = "badge")
    private String badge;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status { DRAFT, ACTIVE, OUT_OF_STOCK }
}