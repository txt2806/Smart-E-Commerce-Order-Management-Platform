package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.PaymentDto;
import com.smartecommerce.backend.dto.SePayWebhookDto;
import com.smartecommerce.backend.entities.Order;
import com.smartecommerce.backend.entities.Payment;
import com.smartecommerce.backend.entities.PaymentTransaction;
import com.smartecommerce.backend.repositories.OrderRepository;
import com.smartecommerce.backend.repositories.PaymentRepository;
import com.smartecommerce.backend.repositories.PaymentTransactionRepository;
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

    private static final String BANK_ID = "MB"; // MBBank
    private static final String BANK_ACCOUNT = "0988889999";
    private static final String ACCOUNT_NAME = "SMART STORE PLATFORM";
    private static final long USD_TO_VND_RATE = 25400L;

    public PaymentService(PaymentRepository paymentRepository,
                          PaymentTransactionRepository paymentTransactionRepository,
                          OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
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
        String encodedAccountName = URLEncoder.encode(ACCOUNT_NAME, StandardCharsets.UTF_8);

        // Standard VietQR QuickLink (Napas 247)
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_ID, BANK_ACCOUNT, amountVnd, encodedContent, encodedAccountName);

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
                .bankAccount(BANK_ACCOUNT)
                .accountName(ACCOUNT_NAME)
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

        order.setStatus(Order.Status.PAID);
        orderRepository.save(order);

        // Record Transaction
        PaymentTransaction tx = new PaymentTransaction();
        tx.setPayment(payment);
        tx.setGatewayTransactionId("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        tx.setPayload("{\"status\":\"SUCCESS\",\"mode\":\"SIMULATED_ONE_CLICK_VERIFICATION\"}");
        paymentTransactionRepository.save(tx);

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
            Long orderId = Long.parseLong(matcher.group(1));
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null) {
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

                order.setStatus(Order.Status.PAID);
                orderRepository.save(order);

                PaymentTransaction tx = new PaymentTransaction();
                tx.setPayment(payment);
                tx.setGatewayTransactionId(dto.getCode() != null ? dto.getCode() : "SEPAY-" + dto.getId());
                tx.setPayload("{\"content\":\"" + dto.getContent() + "\",\"transferAmount\":" + dto.getTransferAmount() + "}");
                paymentTransactionRepository.save(tx);

                return true;
            }
        }
        return false;
    }
}
