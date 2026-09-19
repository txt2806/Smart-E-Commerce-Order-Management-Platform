package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.DeliveryDto;
import com.smartecommerce.backend.services.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/{sellerOrderId}")
    public ResponseEntity<DeliveryDto> getDelivery(@PathVariable Long sellerOrderId) {
        DeliveryDto dto = deliveryService.getDeliveryBySellerOrderId(sellerOrderId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{sellerOrderId}")
    public ResponseEntity<DeliveryDto> createOrUpdateDelivery(
            @PathVariable Long sellerOrderId,
            @RequestBody(required = false) Map<String, String> body) {
        String carrier = body != null ? body.get("carrier") : null;
        String tracking = body != null ? body.get("trackingNumber") : null;
        return ResponseEntity.ok(deliveryService.createOrUpdateDelivery(sellerOrderId, carrier, tracking));
    }
}
