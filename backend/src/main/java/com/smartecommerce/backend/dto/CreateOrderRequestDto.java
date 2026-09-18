package com.smartecommerce.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequestDto {
    private String recipientName;
    private String phone;
    private String email;
    private String addressLine;
    private String city;
    private String notes;
    private String paymentMethod; // COD, SEPAY_BANK_TRANSFER
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Long variantId;
        private Integer quantity;
        private String color;
        private BigDecimal price;
    }
}
