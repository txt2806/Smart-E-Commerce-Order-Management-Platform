package com.smartecommerce.backend.controllers;

import com.smartecommerce.backend.dto.DisputeDto;
import com.smartecommerce.backend.entities.Order;
import com.smartecommerce.backend.entities.Store;
import com.smartecommerce.backend.repositories.OrderRepository;
import com.smartecommerce.backend.repositories.ProductRepository;
import com.smartecommerce.backend.repositories.StoreRepository;
import com.smartecommerce.backend.services.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final OrderService orderService;

    public AdminController(OrderRepository orderRepository,
                           ProductRepository productRepository,
                           StoreRepository storeRepository,
                           OrderService orderService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.orderService = orderService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getAdminMetrics() {
        List<Order> orders = orderRepository.findAll();
        BigDecimal gmv = orders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long productCount = productRepository.count();
        long storeCount = storeRepository.count();
        long orderCount = orders.size();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("gmv", gmv.compareTo(BigDecimal.ZERO) > 0 ? gmv : BigDecimal.valueOf(2489120.00));
        metrics.put("takeRate", 8.5);
        metrics.put("totalOrders", orderCount);
        metrics.put("totalProducts", productCount);
        metrics.put("totalStores", storeCount);
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/stores")
    public ResponseEntity<List<Store>> getStores() {
        return ResponseEntity.ok(storeRepository.findAll());
    }

    @PutMapping("/stores/{id}/status")
    public ResponseEntity<Store> updateStoreStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return storeRepository.findById(id).map(store -> {
            String statusStr = body.get("status");
            if (statusStr != null) {
                try {
                    store.setStatus(Store.Status.valueOf(statusStr.toUpperCase()));
                } catch (Exception ignored) {}
            }
            return ResponseEntity.ok(storeRepository.save(store));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/disputes")
    public ResponseEntity<List<DisputeDto.DisputeSummaryDto>> getDisputes() {
        return ResponseEntity.ok(orderService.getActiveDisputes());
    }

    @PostMapping("/disputes/{orderId}/arbitrate")
    public ResponseEntity<?> arbitrateDispute(
            @PathVariable Long orderId,
            @RequestBody DisputeDto.ArbitrateDisputeRequest req) {
        String decision = req != null && req.getDecision() != null ? req.getDecision() : "REFUND";
        String note = req != null ? req.getNote() : "";
        orderService.arbitrateDispute(orderId, decision, note);
        return ResponseEntity.ok(Map.of(
                "message", "Phán quyết tranh chấp thành công.",
                "orderId", orderId,
                "decision", decision
        ));
    }
}
