package com.smartecommerce.backend.entities;
import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Data
@Entity
@Table(name = "order_vouchers")
public class OrderVoucher {
    @EmbeddedId
    private OrderVoucherId id;
    
    @ManyToOne
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @MapsId("voucherId")
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Embeddable
    @Data
    public static class OrderVoucherId implements Serializable {
        private Long orderId;
        private Long voucherId;
    }
}