package com.smartecommerce.backend.dto;

import lombok.Data;

@Data
public class UpdateOrderStatusDto {
    private String status; // PENDING, PREPARING, SHIPPING, DELIVERED, CANCELLED
}
