package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.dto.PickupNotifyRequest;
import com.example.watchrepair.dto.StatusTransitionRequest;
import com.example.watchrepair.entity.*;
import com.example.watchrepair.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RepairRecordService {

    private final RepairRecordRepository repairRecordRepository;
    private final RepairPartRepository repairPartRepository;
    private final PartRepository partRepository;
    private final WatchRepository watchRepository;
    private final CustomerRepository customerRepository;
    private final RepairStatusLogRepository repairStatusLogRepository;

    public RepairRecordService(RepairRecordRepository repairRecordRepository,
                               RepairPartRepository repairPartRepository,
                               PartRepository partRepository,
                               WatchRepository watchRepository,
                               CustomerRepository customerRepository,
                               RepairStatusLogRepository repairStatusLogRepository) {
        this.repairRecordRepository = repairRecordRepository;
        this.repairPartRepository = repairPartRepository;
        this.partRepository = partRepository;
        this.watchRepository = watchRepository;
        this.customerRepository = customerRepository;
        this.repairStatusLogRepository = repairStatusLogRepository;
    }

    public PageResult<RepairRecord> findAll(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<RepairRecord> repairPage;
        if (status != null && !status.isEmpty()) {
            repairPage = repairRecordRepository.findByStatus(RepairStatus.valueOf(status), pageable);
        } else {
            repairPage = repairRecordRepository.findAll(pageable);
        }
        return PageResult.of(repairPage);
    }

    public PageResult<RepairRecord> findByCustomerId(Long customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<RepairRecord> repairPage = repairRecordRepository.findByCustomerId(customerId, pageable);
        return PageResult.of(repairPage);
    }

    public PageResult<RepairRecord> findByWatchId(Long watchId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<RepairRecord> repairPage = repairRecordRepository.findByWatchId(watchId, pageable);
        return PageResult.of(repairPage);
    }

    public RepairRecord findById(Long id) {
        return repairRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException("维修记录不存在"));
    }

    public List<RepairStatusLog> getStatusLogs(Long repairId) {
        return repairStatusLogRepository.findByRepairIdOrderByCreateTimeAsc(repairId);
    }

    @Transactional
    public RepairRecord create(RepairRecord repairRecord) {
        Watch watch = watchRepository.findById(repairRecord.getWatchId())
                .orElseThrow(() -> new BusinessException("钟表档案不存在"));
        if (!customerRepository.existsById(repairRecord.getCustomerId())) {
            throw new BusinessException("客户不存在");
        }

        repairRecord.setStatus(RepairStatus.PENDING);
        repairRecord.setStartTime(LocalDateTime.now());
        if (repairRecord.getLaborCost() == null) {
            repairRecord.setLaborCost(BigDecimal.ZERO);
        }
        if (repairRecord.getTotalCost() == null) {
            repairRecord.setTotalCost(BigDecimal.ZERO);
        }

        RepairRecord saved = repairRecordRepository.save(repairRecord);

        RepairStatusLog log = new RepairStatusLog();
        log.setRepairId(saved.getId());
        log.setFromStatus(RepairStatus.PENDING);
        log.setToStatus(RepairStatus.PENDING);
        log.setOperator(repairRecord.getAssignedTechnician());
        log.setRemark("创建维修工单");
        repairStatusLogRepository.save(log);

        return saved;
    }

    @Transactional
    public RepairRecord update(Long id, RepairRecord repairRecord) {
        RepairRecord existing = findById(id);
        existing.setRepairType(repairRecord.getRepairType());
        existing.setFaultDescription(repairRecord.getFaultDescription());
        existing.setRepairContent(repairRecord.getRepairContent());
        existing.setNotes(repairRecord.getNotes());
        if (repairRecord.getLaborCost() != null) {
            existing.setLaborCost(repairRecord.getLaborCost());
            calculateTotalCost(existing);
        }
        return repairRecordRepository.save(existing);
    }

    @Transactional
    public RepairRecord transitionStatus(Long id, StatusTransitionRequest request) {
        RepairRecord repair = findById(id);
        RepairStatus currentStatus = repair.getStatus();
        RepairStatus targetStatus = RepairStatus.valueOf(request.getTargetStatus());

        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new BusinessException(
                String.format("不允许从 [%s] 直接变更为 [%s]，允许的目标状态：%s",
                    currentStatus.getLabel(),
                    targetStatus.getLabel(),
                    currentStatus.getAllowedTransitions().stream()
                        .map(RepairStatus::getLabel)
                        .reduce((a, b) -> a + "、" + b)
                        .orElse("无")
                )
            );
        }

        if (currentStatus == RepairStatus.INSPECTING && targetStatus == RepairStatus.REPAIRING) {
            if (request.getDiagnosisResult() == null || request.getDiagnosisResult().trim().isEmpty()) {
                throw new BusinessException("检测中流转到维修中时，必须填写诊断结果");
            }
            if (request.getEstimatedCost() == null) {
                throw new BusinessException("检测中流转到维修中时，必须填写预估费用");
            }
            repair.setDiagnosisResult(request.getDiagnosisResult());
            repair.setEstimatedCost(request.getEstimatedCost());
        }

        repair.setStatus(targetStatus);

        if (targetStatus == RepairStatus.INSPECTING && repair.getStartTime() == null) {
            repair.setStartTime(LocalDateTime.now());
        }

        if (targetStatus == RepairStatus.COMPLETED) {
            repair.setEndTime(LocalDateTime.now());
        }

        if (targetStatus == RepairStatus.CANCELLED) {
            repair.setEndTime(LocalDateTime.now());
        }

        RepairRecord saved = repairRecordRepository.save(repair);

        RepairStatusLog log = new RepairStatusLog();
        log.setRepairId(saved.getId());
        log.setFromStatus(currentStatus);
        log.setToStatus(targetStatus);
        log.setOperator(request.getOperator());
        log.setRemark(request.getRemark());
        if (currentStatus == RepairStatus.INSPECTING && targetStatus == RepairStatus.REPAIRING) {
            log.setDiagnosisResult(request.getDiagnosisResult());
            log.setEstimatedCost(request.getEstimatedCost());
        }
        repairStatusLogRepository.save(log);

        updateWatchStatus(saved);

        return saved;
    }

    @Transactional
    public RepairRecord updateStatus(Long id, RepairStatus status) {
        RepairRecord repair = findById(id);
        repair.setStatus(status);

        if (status == RepairStatus.INSPECTING && repair.getStartTime() == null) {
            repair.setStartTime(LocalDateTime.now());
        }
        if (status == RepairStatus.COMPLETED) {
            repair.setEndTime(LocalDateTime.now());
        }
        if (status == RepairStatus.CANCELLED) {
            repair.setEndTime(LocalDateTime.now());
        }

        return repairRecordRepository.save(repair);
    }

    @Transactional
    public void sendPickupNotify(PickupNotifyRequest request) {
        RepairRecord repair = findById(request.getRepairId());
        if (repair.getStatus() != RepairStatus.PICKUP) {
            throw new BusinessException("只有待取件状态的工单才能发送取件通知");
        }

        repair.setPickupNotified("已通知");
        repairRecordRepository.save(repair);

        RepairStatusLog log = new RepairStatusLog();
        log.setRepairId(repair.getId());
        log.setFromStatus(RepairStatus.PICKUP);
        log.setToStatus(RepairStatus.PICKUP);
        log.setRemark("发送取件通知，方式：" + request.getNotifyMethod() +
                (request.getMessage() != null ? "，内容：" + request.getMessage() : ""));
        repairStatusLogRepository.save(log);
    }

    private void updateWatchStatus(RepairRecord repair) {
        Watch watch = watchRepository.findById(repair.getWatchId()).orElse(null);
        if (watch == null) return;

        switch (repair.getStatus()) {
            case INSPECTING:
            case REPAIRING:
                break;
            case COMPLETED:
            case CANCELLED:
                break;
            default:
                break;
        }
    }

    @Transactional
    public RepairPart addPart(Long repairId, RepairPart repairPart) {
        RepairRecord repair = findById(repairId);
        Part part = partRepository.findById(repairPart.getPartId())
                .orElseThrow(() -> new BusinessException("零件不存在"));

        if (part.getQuantity() < repairPart.getQuantity()) {
            throw new BusinessException("库存不足");
        }

        part.setQuantity(part.getQuantity() - repairPart.getQuantity());
        partRepository.save(part);

        repairPart.setRepairId(repairId);
        repairPart.setPartName(part.getName());
        if (repairPart.getUnitPrice() == null) {
            repairPart.setUnitPrice(part.getUnitPrice());
        }
        repairPart.setSubtotal(repairPart.getUnitPrice().multiply(BigDecimal.valueOf(repairPart.getQuantity())));

        RepairPart saved = repairPartRepository.save(repairPart);
        calculateTotalCost(repair);

        return saved;
    }

    @Transactional
    public void removePart(Long repairId, Long partId) {
        RepairRecord repair = findById(repairId);
        RepairPart repairPart = repairPartRepository.findById(partId)
                .orElseThrow(() -> new BusinessException("维修零件不存在"));

        Part part = partRepository.findById(repairPart.getPartId()).orElse(null);
        if (part != null) {
            part.setQuantity(part.getQuantity() + repairPart.getQuantity());
            partRepository.save(part);
        }

        repairPartRepository.deleteById(partId);
        calculateTotalCost(repair);
    }

    public List<RepairPart> getParts(Long repairId) {
        return repairPartRepository.findByRepairId(repairId);
    }

    private void calculateTotalCost(RepairRecord repair) {
        List<RepairPart> parts = repairPartRepository.findByRepairId(repair.getId());
        BigDecimal partsCost = parts.stream()
                .map(RepairPart::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = partsCost.add(repair.getLaborCost() != null ? repair.getLaborCost() : BigDecimal.ZERO);
        repair.setTotalCost(total);
        repairRecordRepository.save(repair);
    }

    @Transactional
    public void delete(Long id) {
        if (!repairRecordRepository.existsById(id)) {
            throw new BusinessException("维修记录不存在");
        }
        repairPartRepository.deleteByRepairId(id);
        repairStatusLogRepository.findByRepairId(id).forEach(log ->
                repairStatusLogRepository.deleteById(log.getId())
        );
        repairRecordRepository.deleteById(id);
    }
}
