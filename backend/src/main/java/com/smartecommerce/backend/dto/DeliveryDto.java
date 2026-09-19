package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDto {
    private Long id;
    private Long sellerOrderId;
    private String carrier;
    private String trackingNumber;
    private String status;
    private LocalDateTime eta;
    private String etaFormatted;
}
