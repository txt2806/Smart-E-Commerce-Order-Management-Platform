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
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private String carrier;
    private String trackingNumber;
    private String eta;
    private List<OrderResponseDto.OrderItemResponseDto> items;
}
