package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "delivery_schedules")
public class DeliverySchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;
    @Column(name = "google_event_id")
    private String googleEventId;
    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;
}