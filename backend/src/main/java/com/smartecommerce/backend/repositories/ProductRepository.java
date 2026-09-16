package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.Product;
import com.smartecommerce.backend.entities.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStore(Store store);
    Optional<Product> findBySku(String sku);
}
