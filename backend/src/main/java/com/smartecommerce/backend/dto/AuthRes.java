package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthRes {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String role;
    
    public AuthRes(String token, Long id, String username, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.role = role;
    }
}