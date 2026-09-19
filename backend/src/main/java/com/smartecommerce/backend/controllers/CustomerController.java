package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.CustomerLoyaltyDto;
import com.smartecommerce.backend.services.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/loyalty")
    public ResponseEntity<CustomerLoyaltyDto> getLoyaltyProfile() {
        return ResponseEntity.ok(customerService.getLoyaltyProfile());
    }
}
