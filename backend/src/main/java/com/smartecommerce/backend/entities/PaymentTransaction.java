package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId;
    @Column(columnDefinition = "TEXT")
    private String payload;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}