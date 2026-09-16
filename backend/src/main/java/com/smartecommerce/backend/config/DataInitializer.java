package com.smartecommerce.backend.config;

import com.smartecommerce.backend.entities.*;
import com.smartecommerce.backend.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           StoreRepository storeRepository,
                           SellerRepository sellerRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.sellerRepository = sellerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Categories
        Map<String, Category> catMap = new HashMap<>();
        String[][] categoriesData = {
            {"Mac", "MacBook, Mac Studio và máy trạm hiệu năng cao", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80"},
            {"iPhone", "Điện thoại thông minh Titanium đỉnh cao", "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80"},
            {"iPad", "Máy tính bảng màn hình Tandem OLED M4", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80"},
            {"Apple Watch", "Đồng hồ thông minh theo dõi sức khỏe và thể thao", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80"},
            {"Apple Vision Pro", "Thiết bị điện toán không gian đột phá visionOS", "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=400&q=80"},
            {"AirPods & Âm Thanh", "Tai nghe chống ồn chủ động thích ứng và HomePod", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80"},
            {"Màn Hình & Phụ Kiện", "Studio Display 5K, Pro Display XDR và phụ kiện", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80"}
        };

        for (String[] c : categoriesData) {
            String name = c[0];
            Category cat = categoryRepository.findAll().stream()
                    .filter(item -> item.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(name);
                        newCat.setDescription(c[1]);
                        newCat.setImageUrl(c[2]);
                        return categoryRepository.save(newCat);
                    });
            catMap.put(name, cat);
        }

        // 2. Ensure official seller & store exist
        User systemSellerUser = userRepository.findByUsername("seller@smartecom.io")
                .orElseGet(() -> {
                    User u = new User();
                    u.setUsername("seller@smartecom.io");
                    u.setPasswordHash(passwordEncoder.encode("Password123!"));
                    u.setRole(User.Role.SELLER);
                    return userRepository.save(u);
                });

        Seller systemSeller = sellerRepository.findByUser(systemSellerUser)
                .orElseGet(() -> {
                    Seller s = new Seller();
                    s.setUser(systemSellerUser);
                    s.setIdentityNumber("SYS-FLAGSHIP-001");
                    return sellerRepository.save(s);
                });

        Store officialStore = storeRepository.findBySeller(systemSeller)
                .orElseGet(() -> {
                    Store store = new Store();
                    store.setSeller(systemSeller);
                    store.setName("Apple Store Trực Tuyến Chính Thức");
                    store.setDescription("Cửa hàng trực tuyến chính thức cung cấp sản phẩm Apple nguyên seal bảo hành 1 đổi 1.");
                    store.setLogoUrl("https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80");
                    store.setStatus(Store.Status.ACTIVE);
                    return storeRepository.save(store);
                });

        // 3. 24 Curated Authentic Apple Store Products
        Object[][] productsList = {
            // --- Apple Vision Pro ---
            {
                "Apple Vision Pro",
                "Điện toán không gian 512GB",
                "Giải phóng không gian làm việc và giải trí với hệ điều hành visionOS trực quan, kiểm soát bằng mắt, tay và giọng nói.",
                "3499.00",
                "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80",
                "AP-VISPRO-M2", 5, 4.9, 428, "Mới Nhất", "Apple Vision Pro"
            },
            {
                "Hộp Du Lịch Apple Vision Pro",
                "Bảo vệ thiết bị khi di chuyển",
                "Thiết kế ôm khít lớp vỏ đệm polycarbonate chống va đập, ngăn chứa pin và phụ kiện gọn gàng.",
                "199.00",
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                "AP-VISPRO-CASE", 18, 4.8, 92, "Phụ Kiện", "Apple Vision Pro"
            },

            // --- Mac & MacBook ---
            {
                "MacBook Pro 16\" M3 Max",
                "Chip M3 Max • 64GB RAM • 1TB SSD",
                "Sức mạnh vô đối cho dựng phim 8K và tính toán AI. Màn hình Liquid Retina XDR sáng 1600 nits, pin 22 giờ.",
                "3999.00",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
                "MB-M3MAX-16", 4, 5.0, 812, "Hiệu Năng Đỉnh Cao", "Mac"
            },
            {
                "MacBook Pro 14\" M3 Pro",
                "Chip M3 Pro • 18GB RAM • 512GB SSD",
                "Sự kết hợp hoàn hảo giữa kích thước cơ động và sức mạnh đồ họa Pro. Hoàn thiện màu Space Black sang trọng.",
                "1999.00",
                "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "MB-M3PRO-14", 8, 4.9, 640, "Phổ Biến Nhất", "Mac"
            },
            {
                "MacBook Air 15\" M3",
                "Mỏng 11.5mm • Màn hình 15.3 inch",
                "Màn hình Liquid Retina rộng rãi, thiết kế siêu mỏng nhẹ không quạt hoàn toàn yên tĩnh, pin 18 giờ.",
                "1299.00",
                "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "MBA-M3-15", 12, 4.9, 930, "Mới", "Mac"
            },
            {
                "MacBook Air 13\" M3",
                "Siêu nhẹ 1.24kg • Màu Midnight",
                "Chiếc laptop được yêu thích nhất thế giới nay còn nhanh hơn với chip M3, hỗ trợ xuất 2 màn hình ngoài.",
                "1099.00",
                "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
                "MBA-M3-13", 16, 4.8, 1240, "Bán Chạy", "Mac"
            },
            {
                "Mac Studio M2 Ultra",
                "24-core CPU • 76-core GPU • 192GB RAM",
                "Cỗ máy trạm mạnh mẽ bậc nhất dành cho các phòng thu âm thanh, dựng phim Hollywood và mô hình ngôn ngữ lớn.",
                "3999.00",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "MS-M2ULTRA", 3, 5.0, 185, "Pro Workstation", "Mac"
            },
            {
                "Mac mini M2 Pro",
                "Kích thước nhỏ gọn 19.7cm",
                "Sức mạnh cấp chuyên nghiệp trong thân hình khối vuông tối giản, cổng kết nối đa dạng Thunderbolt 4.",
                "1299.00",
                "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                "MM-M2PRO", 7, 4.8, 310, "Giá Tốt", "Mac"
            },

            // --- iPhone ---
            {
                "iPhone 16 Pro Max",
                "Titan Sa Mạc • Màn hình 6.9\" Super Retina XDR",
                "Khung viền Titan cấp 5 siêu nhẹ, nút Điều Khiển Camera cảm ứng lực mới, camera Fusion 48MP zoom quang 5x.",
                "1199.00",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
                "IP-16PM-256", 10, 5.0, 2450, "Flagship Mới", "iPhone"
            },
            {
                "iPhone 16 Pro",
                "Titan Tự Nhiên • Màn hình 6.3\"",
                "Hiệu năng bứt phá với chip A18 Pro, thời lượng pin tăng vọt, hệ thống tản nhiệt graphene cao cấp.",
                "999.00",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
                "IP-16P-128", 14, 4.9, 1890, "Mới Nhất", "iPhone"
            },
            {
                "iPhone 16",
                "Màu Xanh Lưu Ly (Ultramarine)",
                "Mặt lưng kính pha màu nguyên khối bền bỉ, chip A18 hỗ trợ Apple Intelligence, nút Tác Vụ đa nhiệm.",
                "799.00",
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
                "IP-16-128", 22, 4.8, 1420, "Màu Sắc Mới", "iPhone"
            },
            {
                "Ốp Lưng MagSafe Trong Suốt iPhone 16 Pro",
                "Tích hợp nút điều khiển sapphire",
                "Vật liệu polycarbonate chống ố vàng cao cấp, nam châm tích hợp sạc không dây chuẩn xác.",
                "49.00",
                "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
                "IP-CASE-CLEAR", 45, 4.7, 530, "Phụ Kiện", "iPhone"
            },

            // --- iPad ---
            {
                "iPad Pro 13\" M4",
                "Ultra Retina Tandem OLED • Mỏng 5.1mm",
                "Chiếc máy mỏng nhất Apple từng sản xuất. Màn hình OLED hai lớp độ tương phản vô hạn, chip M4 đỉnh cao.",
                "1299.00",
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
                "IPAD-PRO-13", 6, 5.0, 780, "Siêu Mỏng", "iPad"
            },
            {
                "iPad Air 11\" M2",
                "Chip M2 • Màn hình Liquid Retina",
                "Hiệu năng đột phá cho sáng tạo nội dung, hỗ trợ Apple Pencil Pro và Magic Keyboard nổi.",
                "599.00",
                "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                "IPAD-AIR-11", 15, 4.9, 950, "Bán Chạy", "iPad"
            },
            {
                "Apple Pencil Pro",
                "Cảm biến bóp nhạy • Phản hồi rung haptic",
                "Cảm biến xoay thân bút Barrel Roll, chạm hai lần chuyển công cụ, tìm kiếm qua Find My tiện lợi.",
                "129.00",
                "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
                "PENCIL-PRO", 25, 4.9, 1100, "Phụ Kiện", "iPad"
            },

            // --- Apple Watch ---
            {
                "Apple Watch Ultra 2",
                "Titan Đen • Chống nước 100m",
                "Vỏ titan đen mạ PVD chống trầy cực hạn, màn hình sáng 3000 nits, GPS tần số kép chuẩn xác nhất.",
                "799.00",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "AW-ULTRA2-BLK", 5, 5.0, 940, "Độ Bền Quân Đội", "Apple Watch"
            },
            {
                "Apple Watch Series 10",
                "Nhôm Đen Bóng (Jet Black) • Mỏng nhất",
                "Màn hình OLED góc nhìn rộng lớn hơn 30%, sạc nhanh 80% chỉ trong 30 phút, phát hiện chứng ngưng thở khi ngủ.",
                "399.00",
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                "AW-S10-JETBLK", 14, 4.9, 1320, "Mới", "Apple Watch"
            },
            {
                "Dây Đeo Milanese Loop Titan Tự Nhiên",
                "Lưới đan titan dệt thủ công",
                "Khóa nam châm tùy chỉnh vô cấp ôm vừa vặn mọi cổ tay, chống mồ hôi và chống ăn mòn nước biển.",
                "199.00",
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                "AW-STRAP-MILAN", 30, 4.8, 410, "Phụ Kiện", "Apple Watch"
            },

            // --- AirPods & Âm Thanh ---
            {
                "AirPods Max (USB-C)",
                "Màu Midnight • Âm thanh Spatial Audio",
                "Cổng sạc USB-C mới, màng loa dynamic 40mm chống méo tiếng, đệm tai dạng lưới thoáng khí tuyệt đối.",
                "549.00",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                "AP-MAX-USBC", 9, 4.8, 1680, "Audiophile", "AirPods & Âm Thanh"
            },
            {
                "AirPods Pro 2 (USB-C)",
                "Khử tiếng ồn chủ động gấp 2 lần",
                "Chip H2 tối tân, tính năng Nhận biết Cuộc trò chuyện, bài kiểm tra thính lực đạt chuẩn lâm sàng.",
                "249.00",
                "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                "AP-PRO2-USBC", 28, 4.9, 3890, "Bán Chạy Nhất", "AirPods & Âm Thanh"
            },
            {
                "AirPods 4",
                "Thiết kế mở ôm khít • Chống ồn chủ động",
                "Lần đầu tiên tính năng khử ồn ANC xuất hiện trên thiết kế tai nghe mở, hộp sạc nhỏ gọn nhất lịch sử.",
                "179.00",
                "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
                "AP-4-ANC", 35, 4.8, 2100, "Mới", "AirPods & Âm Thanh"
            },
            {
                "HomePod (Thế hệ 2)",
                "Loa thông minh Midnight • Âm thanh vòm",
                "Củ loa trầm hành trình dài, 5 loa tweeter dạng chùm, cảm biến nhiệt độ và độ ẩm thông minh trong phòng.",
                "299.00",
                "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
                "HOMEPOD-GEN2", 11, 4.7, 510, "Smart Home", "AirPods & Âm Thanh"
            },

            // --- Màn Hình & Phụ Kiện ---
            {
                "Apple Studio Display 27\"",
                "Độ phân giải 5K • Kính Nano-texture",
                "Màn hình Retina 5K 14.7 triệu điểm ảnh, camera Ultra Wide 12MP căn giữa Center Stage, hệ thống 6 loa phòng thu.",
                "1899.00",
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
                "SD-5K-NANO", 4, 4.9, 320, "5K Retina", "Màn Hình & Phụ Kiện"
            },
            {
                "Bàn Phím Magic Keyboard Touch ID",
                "Bàn phím số mở rộng • Màu Đen Bạc",
                "Cảm biến vân tay Touch ID đăng nhập nhanh và thanh toán Apple Pay bảo mật, cổng sạc USB-C dệt dù cao cấp.",
                "199.00",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
                "MK-TOUCHID-NUM", 20, 4.8, 890, "USB-C Mới", "Màn Hình & Phụ Kiện"
            }
        };

        for (Object[] pData : productsList) {
            String name = (String) pData[0];
            String subname = (String) pData[1];
            String desc = (String) pData[2];
            BigDecimal price = new BigDecimal((String) pData[3]);
            String img = (String) pData[4];
            String hoverImg = (String) pData[5];
            String sku = (String) pData[6];
            int stock = (int) pData[7];
            double rating = (double) pData[8];
            int reviews = (int) pData[9];
            String badge = (String) pData[10];
            String catName = (String) pData[11];

            Category cat = catMap.getOrDefault(catName, catMap.values().iterator().next());

            productRepository.findBySku(sku).ifPresentOrElse(
                existing -> {
                    existing.setName(name);
                    existing.setSubname(subname);
                    existing.setDescription(desc);
                    existing.setBasePrice(price);
                    existing.setImageUrl(img);
                    existing.setHoverImageUrl(hoverImg);
                    existing.setStock(stock);
                    existing.setRating(rating);
                    existing.setReviews(reviews);
                    existing.setBadge(badge);
                    existing.setCategory(cat);
                    productRepository.save(existing);
                },
                () -> {
                    Product p = new Product();
                    p.setStore(officialStore);
                    p.setCategory(cat);
                    p.setName(name);
                    p.setSubname(subname);
                    p.setDescription(desc);
                    p.setBasePrice(price);
                    p.setImageUrl(img);
                    p.setHoverImageUrl(hoverImg);
                    p.setSku(sku);
                    p.setStock(stock);
                    p.setRating(rating);
                    p.setReviews(reviews);
                    p.setBadge(badge);
                    p.setStatus(Product.Status.ACTIVE);
                    productRepository.save(p);
                }
            );
        }

        System.out.println(">>> [DataInitializer] Successfully populated 24 authentic Apple Store products in database!");
    }
}
