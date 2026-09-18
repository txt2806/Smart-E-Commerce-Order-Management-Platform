package com.smartecommerce.backend.config;

import com.smartecommerce.backend.repositories.CategoryRepository;
import com.smartecommerce.backend.repositories.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(ProductRepository productRepository,
                           CategoryRepository categoryRepository,
                           JdbcTemplate jdbcTemplate) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Ensure table constraints in MySQL
        try {
            jdbcTemplate.execute("ALTER TABLE order_items MODIFY COLUMN product_variant_id BIGINT NULL");
        } catch (Exception ignored) {
            // Already altered or constraint satisfied
        }

        long catCount = categoryRepository.count();
        long prodCount = productRepository.count();

        System.out.println("==========================================================");
        System.out.println(">>> [Database Initializer] Connected directly to MySQL.");
        System.out.println(">>> Categories in DB: " + catCount);
        System.out.println(">>> Products in DB:   " + prodCount);
        System.out.println(">>> (Zero hardcoded data in Java code - Pure Database driven)");
        System.out.println("==========================================================");
    }
}
