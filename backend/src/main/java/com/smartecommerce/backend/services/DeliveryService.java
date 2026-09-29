package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.DeliveryDto;
import com.smartecommerce.backend.entities.Delivery;
import com.smartecommerce.backend.entities.SellerOrder;
import com.smartecommerce.backend.repositories.DeliveryRepository;
import com.smartecommerce.backend.repositories.SellerOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final com.smartecommerce.backend.repositories.OrderRepository orderRepository;
    private final com.smartecommerce.backend.repositories.SettlementRepository settlementRepository;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           SellerOrderRepository sellerOrderRepository,
                           com.smartecommerce.backend.repositories.OrderRepository orderRepository,
                           com.smartecommerce.backend.repositories.SettlementRepository settlementRepository) {
        this.deliveryRepository = deliveryRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.orderRepository = orderRepository;
        this.settlementRepository = settlementRepository;
    }

    @Transactional
    public DeliveryDto updateDeliveryStatus(Long sellerOrderId, Delivery.Status newStatus) {
        SellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new RuntimeException("Seller order not found with id: " + sellerOrderId));

        Delivery delivery = deliveryRepository.findBySellerOrderId(sellerOrderId)
                .orElseGet(() -> {
                    Delivery d = new Delivery();
                    d.setSellerOrder(sellerOrder);
                    d.setCarrier("Viettel Post Hỏa Tốc");
                    d.setTrackingNumber("VTP-" + (100000 + new Random().nextInt(900000)));
                    return d;
                });

        delivery.setStatus(newStatus);
        if (newStatus == Delivery.Status.DELIVERED) {
            delivery.setEta(LocalDateTime.now());
            sellerOrder.setStatus(SellerOrder.Status.DELIVERED);
        } else if (newStatus == Delivery.Status.IN_TRANSIT || newStatus == Delivery.Status.PICKED_UP) {
            sellerOrder.setStatus(SellerOrder.Status.SHIPPING);
        }
        sellerOrderRepository.save(sellerOrder);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Check if all sibling seller orders for this order are DELIVERED
        if (newStatus == Delivery.Status.DELIVERED && sellerOrder.getOrder() != null) {
            com.smartecommerce.backend.entities.Order parentOrder = orderRepository.findById(sellerOrder.getOrder().getId()).orElse(null);
            if (parentOrder != null) {
                java.util.List<SellerOrder> allSellerOrders = sellerOrderRepository.findByOrderId(parentOrder.getId());
                boolean allDelivered = allSellerOrders.stream().allMatch(so -> so.getStatus() == SellerOrder.Status.DELIVERED);
                if (allDelivered) {
                    parentOrder.setStatus(com.smartecommerce.backend.entities.Order.Status.COMPLETED);
                    orderRepository.save(parentOrder);

                    // Escrow settlement release for each store
                    for (SellerOrder so : allSellerOrders) {
                        if (so.getStore() != null) {
                            java.math.BigDecimal subtotal = so.getSubtotal() != null ? so.getSubtotal() : java.math.BigDecimal.ZERO;
                            java.math.BigDecimal platformFee = subtotal.multiply(new java.math.BigDecimal("0.085")).setScale(2, java.math.RoundingMode.HALF_UP);
                            java.math.BigDecimal netAmount = subtotal.subtract(platformFee);

                            com.smartecommerce.backend.entities.Settlement settlement = new com.smartecommerce.backend.entities.Settlement();
                            settlement.setStore(so.getStore());
                            settlement.setAmount(netAmount);
                            settlement.setPlatformFee(platformFee);
                            settlement.setStatus(com.smartecommerce.backend.entities.Settlement.Status.PAID);
                            settlementRepository.save(settlement);
                        }
                    }
                }
            }
        }

        return mapToDto(savedDelivery);
    }

    @Transactional(readOnly = true)
    public DeliveryDto getDeliveryBySellerOrderId(Long sellerOrderId) {
        return deliveryRepository.findBySellerOrderId(sellerOrderId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional
    public DeliveryDto createOrUpdateDelivery(Long sellerOrderId, String carrierName, String customTracking) {
        SellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new RuntimeException("Seller order not found with id: " + sellerOrderId));

        Delivery delivery = deliveryRepository.findBySellerOrderId(sellerOrderId)
                .orElseGet(() -> {
                    Delivery d = new Delivery();
                    d.setSellerOrder(sellerOrder);
                    return d;
                });

        String carrier = (carrierName != null && !carrierName.isBlank()) ? carrierName : "Viettel Post Hỏa Tốc";
        String tracking = (customTracking != null && !customTracking.isBlank()) ? customTracking :
                "VTP-" + (100000 + new Random().nextInt(900000));

        delivery.setCarrier(carrier);
        delivery.setTrackingNumber(tracking);
        delivery.setStatus(Delivery.Status.IN_TRANSIT);
        delivery.setEta(LocalDateTime.now().plusDays(2));

        Delivery saved = deliveryRepository.save(delivery);
        return mapToDto(saved);
    }

    private DeliveryDto mapToDto(Delivery delivery) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
        return DeliveryDto.builder()
                .id(delivery.getId())
                .sellerOrderId(delivery.getSellerOrder().getId())
                .carrier(delivery.getCarrier())
                .trackingNumber(delivery.getTrackingNumber())
                .status(delivery.getStatus().name())
                .eta(delivery.getEta())
                .etaFormatted(delivery.getEta() != null ? delivery.getEta().format(formatter) : "2-3 ngày tới")
                .build();
    }
}
