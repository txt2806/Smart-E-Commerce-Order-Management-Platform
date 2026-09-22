package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_detail_id", nullable = false)
    private UserDetail shippingDetail;
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    public enum Status { PENDING, PAID, PROCESSING, COMPLETED, CANCELLED }
}