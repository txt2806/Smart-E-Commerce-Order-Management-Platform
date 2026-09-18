package com.smartecommerce.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SellerOrderResponseDto {
    private Long id;
    private Long orderId;
    private String orderCode;
    private LocalDateTime createdAt;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private String city;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal total;
    private String status; // PENDING, PREPARING, SHIPPING, DELIVERED, CANCELLED
    private String paymentMethod;
    private String paymentStatus;
    private List<OrderResponseDto.OrderItemResponseDto> items;
}
