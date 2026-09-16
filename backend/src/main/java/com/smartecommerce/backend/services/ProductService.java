package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.ProductDto;
import com.smartecommerce.backend.entities.Category;
import com.smartecommerce.backend.entities.Product;
import com.smartecommerce.backend.entities.Seller;
import com.smartecommerce.backend.entities.Store;
import com.smartecommerce.backend.entities.User;
import com.smartecommerce.backend.repositories.CategoryRepository;
import com.smartecommerce.backend.repositories.ProductRepository;
import com.smartecommerce.backend.repositories.SellerRepository;
import com.smartecommerce.backend.repositories.StoreRepository;
import com.smartecommerce.backend.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, StoreRepository storeRepository,
                          CategoryRepository categoryRepository, SellerRepository sellerRepository,
                          UserRepository userRepository) {
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
        this.categoryRepository = categoryRepository;
        this.sellerRepository = sellerRepository;
        this.userRepository = userRepository;
    }

    private Seller getCurrentSeller() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return sellerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Seller profile not found"));
    }

    private Store getCurrentStore() {
        Seller seller = getCurrentSeller();
        return storeRepository.findBySeller(seller).orElseThrow(() -> new RuntimeException("Store not found for this seller"));
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        Store store = getCurrentStore();
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setStore(store);
        product.setCategory(category);
        product.setName(dto.getName());
        product.setSubname(dto.getSubname());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setImageUrl(dto.getImageUrl());
        product.setHoverImageUrl(dto.getHoverImageUrl());
        product.setSku(dto.getSku());
        product.setStock(dto.getStock() != null ? dto.getStock() : 10);
        product.setRating(dto.getRating() != null ? dto.getRating() : 5.0);
        product.setReviews(dto.getReviews() != null ? dto.getReviews() : 0);
        product.setBadge(dto.getBadge());
        product.setStatus(Product.Status.ACTIVE);

        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getSubname() != null) product.setSubname(dto.getSubname());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getBasePrice() != null) product.setBasePrice(dto.getBasePrice());
        if (dto.getStock() != null) product.setStock(dto.getStock());
        if (dto.getSku() != null) product.setSku(dto.getSku());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());
        if (dto.getHoverImageUrl() != null) product.setHoverImageUrl(dto.getHoverImageUrl());
        if (dto.getBadge() != null) product.setBadge(dto.getBadge());
        product.setUpdatedAt(LocalDateTime.now());

        product = productRepository.save(product);
        return mapToDto(product);
    }

    public List<ProductDto> getMyProducts() {
        Seller seller = getCurrentSeller();
        Optional<Store> storeOpt = storeRepository.findBySeller(seller);
        if (storeOpt.isEmpty()) {
            return List.of();
        }
        return productRepository.findByStore(storeOpt.get()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToDto(product);
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setStoreId(product.getStore() != null ? product.getStore().getId() : null);
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setName(product.getName());
        dto.setSubname(product.getSubname());
        dto.setDescription(product.getDescription());
        dto.setBasePrice(product.getBasePrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setHoverImageUrl(product.getHoverImageUrl());
        dto.setSku(product.getSku());
        dto.setStock(product.getStock() != null ? product.getStock() : 10);
        dto.setRating(product.getRating() != null ? product.getRating() : 5.0);
        dto.setReviews(product.getReviews() != null ? product.getReviews() : 100);
        dto.setBadge(product.getBadge());
        dto.setStatus(product.getStatus() != null ? product.getStatus().name() : "ACTIVE");
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }
}
