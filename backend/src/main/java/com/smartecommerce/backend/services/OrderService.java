package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.CreateOrderRequestDto;
import com.smartecommerce.backend.dto.OrderResponseDto;
import com.smartecommerce.backend.dto.SellerOrderResponseDto;
import com.smartecommerce.backend.entities.*;
import com.smartecommerce.backend.repositories.*;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final UserDetailRepository userDetailRepository;
    private final PaymentRepository paymentRepository;
    private final SellerRepository sellerRepository;
    private final DeliveryRepository deliveryRepository;
    private final DeliveryService deliveryService;

    public OrderService(OrderRepository orderRepository,
                        SellerOrderRepository sellerOrderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        StoreRepository storeRepository,
                        CustomerRepository customerRepository,
                        UserRepository userRepository,
                        UserDetailRepository userDetailRepository,
                        PaymentRepository paymentRepository,
                        SellerRepository sellerRepository,
                        DeliveryRepository deliveryRepository,
                        DeliveryService deliveryService) {
        this.orderRepository = orderRepository;
        this.sellerOrderRepository = sellerOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.userDetailRepository = userDetailRepository;
        this.paymentRepository = paymentRepository;
        this.sellerRepository = sellerRepository;
        this.deliveryRepository = deliveryRepository;
        this.deliveryService = deliveryService;
    }

    private User getOrCreateCurrentUser(String email, String name) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return userRepository.findByUsername(auth.getName()).orElse(null);
        }

        // Guest user fallback or creation
        String guestUsername = (email != null && !email.isBlank()) ? email : "guest_" + System.currentTimeMillis();
        return userRepository.findByUsername(guestUsername).orElseGet(() -> {
            User guest = new User();
            guest.setUsername(guestUsername);
            guest.setPasswordHash("$2a$10$defaultHashForGuestCustomerOnly");
            guest.setRole(User.Role.CUSTOMER);
            return userRepository.saveAndFlush(guest);
        });
    }

    private Customer getOrCreateCustomer(User user) {
        return customerRepository.findById(user.getId()).orElseGet(() -> {
            Customer customer = new Customer();
            customer.setUser(user);
            customer.setUserId(user.getId());
            customer.setMembershipTier(Customer.MembershipTier.BRONZE);
            customer.setRewardPoints(50);
            return customerRepository.saveAndFlush(customer);
        });
    }

    @Transactional
    @CacheEvict(value = {"products", "loyalty"}, allEntries = true)
    public OrderResponseDto createOrder(CreateOrderRequestDto request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 1 sản phẩm.");
        }

        User user = getOrCreateCurrentUser(request.getEmail(), request.getRecipientName());
        Customer customer = getOrCreateCustomer(user);

        // 1. Create UserDetail for shipping
        UserDetail shippingDetail = new UserDetail();
        shippingDetail.setUser(user);
        shippingDetail.setName(request.getRecipientName() != null ? request.getRecipientName() : user.getUsername());
        shippingDetail.setPhone(request.getPhone() != null ? request.getPhone() : "0900000000");
        shippingDetail.setEmail(request.getEmail() != null ? request.getEmail() : user.getUsername());
        shippingDetail.setAddressLine(request.getAddressLine() != null ? request.getAddressLine() : "Địa chỉ mặc định");
        shippingDetail.setCity(request.getCity() != null ? request.getCity() : "TP. Hồ Chí Minh");
        shippingDetail.setIsDefault(false);
        shippingDetail = userDetailRepository.save(shippingDetail);

        // 2. Fetch products and calculate totals & store groupings
        Map<Store, List<CreateOrderRequestDto.OrderItemRequest>> storeItemsMap = new HashMap<>();
        BigDecimal orderTotal = BigDecimal.ZERO;

        for (CreateOrderRequestDto.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm ID " + itemReq.getProductId() + " không tồn tại."));

            Store store = product.getStore();
            if (store == null) {
                // Fallback to first available store in database
                store = storeRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Chưa có cửa hàng nào trong hệ thống."));
            }

            storeItemsMap.computeIfAbsent(store, k -> new ArrayList<>()).add(itemReq);

            BigDecimal price = itemReq.getPrice() != null ? itemReq.getPrice() : product.getBasePrice();
            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            orderTotal = orderTotal.add(price.multiply(BigDecimal.valueOf(qty)));

            // Deduct stock in real-time
            int currentStock = product.getStock() != null ? product.getStock() : 10;
            product.setStock(Math.max(0, currentStock - qty));
            productRepository.save(product);
        }

        // 3. Create Main Order
        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingDetail(shippingDetail);
        order.setTotalAmount(orderTotal);
        order.setStatus(Order.Status.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        // 4. Create SellerOrders & OrderItems
        List<OrderItem> savedOrderItems = new ArrayList<>();
        List<SellerOrder> savedSellerOrders = new ArrayList<>();

        for (Map.Entry<Store, List<CreateOrderRequestDto.OrderItemRequest>> entry : storeItemsMap.entrySet()) {
            Store store = entry.getKey();
            List<CreateOrderRequestDto.OrderItemRequest> items = entry.getValue();

            BigDecimal storeSubtotal = BigDecimal.ZERO;
            for (CreateOrderRequestDto.OrderItemRequest itemReq : items) {
                Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                BigDecimal price = itemReq.getPrice() != null ? itemReq.getPrice() : (product != null ? product.getBasePrice() : BigDecimal.ZERO);
                int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
                storeSubtotal = storeSubtotal.add(price.multiply(BigDecimal.valueOf(qty)));
            }

            SellerOrder sellerOrder = new SellerOrder();
            sellerOrder.setOrder(order);
            sellerOrder.setStore(store);
            sellerOrder.setSubtotal(storeSubtotal);
            sellerOrder.setShippingFee(BigDecimal.ZERO);
            sellerOrder.setStatus(SellerOrder.Status.PENDING);
            sellerOrder = sellerOrderRepository.save(sellerOrder);
            savedSellerOrders.add(sellerOrder);

            for (CreateOrderRequestDto.OrderItemRequest itemReq : items) {
                Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                BigDecimal price = itemReq.getPrice() != null ? itemReq.getPrice() : (product != null ? product.getBasePrice() : BigDecimal.ZERO);
                int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;

                OrderItem orderItem = new OrderItem();
                orderItem.setSellerOrder(sellerOrder);
                orderItem.setProduct(product);
                orderItem.setProductName(product != null ? product.getName() : "Sản phẩm");
                orderItem.setImageUrl(product != null ? product.getImageUrl() : null);
                orderItem.setColor(itemReq.getColor());
                orderItem.setQuantity(qty);
                orderItem.setPriceAtBuy(price);

                orderItem = orderItemRepository.save(orderItem);
                savedOrderItems.add(orderItem);
            }
        }

        // 5. Create Payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(orderTotal);
        if ("SEPAY_BANK_TRANSFER".equalsIgnoreCase(request.getPaymentMethod())) {
            payment.setMethod(Payment.Method.SEPAY_BANK_TRANSFER);
        } else {
            payment.setMethod(Payment.Method.COD);
        }
        payment.setStatus(Payment.Status.PENDING);
        paymentRepository.save(payment);

        return mapToOrderResponseDto(order, savedOrderItems, savedSellerOrders, payment);
    }

    public List<OrderResponseDto> getMyOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equalsIgnoreCase("anonymousUser")) {
            List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream().limit(10).collect(Collectors.toList());
            return batchLoadAndMapOrders(orders);
        }

        User user = userRepository.findByUsername(auth.getName()).orElse(null);
        if (user == null) {
            return Collections.emptyList();
        }

        List<Order> orders = orderRepository.findByCustomerUserIdOrderByCreatedAtDesc(user.getId());
        if (orders.isEmpty()) {
            List<Order> demoOrders = orderRepository.findAllByOrderByCreatedAtDesc().stream().limit(10).collect(Collectors.toList());
            return batchLoadAndMapOrders(demoOrders);
        }

        return batchLoadAndMapOrders(orders);
    }

    @Transactional
    @CacheEvict(value = {"products", "loyalty"}, allEntries = true)
    public OrderResponseDto cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));

        if (order.getStatus() == Order.Status.CANCELLED) {
            throw new IllegalStateException("Đơn hàng này đã được hủy trước đó.");
        }
        if (order.getStatus() == Order.Status.COMPLETED) {
            throw new IllegalStateException("Đơn hàng đã giao thành công, không thể hủy. Vui lòng yêu cầu đổi trả.");
        }

        // Cannot cancel if any seller order is already SHIPPING or DELIVERED
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(orderId);
        boolean alreadyShipped = sellerOrders.stream().anyMatch(so ->
                so.getStatus() == SellerOrder.Status.SHIPPING || so.getStatus() == SellerOrder.Status.DELIVERED
        );
        if (alreadyShipped) {
            throw new IllegalStateException("Đơn hàng đang trên đường vận chuyển, không thể hủy trực tiếp.");
        }

        // Security check
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            User user = userRepository.findByUsername(auth.getName()).orElse(null);
            if (user != null && user.getRole() != User.Role.ADMIN) {
                if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
                    if (!order.getCustomer().getUser().getId().equals(user.getId())) {
                        throw new SecurityException("Bạn không có quyền hủy đơn hàng của người khác.");
                    }
                }
            }
        }

        // 1. Mark Order CANCELLED
        order.setStatus(Order.Status.CANCELLED);
        orderRepository.save(order);

        // 2. Mark SellerOrders CANCELLED
        for (SellerOrder so : sellerOrders) {
            so.setStatus(SellerOrder.Status.CANCELLED);
            sellerOrderRepository.save(so);
        }

        // 3. Restock inventory for each order item
        List<OrderItem> items = orderItemRepository.findBySellerOrderOrderId(orderId);
        for (OrderItem item : items) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                int currentStock = product.getStock() != null ? product.getStock() : 0;
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                product.setStock(currentStock + qty);
                productRepository.save(product);
            }
        }

        // 4. Update payment if pending
        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            if (payment.getStatus() == Payment.Status.PENDING) {
                payment.setStatus(Payment.Status.FAILED);
                paymentRepository.save(payment);
            }
        });

        return loadAndMapOrder(order);
    }

    private List<OrderResponseDto> batchLoadAndMapOrders(List<Order> orders) {
        if (orders.isEmpty()) return Collections.emptyList();

        List<Long> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());

        // Batch Query 1: All items with product and store
        List<OrderItem> allItems = orderItemRepository.findByOrderIdInWithDetails(orderIds);
        Map<Long, List<OrderItem>> itemsByOrderId = allItems.stream()
                .filter(it -> it.getSellerOrder() != null && it.getSellerOrder().getOrder() != null)
                .collect(Collectors.groupingBy(it -> it.getSellerOrder().getOrder().getId()));

        // Batch Query 2: All seller orders
        List<SellerOrder> allSellerOrders = sellerOrderRepository.findByOrderIdIn(orderIds);
        Map<Long, List<SellerOrder>> sellerOrdersByOrderId = allSellerOrders.stream()
                .filter(so -> so.getOrder() != null)
                .collect(Collectors.groupingBy(so -> so.getOrder().getId()));

        // Batch Query 3: All payments
        List<Payment> allPayments = paymentRepository.findByOrderIdIn(orderIds);
        Map<Long, Payment> paymentByOrderId = allPayments.stream()
                .filter(p -> p.getOrder() != null)
                .collect(Collectors.toMap(p -> p.getOrder().getId(), p -> p, (p1, p2) -> p1));

        // Batch Query 4: Deliveries
        List<Long> sellerOrderIds = allSellerOrders.stream().map(SellerOrder::getId).collect(Collectors.toList());
        Map<Long, Delivery> deliveryBySellerOrderId = sellerOrderIds.isEmpty() ? Collections.emptyMap() :
                deliveryRepository.findBySellerOrderIdIn(sellerOrderIds).stream()
                        .filter(d -> d.getSellerOrder() != null)
                        .collect(Collectors.toMap(d -> d.getSellerOrder().getId(), d -> d, (d1, d2) -> d1));

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
        return orders.stream().map(order -> {
            List<OrderItem> items = itemsByOrderId.getOrDefault(order.getId(), Collections.emptyList());
            List<SellerOrder> sOrders = sellerOrdersByOrderId.getOrDefault(order.getId(), Collections.emptyList());
            Payment payment = paymentByOrderId.get(order.getId());

            OrderResponseDto dto = new OrderResponseDto();
            dto.setId(order.getId());
            dto.setOrderCode("ORD-" + (10000 + order.getId()));
            dto.setCreatedAt(order.getCreatedAt());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus().name());

            if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
                dto.setCustomerUsername(order.getCustomer().getUser().getUsername());
            }

            if (order.getShippingDetail() != null) {
                dto.setRecipientName(order.getShippingDetail().getName());
                dto.setPhone(order.getShippingDetail().getPhone());
                dto.setEmail(order.getShippingDetail().getEmail());
                dto.setAddressLine(order.getShippingDetail().getAddressLine());
                dto.setCity(order.getShippingDetail().getCity());
            }

            if (payment != null) {
                dto.setPaymentMethod(payment.getMethod().name());
                dto.setPaymentStatus(payment.getStatus().name());
            } else {
                dto.setPaymentMethod("COD");
                dto.setPaymentStatus("PENDING");
            }

            dto.setItems(items.stream().map(it -> {
                OrderResponseDto.OrderItemResponseDto itemDto = new OrderResponseDto.OrderItemResponseDto();
                itemDto.setId(it.getId());
                itemDto.setProductId(it.getProduct() != null ? it.getProduct().getId() : null);
                itemDto.setProductName(it.getProductName() != null ? it.getProductName() : (it.getProduct() != null ? it.getProduct().getName() : "Sản phẩm"));
                itemDto.setImageUrl(it.getImageUrl() != null ? it.getImageUrl() : (it.getProduct() != null ? it.getProduct().getImageUrl() : null));
                itemDto.setSku(it.getProduct() != null ? it.getProduct().getSku() : null);
                itemDto.setColor(it.getColor());
                itemDto.setQuantity(it.getQuantity());
                itemDto.setPriceAtBuy(it.getPriceAtBuy());
                itemDto.setLineTotal(it.getPriceAtBuy().multiply(BigDecimal.valueOf(it.getQuantity())));
                if (it.getSellerOrder() != null && it.getSellerOrder().getStore() != null) {
                    itemDto.setStoreName(it.getSellerOrder().getStore().getName());
                }
                return itemDto;
            }).collect(Collectors.toList()));

            dto.setSellerOrders(sOrders.stream().map(so -> {
                OrderResponseDto.SellerOrderSummaryDto sDto = new OrderResponseDto.SellerOrderSummaryDto();
                sDto.setSellerOrderId(so.getId());
                sDto.setStoreId(so.getStore() != null ? so.getStore().getId() : null);
                sDto.setStoreName(so.getStore() != null ? so.getStore().getName() : "Smart Official Store");
                sDto.setSubtotal(so.getSubtotal());
                sDto.setShippingFee(so.getShippingFee());
                sDto.setStatus(so.getStatus().name());
                return sDto;
            }).collect(Collectors.toList()));

            for (SellerOrder so : sOrders) {
                Delivery del = deliveryBySellerOrderId.get(so.getId());
                if (del != null) {
                    dto.setCarrier(del.getCarrier());
                    dto.setTrackingNumber(del.getTrackingNumber());
                    if (del.getEta() != null) {
                        dto.setEta(del.getEta().format(dtf));
                    }
                    break;
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public OrderResponseDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + id));
        return loadAndMapOrder(order);
    }

    public List<SellerOrderResponseDto> getSellerOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Store store = null;

        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            User user = userRepository.findByUsername(auth.getName()).orElse(null);
            if (user != null) {
                Seller seller = sellerRepository.findByUser(user).orElse(null);
                if (seller != null) {
                    store = storeRepository.findBySeller(seller).orElse(null);
                }
            }
        }

        List<SellerOrder> sellerOrders;
        if (store != null) {
            sellerOrders = sellerOrderRepository.findByStoreId(store.getId());
        } else {
            sellerOrders = sellerOrderRepository.findAll();
        }

        if (sellerOrders.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> soIds = sellerOrders.stream().map(SellerOrder::getId).collect(Collectors.toList());
        List<OrderItem> allItems = orderItemRepository.findBySellerOrderIdInWithProduct(soIds);
        Map<Long, List<OrderItem>> itemsBySoId = allItems.stream()
                .filter(it -> it.getSellerOrder() != null)
                .collect(Collectors.groupingBy(it -> it.getSellerOrder().getId()));

        Map<Long, Delivery> deliveryBySoId = deliveryRepository.findBySellerOrderIdIn(soIds).stream()
                .filter(d -> d.getSellerOrder() != null)
                .collect(Collectors.toMap(d -> d.getSellerOrder().getId(), d -> d, (d1, d2) -> d1));

        List<Long> orderIds = sellerOrders.stream()
                .filter(so -> so.getOrder() != null)
                .map(so -> so.getOrder().getId())
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Payment> paymentByOrderId = orderIds.isEmpty() ? Collections.emptyMap() :
                paymentRepository.findByOrderIdIn(orderIds).stream()
                        .filter(p -> p.getOrder() != null)
                        .collect(Collectors.toMap(p -> p.getOrder().getId(), p -> p, (p1, p2) -> p1));

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
        return sellerOrders.stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .map(so -> {
                    SellerOrderResponseDto dto = new SellerOrderResponseDto();
                    dto.setId(so.getId());
                    dto.setOrderId(so.getOrder() != null ? so.getOrder().getId() : null);
                    dto.setOrderCode("ORD-" + (10000 + (so.getOrder() != null ? so.getOrder().getId() : so.getId())));
                    dto.setCreatedAt(so.getOrder() != null ? so.getOrder().getCreatedAt() : LocalDateTime.now());
                    dto.setSubtotal(so.getSubtotal());
                    dto.setShippingFee(so.getShippingFee());
                    dto.setTotal(so.getSubtotal().add(so.getShippingFee()));
                    dto.setStatus(so.getStatus().name());

                    Delivery del = deliveryBySoId.get(so.getId());
                    if (del != null) {
                        dto.setCarrier(del.getCarrier());
                        dto.setTrackingNumber(del.getTrackingNumber());
                        if (del.getEta() != null) {
                            dto.setEta(del.getEta().format(dtf));
                        }
                    }

                    if (so.getOrder() != null && so.getOrder().getShippingDetail() != null) {
                        UserDetail detail = so.getOrder().getShippingDetail();
                        dto.setCustomerName(detail.getName());
                        dto.setCustomerPhone(detail.getPhone());
                        dto.setShippingAddress(detail.getAddressLine());
                        dto.setCity(detail.getCity());
                    }

                    Payment payment = so.getOrder() != null ? paymentByOrderId.get(so.getOrder().getId()) : null;
                    if (payment != null) {
                        dto.setPaymentMethod(payment.getMethod().name());
                        dto.setPaymentStatus(payment.getStatus().name());
                    } else {
                        dto.setPaymentMethod("COD");
                        dto.setPaymentStatus("PENDING");
                    }

                    List<OrderItem> items = itemsBySoId.getOrDefault(so.getId(), Collections.emptyList());
                    dto.setItems(items.stream().map(it -> {
                        OrderResponseDto.OrderItemResponseDto itemDto = new OrderResponseDto.OrderItemResponseDto();
                        itemDto.setId(it.getId());
                        itemDto.setProductId(it.getProduct() != null ? it.getProduct().getId() : null);
                        itemDto.setProductName(it.getProductName() != null ? it.getProductName() : (it.getProduct() != null ? it.getProduct().getName() : "Sản phẩm"));
                        itemDto.setImageUrl(it.getImageUrl() != null ? it.getImageUrl() : (it.getProduct() != null ? it.getProduct().getImageUrl() : null));
                        itemDto.setSku(it.getProduct() != null ? it.getProduct().getSku() : null);
                        itemDto.setColor(it.getColor());
                        itemDto.setQuantity(it.getQuantity());
                        itemDto.setPriceAtBuy(it.getPriceAtBuy());
                        itemDto.setLineTotal(it.getPriceAtBuy().multiply(BigDecimal.valueOf(it.getQuantity())));
                        return itemDto;
                    }).collect(Collectors.toList()));

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public SellerOrderResponseDto updateSellerOrderStatus(Long sellerOrderId, String statusStr) {
        SellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng của nhà bán ID: " + sellerOrderId));

        try {
            SellerOrder.Status status = SellerOrder.Status.valueOf(statusStr.toUpperCase());
            sellerOrder.setStatus(status);
            sellerOrder = sellerOrderRepository.save(sellerOrder);

            // If DELIVERED or CANCELLED, sync main order status if all seller orders are done
            Order mainOrder = sellerOrder.getOrder();
            if (mainOrder != null) {
                if (status == SellerOrder.Status.DELIVERED) {
                    mainOrder.setStatus(Order.Status.COMPLETED);
                    orderRepository.save(mainOrder);
                } else if (status == SellerOrder.Status.CANCELLED) {
                    mainOrder.setStatus(Order.Status.CANCELLED);
                    orderRepository.save(mainOrder);
                } else if (status == SellerOrder.Status.SHIPPING) {
                    mainOrder.setStatus(Order.Status.PROCESSING);
                    orderRepository.save(mainOrder);
                    // Automatically provision shipping delivery
                    deliveryService.createOrUpdateDelivery(sellerOrderId, "Viettel Post Hỏa Tốc", null);
                }
            }

            return mapToSellerOrderResponseDto(sellerOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + statusStr);
        }
    }

    private OrderResponseDto loadAndMapOrder(Order order) {
        List<OrderItem> items = orderItemRepository.findBySellerOrderOrderId(order.getId());
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(order.getId());
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        return mapToOrderResponseDto(order, items, sellerOrders, payment);
    }

    private OrderResponseDto mapToOrderResponseDto(Order order, List<OrderItem> items, List<SellerOrder> sellerOrders, Payment payment) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setOrderCode("ORD-" + (10000 + order.getId()));
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());

        if (order.getCustomer() != null && order.getCustomer().getUser() != null) {
            dto.setCustomerUsername(order.getCustomer().getUser().getUsername());
        }

        if (order.getShippingDetail() != null) {
            dto.setRecipientName(order.getShippingDetail().getName());
            dto.setPhone(order.getShippingDetail().getPhone());
            dto.setEmail(order.getShippingDetail().getEmail());
            dto.setAddressLine(order.getShippingDetail().getAddressLine());
            dto.setCity(order.getShippingDetail().getCity());
        }

        if (payment != null) {
            dto.setPaymentMethod(payment.getMethod().name());
            dto.setPaymentStatus(payment.getStatus().name());
        } else {
            dto.setPaymentMethod("COD");
            dto.setPaymentStatus("PENDING");
        }

        dto.setItems(items.stream().map(it -> {
            OrderResponseDto.OrderItemResponseDto itemDto = new OrderResponseDto.OrderItemResponseDto();
            itemDto.setId(it.getId());
            itemDto.setProductId(it.getProduct() != null ? it.getProduct().getId() : null);
            itemDto.setProductName(it.getProductName() != null ? it.getProductName() : (it.getProduct() != null ? it.getProduct().getName() : "Sản phẩm"));
            itemDto.setImageUrl(it.getImageUrl() != null ? it.getImageUrl() : (it.getProduct() != null ? it.getProduct().getImageUrl() : null));
            itemDto.setSku(it.getProduct() != null ? it.getProduct().getSku() : null);
            itemDto.setColor(it.getColor());
            itemDto.setQuantity(it.getQuantity());
            itemDto.setPriceAtBuy(it.getPriceAtBuy());
            itemDto.setLineTotal(it.getPriceAtBuy().multiply(BigDecimal.valueOf(it.getQuantity())));
            if (it.getSellerOrder() != null && it.getSellerOrder().getStore() != null) {
                itemDto.setStoreName(it.getSellerOrder().getStore().getName());
            }
            return itemDto;
        }).collect(Collectors.toList()));

        dto.setSellerOrders(sellerOrders.stream().map(so -> {
            OrderResponseDto.SellerOrderSummaryDto sDto = new OrderResponseDto.SellerOrderSummaryDto();
            sDto.setSellerOrderId(so.getId());
            sDto.setStoreId(so.getStore() != null ? so.getStore().getId() : null);
            sDto.setStoreName(so.getStore() != null ? so.getStore().getName() : "Smart Official Store");
            sDto.setSubtotal(so.getSubtotal());
            sDto.setShippingFee(so.getShippingFee());
            sDto.setStatus(so.getStatus().name());
            return sDto;
        }).collect(Collectors.toList()));

        // Find any active delivery info across seller orders
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
        for (SellerOrder so : sellerOrders) {
            deliveryRepository.findBySellerOrderId(so.getId()).ifPresent(del -> {
                dto.setCarrier(del.getCarrier());
                dto.setTrackingNumber(del.getTrackingNumber());
                if (del.getEta() != null) {
                    dto.setEta(del.getEta().format(dtf));
                }
            });
            if (dto.getTrackingNumber() != null) break;
        }

        return dto;
    }

    private SellerOrderResponseDto mapToSellerOrderResponseDto(SellerOrder so) {
        SellerOrderResponseDto dto = new SellerOrderResponseDto();
        dto.setId(so.getId());
        dto.setOrderId(so.getOrder() != null ? so.getOrder().getId() : null);
        dto.setOrderCode("ORD-" + (10000 + (so.getOrder() != null ? so.getOrder().getId() : so.getId())));
        dto.setCreatedAt(so.getOrder() != null ? so.getOrder().getCreatedAt() : LocalDateTime.now());
        dto.setSubtotal(so.getSubtotal());
        dto.setShippingFee(so.getShippingFee());
        dto.setTotal(so.getSubtotal().add(so.getShippingFee()));
        dto.setStatus(so.getStatus().name());

        // Delivery info
        deliveryRepository.findBySellerOrderId(so.getId()).ifPresent(del -> {
            dto.setCarrier(del.getCarrier());
            dto.setTrackingNumber(del.getTrackingNumber());
            if (del.getEta() != null) {
                dto.setEta(del.getEta().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy")));
            }
        });

        if (so.getOrder() != null && so.getOrder().getShippingDetail() != null) {
            UserDetail detail = so.getOrder().getShippingDetail();
            dto.setCustomerName(detail.getName());
            dto.setCustomerPhone(detail.getPhone());
            dto.setShippingAddress(detail.getAddressLine());
            dto.setCity(detail.getCity());
        }

        Payment payment = paymentRepository.findByOrderId(so.getOrder() != null ? so.getOrder().getId() : 0L).orElse(null);
        if (payment != null) {
            dto.setPaymentMethod(payment.getMethod().name());
            dto.setPaymentStatus(payment.getStatus().name());
        } else {
            dto.setPaymentMethod("COD");
            dto.setPaymentStatus("PENDING");
        }

        List<OrderItem> items = orderItemRepository.findBySellerOrderId(so.getId());
        dto.setItems(items.stream().map(it -> {
            OrderResponseDto.OrderItemResponseDto itemDto = new OrderResponseDto.OrderItemResponseDto();
            itemDto.setId(it.getId());
            itemDto.setProductId(it.getProduct() != null ? it.getProduct().getId() : null);
            itemDto.setProductName(it.getProductName() != null ? it.getProductName() : (it.getProduct() != null ? it.getProduct().getName() : "Sản phẩm"));
            itemDto.setImageUrl(it.getImageUrl() != null ? it.getImageUrl() : (it.getProduct() != null ? it.getProduct().getImageUrl() : null));
            itemDto.setSku(it.getProduct() != null ? it.getProduct().getSku() : null);
            itemDto.setColor(it.getColor());
            itemDto.setQuantity(it.getQuantity());
            itemDto.setPriceAtBuy(it.getPriceAtBuy());
            itemDto.setLineTotal(it.getPriceAtBuy().multiply(BigDecimal.valueOf(it.getQuantity())));
            return itemDto;
        }).collect(Collectors.toList()));

        return dto;
    }
}
