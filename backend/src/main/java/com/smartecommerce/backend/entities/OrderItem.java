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
    @ManyToOne
    @JoinColumn(name = "seller_order_id", nullable = false)
    private SellerOrder sellerOrder;
    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;
    @Column(nullable = false)
    private Integer quantity;
    @Column(name = "price_at_buy", nullable = false)
    private BigDecimal priceAtBuy;
}