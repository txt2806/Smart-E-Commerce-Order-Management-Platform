package com.smartecommerce.backend.services;

import com.smartecommerce.backend.dto.CategoryDto;
import com.smartecommerce.backend.entities.Category;
import com.smartecommerce.backend.repositories.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Temporary method to seed some categories for testing
    public void seedCategories() {
        if (categoryRepository.count() == 0) {
            Category c1 = new Category();
            c1.setName("Electronics");
            c1.setDescription("Gadgets and devices");
            categoryRepository.save(c1);

            Category c2 = new Category();
            c2.setName("Fashion");
            c2.setDescription("Clothing and accessories");
            categoryRepository.save(c2);
        }
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
