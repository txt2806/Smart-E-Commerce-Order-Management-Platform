package com.smartecommerce.backend.repositories;

import com.smartecommerce.backend.entities.Seller;
import com.smartecommerce.backend.entities.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findBySeller(Seller seller);
}
