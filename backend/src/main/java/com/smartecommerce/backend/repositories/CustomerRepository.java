package com.smartecommerce.backend.repositories;
import com.smartecommerce.backend.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CustomerRepository extends JpaRepository<Customer, Long> {}