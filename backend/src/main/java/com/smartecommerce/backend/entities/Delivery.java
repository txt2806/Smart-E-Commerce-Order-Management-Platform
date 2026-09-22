package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "deliveries")
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_order_id", nullable = false, unique = true)
    private SellerOrder sellerOrder;
    private String carrier;
    @Column(name = "tracking_number")
    private String trackingNumber;
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;
    private LocalDateTime eta;
    public enum Status { PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, RETURNED }
}