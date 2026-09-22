package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.VoucherDto;
import com.smartecommerce.backend.services.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public ResponseEntity<List<VoucherDto>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }
}
