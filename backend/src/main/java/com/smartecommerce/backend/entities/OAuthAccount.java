package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "oauth_accounts")
public class OAuthAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;
    @Column(name = "provider_id", nullable = false)
    private String providerId;
    public enum Provider { GOOGLE, FACEBOOK }
}