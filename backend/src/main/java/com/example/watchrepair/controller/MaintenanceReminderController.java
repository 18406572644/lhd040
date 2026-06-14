package com.example.watchrepair.controller;

import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.common.Result;
import com.example.watchrepair.entity.MaintenanceReminder;
import com.example.watchrepair.service.MaintenanceReminderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reminders")
public class MaintenanceReminderController {

    private final MaintenanceReminderService reminderService;

    public MaintenanceReminderController(MaintenanceReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    public Result<PageResult<MaintenanceReminder>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return Result.success(reminderService.findAll(page, size, status));
    }

    @GetMapping("/pending")
    public Result<List<MaintenanceReminder>> getPendingReminders() {
        return Result.success(reminderService.getPendingReminders());
    }

    @GetMapping("/customer/{customerId}")
    public Result<PageResult<MaintenanceReminder>> listByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(reminderService.findByCustomerId(customerId, page, size));
    }

    @GetMapping("/watch/{watchId}")
    public Result<List<MaintenanceReminder>> listByWatch(@PathVariable Long watchId) {
        return Result.success(reminderService.findByWatchId(watchId));
    }

    @GetMapping("/{id}")
    public Result<MaintenanceReminder> getById(@PathVariable Long id) {
        return Result.success(reminderService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<MaintenanceReminder> create(@RequestBody MaintenanceReminder reminder) {
        return Result.success(reminderService.create(reminder));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<MaintenanceReminder> update(@PathVariable Long id, @RequestBody MaintenanceReminder reminder) {
        return Result.success(reminderService.update(id, reminder));
    }

    @PutMapping("/{id}/sent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<MaintenanceReminder> markAsSent(@PathVariable Long id) {
        return Result.success(reminderService.markAsSent(id));
    }

    @PutMapping("/{id}/completed")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<MaintenanceReminder> markAsCompleted(@PathVariable Long id) {
        return Result.success(reminderService.markAsCompleted(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        reminderService.delete(id);
        return Result.success();
    }
}
