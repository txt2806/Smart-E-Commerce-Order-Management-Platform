package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "sellers")
public class Seller {
    @Id
    @Column(name = "user_id")
    private Long userId;
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "identity_number", nullable = false)
    private String identityNumber;
    @Column(name = "tax_code")
    private String taxCode;
}