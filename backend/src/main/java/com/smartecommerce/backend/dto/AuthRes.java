package com.smartecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthRes {
    private String token;
    private String sessionKey;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String role;
    
    public AuthRes(String token, String sessionKey, Long id, String username, String role) {
        this.token = token;
        this.sessionKey = sessionKey;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public AuthRes(String token, Long id, String username, String role) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.username = username;
        this.role = role;
    }
}