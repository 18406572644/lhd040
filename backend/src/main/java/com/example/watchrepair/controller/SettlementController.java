package com.example.watchrepair.controller;

import com.example.watchrepair.common.Result;
import com.example.watchrepair.dto.PaymentRequest;
import com.example.watchrepair.dto.PickupConfirmRequest;
import com.example.watchrepair.dto.SettlementRequest;
import com.example.watchrepair.entity.PaymentRecord;
import com.example.watchrepair.entity.PickupVoucher;
import com.example.watchrepair.entity.Settlement;
import com.example.watchrepair.service.SettlementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN') or hasRole('RECEPTIONIST')")
    public Result<Settlement> createSettlement(@RequestBody SettlementRequest request) {
        return Result.success(settlementService.createSettlement(request));
    }

    @GetMapping("/{id}")
    public Result<Settlement> getSettlementById(@PathVariable Long id) {
        return Result.success(settlementService.getSettlementById(id));
    }

    @GetMapping("/repair/{repairId}")
    public Result<Settlement> getSettlementByRepairId(@PathVariable Long repairId) {
        return Result.success(settlementService.getSettlementByRepairId(repairId));
    }

    @PostMapping("/pay")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN') or hasRole('RECEPTIONIST')")
    public Result<PaymentRecord> processPayment(@RequestBody PaymentRequest request) {
        return Result.success(settlementService.processPayment(request));
    }

    @GetMapping("/{id}/payments")
    public Result<List<PaymentRecord>> getPaymentRecordsBySettlementId(@PathVariable Long id) {
        return Result.success(settlementService.getPaymentRecordsBySettlementId(id));
    }

    @GetMapping("/repair/{repairId}/payments")
    public Result<List<PaymentRecord>> getPaymentRecordsByRepairId(@PathVariable Long repairId) {
        return Result.success(settlementService.getPaymentRecordsByRepairId(repairId));
    }

    @PostMapping("/pickup")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN') or hasRole('RECEPTIONIST')")
    public Result<PickupVoucher> confirmPickup(@RequestBody PickupConfirmRequest request) {
        return Result.success(settlementService.confirmPickup(request));
    }

    @GetMapping("/pickup/{id}")
    public Result<PickupVoucher> getPickupVoucherById(@PathVariable Long id) {
        return Result.success(settlementService.getPickupVoucherById(id));
    }

    @GetMapping("/repair/{repairId}/pickup")
    public Result<PickupVoucher> getPickupVoucherByRepairId(@PathVariable Long repairId) {
        return Result.success(settlementService.getPickupVoucherByRepairId(repairId));
    }
}
