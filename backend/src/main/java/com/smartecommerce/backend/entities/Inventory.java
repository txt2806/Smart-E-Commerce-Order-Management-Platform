package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "inventories")
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "product_variant_id", nullable = false, unique = true)
    private ProductVariant productVariant;
    @Column(nullable = false)
    private Integer quantity = 0;
    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;
}