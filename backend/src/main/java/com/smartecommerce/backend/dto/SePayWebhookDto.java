package com.smartecommerce.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SePayWebhookDto {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    private String transferType;
    private Double transferAmount;
    private Double accumulated;
    private String code;
    private String content;
    private String referenceCode;
    private String description;
}
