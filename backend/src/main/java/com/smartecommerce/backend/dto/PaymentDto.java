package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Long id;
    private Long orderId;
    private String orderCode;
    private String method;
    private String status;
    private BigDecimal amount;
    private Long amountVnd;
    private String qrUrl;
    private String bankName;
    private String bankAccount;
    private String accountName;
    private String transferContent;
}
