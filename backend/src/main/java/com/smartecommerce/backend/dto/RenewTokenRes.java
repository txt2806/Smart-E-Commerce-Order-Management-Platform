package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenewTokenRes {
    private String token;
    private String type = "Bearer";

    public RenewTokenRes(String token) {
        this.token = token;
        this.type = "Bearer";
    }
}
