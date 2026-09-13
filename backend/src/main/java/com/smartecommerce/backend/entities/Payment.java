package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Method method;
    @Column(nullable = false)
    private BigDecimal amount;
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    public enum Method { COD, SEPAY_BANK_TRANSFER }
    public enum Status { PENDING, SUCCESS, FAILED }
}