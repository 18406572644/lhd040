package com.example.watchrepair.controller;

import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.common.Result;
import com.example.watchrepair.entity.Customer;
import com.example.watchrepair.service.CustomerService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public Result<PageResult<Customer>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(customerService.findAll(page, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<Customer> getById(@PathVariable Long id) {
        return Result.success(customerService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<Customer> create(@RequestBody Customer customer) {
        return Result.success(customerService.create(customer));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        return Result.success(customerService.update(id, customer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        customerService.delete(id);
        return Result.success();
    }
}
