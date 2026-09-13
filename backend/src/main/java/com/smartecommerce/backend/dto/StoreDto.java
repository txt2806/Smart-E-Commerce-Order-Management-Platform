package com.smartecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StoreDto {
    private Long id;

    @NotBlank(message = "Store name is required")
    private String name;

    private String description;
    
    private String logoUrl;
    
    private String status;
}
