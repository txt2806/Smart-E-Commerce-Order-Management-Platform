package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @Column(name = "user_id")
    private Long userId;
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_tier")
    private MembershipTier membershipTier = MembershipTier.BRONZE;
    @Column(name = "reward_points")
    private Integer rewardPoints = 0;
    public enum MembershipTier { BRONZE, SILVER, GOLD, PLATINUM }
}