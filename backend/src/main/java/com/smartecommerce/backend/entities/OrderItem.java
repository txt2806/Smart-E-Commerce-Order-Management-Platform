package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_order_id", nullable = false)
    private SellerOrder sellerOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "image_url")
    private String imageUrl;

    private String color;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_at_buy", nullable = false)
    private BigDecimal priceAtBuy;
}