package com.smartecommerce.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDto {
    private Long id;
    private String orderCode;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private String status;
    private String customerUsername;
    private String recipientName;
    private String phone;
    private String email;
    private String addressLine;
    private String city;
    private String paymentMethod;
    private String paymentStatus;
    private String carrier;
    private String trackingNumber;
    private String eta;
    private List<OrderItemResponseDto> items;
    private List<SellerOrderSummaryDto> sellerOrders;

    @Data
    public static class OrderItemResponseDto {
        private Long id;
        private Long productId;
        private String productName;
        private String imageUrl;
        private String sku;
        private String color;
        private Integer quantity;
        private BigDecimal priceAtBuy;
        private BigDecimal lineTotal;
        private String storeName;
    }

    @Data
    public static class SellerOrderSummaryDto {
        private Long sellerOrderId;
        private Long storeId;
        private String storeName;
        private BigDecimal subtotal;
        private BigDecimal shippingFee;
        private String status;
        private Integer itemCount;
    }
}
