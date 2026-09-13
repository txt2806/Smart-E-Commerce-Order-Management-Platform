package com.smartecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginReq {
    @NotBlank(message = "ID Token is required")
    private String idToken;
}