package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.PaymentDto;
import com.smartecommerce.backend.dto.SePayWebhookDto;
import com.smartecommerce.backend.services.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDto> getPaymentByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @PostMapping("/simulate-success/{orderId}")
    public ResponseEntity<PaymentDto> simulatePaymentSuccess(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.simulatePaymentSuccess(orderId));
    }

    @PostMapping("/sepay-webhook")
    public ResponseEntity<Map<String, Object>> handleSePayWebhook(@RequestBody SePayWebhookDto webhookDto) {
        boolean matched = paymentService.processSePayWebhook(webhookDto);
        return ResponseEntity.ok(Map.of(
                "success", matched,
                "message", matched ? "Order payment verified and marked as PAID" : "Webhook processed, no matching order"
        ));
    }
}
