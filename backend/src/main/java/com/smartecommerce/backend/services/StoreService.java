package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.StoreDto;
import com.smartecommerce.backend.entities.Seller;
import com.smartecommerce.backend.entities.Store;
import com.smartecommerce.backend.entities.User;
import com.smartecommerce.backend.repositories.SellerRepository;
import com.smartecommerce.backend.repositories.StoreRepository;
import com.smartecommerce.backend.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class StoreService {

    private final StoreRepository storeRepository;
    private final SellerRepository sellerRepository;
    private final UserRepository userRepository;

    public StoreService(StoreRepository storeRepository, SellerRepository sellerRepository, UserRepository userRepository) {
        this.storeRepository = storeRepository;
        this.sellerRepository = sellerRepository;
        this.userRepository = userRepository;
    }

    private Seller getCurrentSeller() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        return sellerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Seller profile not found"));
    }

    @Transactional
    public StoreDto createOrUpdateStore(StoreDto storeDto) {
        Seller seller = getCurrentSeller();
        
        Store store = storeRepository.findBySeller(seller).orElse(new Store());
        
        if (store.getId() == null) {
            store.setSeller(seller);
            store.setStatus(Store.Status.PENDING); // New stores need approval
        }

        store.setName(storeDto.getName());
        store.setDescription(storeDto.getDescription());
        store.setLogoUrl(storeDto.getLogoUrl());

        store = storeRepository.save(store);

        return mapToDto(store);
    }

    public StoreDto getMyStore() {
        Seller seller = getCurrentSeller();
        Optional<Store> storeOpt = storeRepository.findBySeller(seller);
        if (storeOpt.isPresent()) {
            return mapToDto(storeOpt.get());
        } else {
            return null; // Return null if store not created yet
        }
    }

    private StoreDto mapToDto(Store store) {
        StoreDto dto = new StoreDto();
        dto.setId(store.getId());
        dto.setName(store.getName());
        dto.setDescription(store.getDescription());
        dto.setLogoUrl(store.getLogoUrl());
        dto.setStatus(store.getStatus().name());
        return dto;
    }
}
