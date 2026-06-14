package com.example.watchrepair.controller;

import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.common.Result;
import com.example.watchrepair.entity.RepairPart;
import com.example.watchrepair.entity.RepairRecord;
import com.example.watchrepair.entity.RepairStatus;
import com.example.watchrepair.service.RepairRecordService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/repairs")
public class RepairRecordController {

    private final RepairRecordService repairRecordService;

    public RepairRecordController(RepairRecordService repairRecordService) {
        this.repairRecordService = repairRecordService;
    }

    @GetMapping
    public Result<PageResult<RepairRecord>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return Result.success(repairRecordService.findAll(page, size, status));
    }

    @GetMapping("/customer/{customerId}")
    public Result<PageResult<RepairRecord>> listByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(repairRecordService.findByCustomerId(customerId, page, size));
    }

    @GetMapping("/watch/{watchId}")
    public Result<PageResult<RepairRecord>> listByWatch(
            @PathVariable Long watchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(repairRecordService.findByWatchId(watchId, page, size));
    }

    @GetMapping("/{id}")
    public Result<RepairRecord> getById(@PathVariable Long id) {
        return Result.success(repairRecordService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<RepairRecord> create(@RequestBody RepairRecord repairRecord) {
        return Result.success(repairRecordService.create(repairRecord));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<RepairRecord> update(@PathVariable Long id, @RequestBody RepairRecord repairRecord) {
        return Result.success(repairRecordService.update(id, repairRecord));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<RepairRecord> updateStatus(@PathVariable Long id, @RequestParam RepairStatus status) {
        return Result.success(repairRecordService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        repairRecordService.delete(id);
        return Result.success();
    }

    @GetMapping("/{id}/parts")
    public Result<List<RepairPart>> getParts(@PathVariable Long id) {
        return Result.success(repairRecordService.getParts(id));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<RepairPart> addPart(@PathVariable Long id, @RequestBody RepairPart repairPart) {
        return Result.success(repairRecordService.addPart(id, repairPart));
    }

    @DeleteMapping("/{id}/parts/{partId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> removePart(@PathVariable Long id, @PathVariable Long partId) {
        repairRecordService.removePart(id, partId);
        return Result.success();
    }
}
