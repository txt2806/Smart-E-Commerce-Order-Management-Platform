package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "product_variants")
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    @Column(nullable = false, unique = true)
    private String sku;
    @Column(name = "name_ext")
    private String nameExt;
    @Column(name = "price_adjustment")
    private BigDecimal priceAdjustment = BigDecimal.ZERO;
}