package com.smartecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RenewTokenReq {
    @NotBlank(message = "Session key không được để trống")
    private String sessionKey;
}
