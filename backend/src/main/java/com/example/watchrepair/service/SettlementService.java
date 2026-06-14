package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.dto.PaymentRequest;
import com.example.watchrepair.dto.PickupConfirmRequest;
import com.example.watchrepair.dto.SettlementRequest;
import com.example.watchrepair.entity.*;
import com.example.watchrepair.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final PickupVoucherRepository pickupVoucherRepository;
    private final RepairRecordRepository repairRecordRepository;
    private final RepairPartRepository repairPartRepository;
    private final CustomerRepository customerRepository;
    private final WatchRepository watchRepository;
    private final RepairStatusLogRepository repairStatusLogRepository;

    public SettlementService(SettlementRepository settlementRepository,
                             PaymentRecordRepository paymentRecordRepository,
                             PickupVoucherRepository pickupVoucherRepository,
                             RepairRecordRepository repairRecordRepository,
                             RepairPartRepository repairPartRepository,
                             CustomerRepository customerRepository,
                             WatchRepository watchRepository,
                             RepairStatusLogRepository repairStatusLogRepository) {
        this.settlementRepository = settlementRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.pickupVoucherRepository = pickupVoucherRepository;
        this.repairRecordRepository = repairRecordRepository;
        this.repairPartRepository = repairPartRepository;
        this.customerRepository = customerRepository;
        this.watchRepository = watchRepository;
        this.repairStatusLogRepository = repairStatusLogRepository;
    }

    @Transactional
    public Settlement createSettlement(SettlementRequest request) {
        RepairRecord repair = repairRecordRepository.findById(request.getRepairId())
                .orElseThrow(() -> new BusinessException("维修记录不存在"));

        if (repair.getStatus() != RepairStatus.PICKUP) {
            throw new BusinessException("只有待取件状态的维修单才能生成结算单");
        }

        if (settlementRepository.existsByRepairId(request.getRepairId())) {
            return settlementRepository.findByRepairId(request.getRepairId()).orElseThrow();
        }

        List<RepairPart> parts = repairPartRepository.findByRepairId(request.getRepairId());
        BigDecimal partsCost = parts.stream()
                .map(RepairPart::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal laborCost = repair.getLaborCost() != null ? repair.getLaborCost() : BigDecimal.ZERO;
        BigDecimal subtotal = partsCost.add(laborCost);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        String settlementNo = generateSettlementNo();

        Settlement settlement = new Settlement();
        settlement.setSettlementNo(settlementNo);
        settlement.setRepairId(request.getRepairId());
        settlement.setCustomerId(repair.getCustomerId());
        settlement.setLaborCost(laborCost);
        settlement.setPartsCost(partsCost);
        settlement.setSubtotal(subtotal);
        settlement.setDiscount(discount);
        settlement.setTotalAmount(totalAmount);
        settlement.setPaidAmount(BigDecimal.ZERO);
        settlement.setDiscountReason(request.getDiscountReason());
        settlement.setRemark(request.getRemark());
        settlement.setStatus("待支付");
        settlement.setOperator(request.getOperator());

        return settlementRepository.save(settlement);
    }

    public Settlement getSettlementByRepairId(Long repairId) {
        return settlementRepository.findByRepairId(repairId)
                .orElseThrow(() -> new BusinessException("结算单不存在"));
    }

    public Settlement getSettlementById(Long id) {
        return settlementRepository.findById(id)
                .orElseThrow(() -> new BusinessException("结算单不存在"));
    }

    @Transactional
    public PaymentRecord processPayment(PaymentRequest request) {
        Settlement settlement = settlementRepository.findById(request.getSettlementId())
                .orElseThrow(() -> new BusinessException("结算单不存在"));

        if ("已支付".equals(settlement.getStatus())) {
            throw new BusinessException("该结算单已支付完成");
        }

        PaymentMethod paymentMethod = PaymentMethod.valueOf(request.getPaymentMethod());
        BigDecimal paymentAmount = request.getAmount();
        BigDecimal remainingAmount = settlement.getTotalAmount().subtract(settlement.getPaidAmount());

        if (paymentAmount.compareTo(remainingAmount) > 0) {
            throw new BusinessException("支付金额不能超过待付金额：" + remainingAmount);
        }

        if (paymentMethod == PaymentMethod.MEMBER_BALANCE) {
            Customer customer = customerRepository.findById(settlement.getCustomerId())
                    .orElseThrow(() -> new BusinessException("客户不存在"));
            BigDecimal balance = customer.getMemberBalance() != null ? customer.getMemberBalance() : BigDecimal.ZERO;
            if (balance.compareTo(paymentAmount) < 0) {
                throw new BusinessException("会员余额不足，当前余额：" + balance);
            }
            customer.setMemberBalance(balance.subtract(paymentAmount));
            customerRepository.save(customer);
        }

        if (paymentMethod == PaymentMethod.POINTS) {
            Customer customer = customerRepository.findById(settlement.getCustomerId())
                    .orElseThrow(() -> new BusinessException("客户不存在"));
            int points = customer.getMemberPoints() != null ? customer.getMemberPoints() : 0;
            int pointsNeeded = paymentAmount.multiply(BigDecimal.valueOf(100)).intValue();
            if (points < pointsNeeded) {
                throw new BusinessException("积分不足，当前积分：" + points + "，需要：" + pointsNeeded);
            }
            customer.setMemberPoints(points - pointsNeeded);
            customerRepository.save(customer);
        }

        String paymentNo = generatePaymentNo();
        PaymentRecord paymentRecord = new PaymentRecord();
        paymentRecord.setPaymentNo(paymentNo);
        paymentRecord.setSettlementId(settlement.getId());
        paymentRecord.setRepairId(settlement.getRepairId());
        paymentRecord.setCustomerId(settlement.getCustomerId());
        paymentRecord.setPaymentMethod(paymentMethod);
        paymentRecord.setAmount(paymentAmount);
        paymentRecord.setTransactionNo(request.getTransactionNo());
        paymentRecord.setStatus("已支付");
        paymentRecord.setOperator(request.getOperator());
        paymentRecord.setRemark(request.getRemark());
        paymentRecord.setPaidTime(LocalDateTime.now());
        paymentRecordRepository.save(paymentRecord);

        BigDecimal newPaidAmount = settlement.getPaidAmount().add(paymentAmount);
        settlement.setPaidAmount(newPaidAmount);
        settlement.setPaymentMethod(paymentMethod);
        settlement.setTransactionNo(request.getTransactionNo());
        settlement.setPaidTime(LocalDateTime.now());

        if (newPaidAmount.compareTo(settlement.getTotalAmount()) >= 0) {
            settlement.setStatus("已支付");
        }

        settlementRepository.save(settlement);

        return paymentRecord;
    }

    public List<PaymentRecord> getPaymentRecordsBySettlementId(Long settlementId) {
        return paymentRecordRepository.findBySettlementIdOrderByCreateTimeDesc(settlementId);
    }

    public List<PaymentRecord> getPaymentRecordsByRepairId(Long repairId) {
        return paymentRecordRepository.findByRepairIdOrderByCreateTimeDesc(repairId);
    }

    @Transactional
    public PickupVoucher confirmPickup(PickupConfirmRequest request) {
        Settlement settlement = settlementRepository.findById(request.getSettlementId())
                .orElseThrow(() -> new BusinessException("结算单不存在"));

        if (!"已支付".equals(settlement.getStatus())) {
            throw new BusinessException("请先完成支付后再取件");
        }

        RepairRecord repair = repairRecordRepository.findById(request.getRepairId())
                .orElseThrow(() -> new BusinessException("维修记录不存在"));

        if (repair.getStatus() != RepairStatus.PICKUP) {
            throw new BusinessException("只有待取件状态的维修单才能确认取件");
        }

        String signature = request.getCustomerSignature();
        Boolean manualConfirm = request.getManualConfirm();
        if ((signature == null || signature.trim().isEmpty()) && (manualConfirm == null || !manualConfirm)) {
            throw new BusinessException("请客户签字确认或手动确认取件");
        }

        Customer customer = customerRepository.findById(repair.getCustomerId()).orElse(null);
        Watch watch = watchRepository.findById(repair.getWatchId()).orElse(null);

        String voucherNo = generateVoucherNo();
        String qrCodeData = String.format("PICKUP:%s|REPAIR:%d|CUSTOMER:%s",
                voucherNo, repair.getId(), customer != null ? customer.getName() : "");

        PickupVoucher voucher = new PickupVoucher();
        voucher.setVoucherNo(voucherNo);
        voucher.setRepairId(repair.getId());
        voucher.setSettlementId(settlement.getId());
        voucher.setCustomerId(repair.getCustomerId());
        voucher.setCustomerName(customer != null ? customer.getName() : "");
        voucher.setWatchInfo(watch != null ? watch.getBrand() + " " + watch.getModel() : "");
        voucher.setQrCodeData(qrCodeData);
        voucher.setStatus("已取件");
        voucher.setOperator(request.getOperator());
        voucher.setCustomerSignature(signature);
        voucher.setPickupTime(LocalDateTime.now());
        pickupVoucherRepository.save(voucher);

        settlement.setCustomerSignature(signature);
        settlementRepository.save(settlement);

        repair.setStatus(RepairStatus.COMPLETED);
        repair.setEndTime(LocalDateTime.now());
        repairRecordRepository.save(repair);

        RepairStatusLog log = new RepairStatusLog();
        log.setRepairId(repair.getId());
        log.setFromStatus(RepairStatus.PICKUP);
        log.setToStatus(RepairStatus.COMPLETED);
        log.setOperator(request.getOperator());
        log.setRemark("客户取件确认，结算单号：" + settlement.getSettlementNo());
        repairStatusLogRepository.save(log);

        return voucher;
    }

    public PickupVoucher getPickupVoucherByRepairId(Long repairId) {
        return pickupVoucherRepository.findByRepairId(repairId)
                .orElseThrow(() -> new BusinessException("取件凭证不存在"));
    }

    public PickupVoucher getPickupVoucherById(Long id) {
        return pickupVoucherRepository.findById(id)
                .orElseThrow(() -> new BusinessException("取件凭证不存在"));
    }

    private String generateSettlementNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "JS" + date + uuid;
    }

    private String generatePaymentNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "ZF" + date + uuid;
    }

    private String generateVoucherNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "QJ" + date + uuid;
    }
}
