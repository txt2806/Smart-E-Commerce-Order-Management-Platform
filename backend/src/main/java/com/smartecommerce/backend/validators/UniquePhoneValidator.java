package com.smartecommerce.backend.validators;

import com.smartecommerce.backend.repositories.UserProfileRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

public class UniquePhoneValidator implements ConstraintValidator<UniquePhone, String> {

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) return true;
        return !userProfileRepository.existsByPhone(value);
    }
}