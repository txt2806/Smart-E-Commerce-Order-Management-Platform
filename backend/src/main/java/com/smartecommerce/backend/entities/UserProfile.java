package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @Column(name = "user_id")
    private Long userId;
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "first_name", nullable = false)
    private String firstName;
    @Column(name = "last_name", nullable = false)
    private String lastName;
    @Column(nullable = false, unique = true)
    private String phone;
    private String email;
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    @Column(name = "avatar_url")
    private String avatarUrl;
}