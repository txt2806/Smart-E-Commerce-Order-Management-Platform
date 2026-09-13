package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.StoreDto;
import com.smartecommerce.backend.services.StoreService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<StoreDto> createOrUpdateStore(@Valid @RequestBody StoreDto storeDto) {
        return ResponseEntity.ok(storeService.createOrUpdateStore(storeDto));
    }

    @GetMapping("/my-store")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<StoreDto> getMyStore() {
        StoreDto store = storeService.getMyStore();
        if (store == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(store);
    }
}
