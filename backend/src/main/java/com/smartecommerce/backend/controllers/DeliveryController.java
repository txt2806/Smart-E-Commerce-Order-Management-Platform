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

    @PutMapping("/{sellerOrderId}/status")
    public ResponseEntity<DeliveryDto> updateDeliveryStatus(
            @PathVariable Long sellerOrderId,
            @RequestParam(required = false) com.smartecommerce.backend.entities.Delivery.Status status,
            @RequestBody(required = false) Map<String, String> body) {
        com.smartecommerce.backend.entities.Delivery.Status targetStatus = status;
        if (targetStatus == null && body != null && body.containsKey("status")) {
            try {
                targetStatus = com.smartecommerce.backend.entities.Delivery.Status.valueOf(body.get("status").toUpperCase());
            } catch (Exception ignored) {}
        }
        if (targetStatus == null) {
            targetStatus = com.smartecommerce.backend.entities.Delivery.Status.DELIVERED;
        }
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(sellerOrderId, targetStatus));
    }
}
