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

    public DeliveryService(DeliveryRepository deliveryRepository,
                           SellerOrderRepository sellerOrderRepository) {
        this.deliveryRepository = deliveryRepository;
        this.sellerOrderRepository = sellerOrderRepository;
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
