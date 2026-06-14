package com.example.watchrepair.controller;

import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.common.Result;
import com.example.watchrepair.entity.Watch;
import com.example.watchrepair.service.WatchService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/watches")
public class WatchController {

    private final WatchService watchService;

    public WatchController(WatchService watchService) {
        this.watchService = watchService;
    }

    @GetMapping
    public Result<PageResult<Watch>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(watchService.findAll(page, size, keyword));
    }

    @GetMapping("/customer/{customerId}")
    public Result<PageResult<Watch>> listByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(watchService.findByCustomerId(customerId, page, size));
    }

    @GetMapping("/customer/{customerId}/all")
    public Result<List<Watch>> listAllByCustomer(@PathVariable Long customerId) {
        return Result.success(watchService.listByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    public Result<Watch> getById(@PathVariable Long id) {
        return Result.success(watchService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<Watch> create(@RequestBody Watch watch) {
        return Result.success(watchService.create(watch));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<Watch> update(@PathVariable Long id, @RequestBody Watch watch) {
        return Result.success(watchService.update(id, watch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        watchService.delete(id);
        return Result.success();
    }
}
