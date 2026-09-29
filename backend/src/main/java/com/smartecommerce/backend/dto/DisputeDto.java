package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class DisputeDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDisputeRequest {
        private Long orderId;
        private String reason;
        private String description;
        private String evidenceImage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArbitrateDisputeRequest {
        private String decision; // "REFUND" or "RELEASE"
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisputeSummaryDto {
        private String id;
        private String orderId;
        private Long rawOrderId;
        private BigDecimal amount;
        private String status; // "PENDING", "REFUNDED", "RELEASED"
        private BuyerInfo buyer;
        private SellerInfo seller;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuyerInfo {
        private String name;
        private String email;
        private String issue;
        private String evidenceImage;
        private String timestamp;
        private String claimType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerInfo {
        private String storeName;
        private String storeOwner;
        private String packingProofVideo;
        private String standardCheck;
        private String invoiceNo;
        private String timestamp;
    }
}
