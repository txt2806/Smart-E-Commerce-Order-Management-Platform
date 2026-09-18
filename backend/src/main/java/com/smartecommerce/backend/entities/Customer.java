package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.domain.Persistable;

@Data
@Entity
@Table(name = "customers")
public class Customer implements Persistable<Long> {
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

    @Transient
    private boolean isNew = true;

    @Override
    public Long getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    public enum MembershipTier { BRONZE, SILVER, GOLD, PLATINUM }
}