package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user_details")
public class UserDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String phone;
    private String email;
    @Column(name = "address_line", nullable = false)
    private String addressLine;
    @Column(nullable = false)
    private String city;
    private String state;
    @Column(name = "zip_code")
    private String zipCode;
    @Column(name = "is_default")
    private Boolean isDefault = false;
}