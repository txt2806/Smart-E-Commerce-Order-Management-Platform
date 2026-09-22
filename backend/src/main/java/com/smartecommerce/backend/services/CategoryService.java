package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.CategoryDto;
import com.smartecommerce.backend.entities.Category;
import com.smartecommerce.backend.repositories.CategoryRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CategoryDto mapToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
        }
        return dto;
    }
}
