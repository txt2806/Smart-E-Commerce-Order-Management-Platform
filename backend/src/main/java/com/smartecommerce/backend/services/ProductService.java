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

import java.util.List;
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
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setStatus(Product.Status.ACTIVE); // Default active for simplicity

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

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setStoreId(product.getStore().getId());
        dto.setCategoryId(product.getCategory().getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setBasePrice(product.getBasePrice());
        dto.setStatus(product.getStatus().name());
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }
}
