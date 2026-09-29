package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.PaymentDto;
import com.smartecommerce.backend.dto.SePayWebhookDto;
import com.smartecommerce.backend.entities.Order;
import com.smartecommerce.backend.entities.Payment;
import com.smartecommerce.backend.entities.PaymentTransaction;
import com.smartecommerce.backend.repositories.OrderRepository;
import com.smartecommerce.backend.repositories.PaymentRepository;
import com.smartecommerce.backend.repositories.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final com.smartecommerce.backend.repositories.SellerOrderRepository sellerOrderRepository;
    private final com.smartecommerce.backend.repositories.DeliveryRepository deliveryRepository;
    private final com.smartecommerce.backend.repositories.SystemLogRepository systemLogRepository;

    @Value("${sepay.bank.id}")
    private String bankId;

    @Value("${sepay.bank.account}")
    private String bankAccount;

    @Value("${sepay.bank.owner}")
    private String accountName;
    private static final long USD_TO_VND_RATE = 25400L;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentTransactionRepository paymentTransactionRepository,
                          OrderRepository orderRepository,
                          com.smartecommerce.backend.repositories.SellerOrderRepository sellerOrderRepository,
                          com.smartecommerce.backend.repositories.DeliveryRepository deliveryRepository,
                          com.smartecommerce.backend.repositories.SystemLogRepository systemLogRepository) {
        this.paymentRepository = paymentRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.deliveryRepository = deliveryRepository;
        this.systemLogRepository = systemLogRepository;
    }

    @Transactional(readOnly = true)
    public PaymentDto getPaymentByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Payment newP = new Payment();
                    newP.setOrder(order);
                    newP.setMethod(Payment.Method.SEPAY_BANK_TRANSFER);
                    newP.setAmount(order.getTotalAmount());
                    newP.setStatus(order.getStatus() == Order.Status.PAID ? Payment.Status.SUCCESS : Payment.Status.PENDING);
                    return paymentRepository.save(newP);
                });

        long amountVnd = payment.getAmount()
                .multiply(BigDecimal.valueOf(USD_TO_VND_RATE))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();

        String transferContent = "ORD" + order.getId();
        String encodedContent = URLEncoder.encode(transferContent, StandardCharsets.UTF_8);
        String encodedAccountName = URLEncoder.encode(accountName, StandardCharsets.UTF_8);

        // Standard VietQR QuickLink (Napas 247)
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                bankId, bankAccount, amountVnd, encodedContent, encodedAccountName);

        return PaymentDto.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderCode("ORD-" + order.getId())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .amountVnd(amountVnd)
                .qrUrl(qrUrl)
                .bankName("MBBank (Ngân hàng Quân Đội)")
                .bankAccount(bankAccount)
                .accountName(accountName)
                .transferContent(transferContent)
                .build();
    }

    @Transactional
    public PaymentDto simulatePaymentSuccess(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Payment newP = new Payment();
                    newP.setOrder(order);
                    newP.setMethod(Payment.Method.SEPAY_BANK_TRANSFER);
                    newP.setAmount(order.getTotalAmount());
                    return newP;
                });

        payment.setStatus(Payment.Status.SUCCESS);
        payment = paymentRepository.save(payment);

        String txId = "SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        onPaymentSuccess(order, payment, txId, "{\"status\":\"SUCCESS\",\"mode\":\"SIMULATED_ONE_CLICK_VERIFICATION\"}");

        return getPaymentByOrderId(orderId);
    }

    @Transactional
    public boolean processSePayWebhook(SePayWebhookDto dto) {
        if (dto == null || dto.getContent() == null) {
            return false;
        }

        // Match patterns like ORD123 or ORD-123
        Pattern pattern = Pattern.compile("ORD-?(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(dto.getContent());

        if (matcher.find()) {
            Long parsedId = Long.parseLong(matcher.group(1));
            Order foundOrder = orderRepository.findById(parsedId).orElse(null);
            if (foundOrder == null && parsedId > 10000) {
                foundOrder = orderRepository.findById(parsedId - 10000).orElse(null);
            }
            if (foundOrder != null) {
                final Order order = foundOrder;
                Long orderId = order.getId();
                Payment payment = paymentRepository.findByOrderId(orderId)
                        .orElseGet(() -> {
                            Payment newP = new Payment();
                            newP.setOrder(order);
                            newP.setMethod(Payment.Method.SEPAY_BANK_TRANSFER);
                            newP.setAmount(order.getTotalAmount());
                            return newP;
                        });

                payment.setStatus(Payment.Status.SUCCESS);
                paymentRepository.save(payment);

                String txId = dto.getCode() != null ? dto.getCode() : "SEPAY-" + dto.getId();
                String payload = "{\"content\":\"" + dto.getContent() + "\",\"transferAmount\":" + dto.getTransferAmount() + "}";
                onPaymentSuccess(order, payment, txId, payload);

                return true;
            }
        }
        return false;
    }

    private void onPaymentSuccess(Order order, Payment payment, String gatewayTxId, String payload) {
        order.setStatus(Order.Status.PAID);
        orderRepository.save(order);

        // 1. Advance seller orders to PREPARING and init Delivery records
        java.util.List<com.smartecommerce.backend.entities.SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(order.getId());
        for (com.smartecommerce.backend.entities.SellerOrder so : sellerOrders) {
            if (so.getStatus() == com.smartecommerce.backend.entities.SellerOrder.Status.PENDING) {
                so.setStatus(com.smartecommerce.backend.entities.SellerOrder.Status.PREPARING);
                sellerOrderRepository.save(so);
            }
            deliveryRepository.findBySellerOrderId(so.getId()).orElseGet(() -> {
                com.smartecommerce.backend.entities.Delivery d = new com.smartecommerce.backend.entities.Delivery();
                d.setSellerOrder(so);
                d.setCarrier("Viettel Post Hỏa Tốc");
                d.setTrackingNumber("VTP-" + (100000 + (int)(Math.random() * 900000)));
                d.setStatus(com.smartecommerce.backend.entities.Delivery.Status.PENDING);
                d.setEta(java.time.LocalDateTime.now().plusDays(2));
                return deliveryRepository.save(d);
            });
        }

        // 2. Record Transaction
        PaymentTransaction tx = new PaymentTransaction();
        tx.setPayment(payment);
        tx.setGatewayTransactionId(gatewayTxId);
        tx.setPayload(payload);
        paymentTransactionRepository.save(tx);

        // 3. Log Audit to SystemLog
        try {
            com.smartecommerce.backend.entities.SystemLog log = new com.smartecommerce.backend.entities.SystemLog();
            log.setUserId(order.getCustomer() != null && order.getCustomer().getUser() != null ? order.getCustomer().getUser().getId() : null);
            log.setAction("PAYMENT_SUCCESS");
            log.setDetails("Xác nhận thanh toán cho đơn hàng #" + order.getId() + " - Mã GD: " + gatewayTxId + " - Tiền: $" + payment.getAmount());
            systemLogRepository.save(log);
        } catch (Exception ignored) {}
    }
}
