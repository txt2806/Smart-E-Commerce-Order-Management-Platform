package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.CreateOrderRequestDto;
import com.smartecommerce.backend.dto.OrderResponseDto;
import com.smartecommerce.backend.dto.SellerOrderResponseDto;
import com.smartecommerce.backend.dto.UpdateOrderStatusDto;
import com.smartecommerce.backend.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/orders")
    public ResponseEntity<OrderResponseDto> createOrder(@RequestBody CreateOrderRequestDto request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<SellerOrderResponseDto>> getSellerOrders() {
        return ResponseEntity.ok(orderService.getSellerOrders());
    }

    @PutMapping("/seller/orders/{id}/status")
    public ResponseEntity<SellerOrderResponseDto> updateSellerOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusDto dto) {
        return ResponseEntity.ok(orderService.updateSellerOrderStatus(id, dto.getStatus()));
    }
}
