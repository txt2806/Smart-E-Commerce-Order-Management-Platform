package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "seller_orders")
public class SellerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    @Column(nullable = false)
    private BigDecimal subtotal;
    @Column(name = "shipping_fee", nullable = false)
    private BigDecimal shippingFee = BigDecimal.ZERO;
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    public enum Status { PENDING, PREPARING, SHIPPING, DELIVERED, CANCELLED }
}