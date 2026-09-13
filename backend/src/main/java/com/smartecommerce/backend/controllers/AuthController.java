package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.AuthRes;
import com.smartecommerce.backend.dto.GoogleLoginReq;
import com.smartecommerce.backend.dto.LoginReq;
import com.smartecommerce.backend.dto.RegisterReq;
import com.smartecommerce.backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthRes> register(@Valid @RequestBody RegisterReq req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthRes> login(@Valid @RequestBody LoginReq req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthRes> googleLogin(@Valid @RequestBody GoogleLoginReq req) throws Exception {
        return ResponseEntity.ok(authService.googleLogin(req));
    }
}