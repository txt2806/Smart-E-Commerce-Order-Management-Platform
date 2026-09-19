package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerLoyaltyDto {
    private String username;
    private String fullName;
    private String membershipTier;
    private String tierTitle;
    private Integer rewardPoints;
    private Double totalSpent;
    private String nextTierName;
    private Double targetSpend;
    private Integer progressPercentage;
    private String cashbackRate;
    private String shippingPrivilege;
    private List<String> tierLevels;
}
