package com.smartecommerce.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductDto {
    private Long id;

    private Long storeId;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal basePrice;

    private String status;
    private LocalDateTime createdAt;
}
