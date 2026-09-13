package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "settlements")
public class Settlement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    @Column(nullable = false)
    private BigDecimal amount;
    @Column(name = "platform_fee", nullable = false)
    private BigDecimal platformFee;
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    public enum Status { PENDING, PAID }
}