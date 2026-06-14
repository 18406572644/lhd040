package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.entity.Customer;
import com.example.watchrepair.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public PageResult<Customer> findAll(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Customer> customerPage;
        if (keyword != null && !keyword.isEmpty()) {
            customerPage = customerRepository.findByNameContainingOrPhoneContaining(keyword, keyword, pageable);
        } else {
            customerPage = customerRepository.findAll(pageable);
        }
        return PageResult.of(customerPage);
    }

    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("客户不存在"));
    }

    public Customer create(Customer customer) {
        return customerRepository.save(customer);
    }

    public Customer update(Long id, Customer customer) {
        Customer existing = findById(id);
        existing.setName(customer.getName());
        existing.setPhone(customer.getPhone());
        existing.setEmail(customer.getEmail());
        existing.setAddress(customer.getAddress());
        existing.setNotes(customer.getNotes());
        return customerRepository.save(existing);
    }

    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new BusinessException("客户不存在");
        }
        customerRepository.deleteById(id);
    }
}
