package com.example.watchrepair.repository;

import com.example.watchrepair.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findByNameContainingOrPhoneContaining(String name, String phone, Pageable pageable);
}
