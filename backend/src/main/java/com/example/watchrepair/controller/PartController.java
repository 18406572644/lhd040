package com.example.watchrepair.controller;

import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.common.Result;
import com.example.watchrepair.entity.Part;
import com.example.watchrepair.service.PartService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/parts")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    public Result<PageResult<Part>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        return Result.success(partService.findAll(page, size, keyword, category));
    }

    @GetMapping("/{id}")
    public Result<Part> getById(@PathVariable Long id) {
        return Result.success(partService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Part> create(@RequestBody Part part) {
        return Result.success(partService.create(part));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<Part> update(@PathVariable Long id, @RequestBody Part part) {
        return Result.success(partService.update(id, part));
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Part> updateStock(@PathVariable Long id, @RequestParam int quantity) {
        return Result.success(partService.updateStock(id, quantity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        partService.delete(id);
        return Result.success();
    }
}
