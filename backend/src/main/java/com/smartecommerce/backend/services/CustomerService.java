package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.CustomerLoyaltyDto;
import com.smartecommerce.backend.entities.Customer;
import com.smartecommerce.backend.entities.Order;
import com.smartecommerce.backend.entities.User;
import com.smartecommerce.backend.entities.UserProfile;
import com.smartecommerce.backend.repositories.CustomerRepository;
import com.smartecommerce.backend.repositories.OrderRepository;
import com.smartecommerce.backend.repositories.UserProfileRepository;
import com.smartecommerce.backend.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    public CustomerService(UserRepository userRepository,
                           UserProfileRepository userProfileRepository,
                           CustomerRepository customerRepository,
                           OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public CustomerLoyaltyDto getLoyaltyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            user = userRepository.findByUsername(auth.getName()).orElse(null);
        }

        // Graceful fallback for guest/unauthenticated preview in development
        if (user == null) {
            user = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.CUSTOMER)
                    .findFirst()
                    .orElse(null);
        }

        String username = (user != null) ? user.getUsername() : "Khách Hàng Smart Store";
        String fullName = username;

        Long userId = (user != null) ? user.getId() : null;
        if (userId != null) {
            UserProfile profile = userProfileRepository.findById(userId).orElse(null);
            if (profile != null && profile.getFirstName() != null) {
                String lastName = profile.getLastName() != null ? profile.getLastName() : "";
                fullName = (profile.getFirstName() + " " + lastName).trim();
            }
        }

        // Fetch non-cancelled orders to compute exact lifetime customer spending
        List<Order> orders = (userId != null)
                ? orderRepository.findByCustomerUserIdOrderByCreatedAtDesc(userId)
                : orderRepository.findAllByOrderByCreatedAtDesc();

        double totalSpent = orders.stream()
                .filter(o -> o.getStatus() != Order.Status.CANCELLED)
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount().doubleValue() : 0.0)
                .sum();

        // Backend core business rules for loyalty tiers
        String tierName;
        String nextTierName;
        double targetSpend;
        int progress;
        String cashbackRate;
        String shippingPrivilege;
        List<String> tierLevels;
        Customer.MembershipTier membershipTierEnum;

        if (totalSpent >= 10000.0) {
            tierName = "BLACK DIAMOND VIP";
            nextTierName = null;
            targetSpend = 10000.0;
            progress = 100;
            cashbackRate = "5.0%";
            shippingPrivilege = "Hỏa tốc VIP (Đóng trong 10 phút)";
            tierLevels = Arrays.asList("Gold ($2.5K)", "Titanium ($5K)", "Black Diamond (Hiện tại)");
            membershipTierEnum = Customer.MembershipTier.PLATINUM;
        } else if (totalSpent >= 5000.0) {
            tierName = "TITANIUM VIP";
            nextTierName = "Black Diamond ($10,000)";
            targetSpend = 10000.0;
            progress = (int) Math.min(100, Math.round((totalSpent / 10000.0) * 100));
            cashbackRate = "3.5%";
            shippingPrivilege = "Hỏa tốc ưu tiên (Đóng trong 15 phút)";
            tierLevels = Arrays.asList("Gold ($2.5K)", "Titanium VIP (Hiện tại)", "Black Diamond ($10K)");
            membershipTierEnum = Customer.MembershipTier.PLATINUM;
        } else if (totalSpent >= 2500.0) {
            tierName = "GOLD TIER";
            nextTierName = "Titanium VIP ($5,000)";
            targetSpend = 5000.0;
            progress = (int) Math.min(100, Math.round((totalSpent / 5000.0) * 100));
            cashbackRate = "2.5%";
            shippingPrivilege = "Miễn phí vận chuyển toàn quốc";
            tierLevels = Arrays.asList("Silver ($1K)", "Gold Tier (Hiện tại)", "Titanium VIP ($5K)");
            membershipTierEnum = Customer.MembershipTier.GOLD;
        } else if (totalSpent >= 1000.0) {
            tierName = "SILVER TIER";
            nextTierName = "Gold Tier ($2,500)";
            targetSpend = 2500.0;
            progress = (int) Math.min(100, Math.round((totalSpent / 2500.0) * 100));
            cashbackRate = "2.0%";
            shippingPrivilege = "Voucher ship giảm 50%";
            tierLevels = Arrays.asList("Standard", "Silver Tier (Hiện tại)", "Gold Tier ($2.5K)");
            membershipTierEnum = Customer.MembershipTier.SILVER;
        } else {
            tierName = "STANDARD MEMBER";
            nextTierName = "Silver Tier ($1,000)";
            targetSpend = 1000.0;
            progress = (int) Math.min(100, Math.max(totalSpent > 0 ? 5 : 0, Math.round((totalSpent / 1000.0) * 100)));
            cashbackRate = "1.0%";
            shippingPrivilege = "Giao hàng tiêu chuẩn toàn quốc";
            tierLevels = Arrays.asList("Khởi đầu", "Standard (Hiện tại)", "Silver ($1K)");
            membershipTierEnum = Customer.MembershipTier.BRONZE;
        }

        int rewardPoints = (int) Math.round(totalSpent / 10.0);

        // Sync and persist tier & reward points in MySQL customers table
        if (user != null) {
            final User finalUser = user;
            Customer customer = customerRepository.findById(user.getId()).orElseGet(() -> {
                Customer c = new Customer();
                c.setUser(finalUser);
                c.setUserId(finalUser.getId());
                return c;
            });
            customer.setMembershipTier(membershipTierEnum);
            customer.setRewardPoints(rewardPoints);
            customerRepository.save(customer);
        }

        return CustomerLoyaltyDto.builder()
                .username(username)
                .fullName(fullName)
                .membershipTier(membershipTierEnum.name())
                .tierTitle(tierName)
                .rewardPoints(rewardPoints)
                .totalSpent(Math.round(totalSpent * 100.0) / 100.0)
                .nextTierName(nextTierName)
                .targetSpend(targetSpend)
                .progressPercentage(progress)
                .cashbackRate(cashbackRate)
                .shippingPrivilege(shippingPrivilege)
                .tierLevels(tierLevels)
                .build();
    }
}
