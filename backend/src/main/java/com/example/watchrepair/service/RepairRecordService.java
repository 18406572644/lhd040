package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.common.PageResult;
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

    public RepairRecordService(RepairRecordRepository repairRecordRepository,
                               RepairPartRepository repairPartRepository,
                               PartRepository partRepository,
                               WatchRepository watchRepository,
                               CustomerRepository customerRepository) {
        this.repairRecordRepository = repairRecordRepository;
        this.repairPartRepository = repairPartRepository;
        this.partRepository = partRepository;
        this.watchRepository = watchRepository;
        this.customerRepository = customerRepository;
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

        return repairRecordRepository.save(repairRecord);
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
    public RepairRecord updateStatus(Long id, RepairStatus status) {
        RepairRecord repair = findById(id);
        repair.setStatus(status);

        if (status == RepairStatus.PROCESSING && repair.getStartTime() == null) {
            repair.setStartTime(LocalDateTime.now());
        }
        if (status == RepairStatus.COMPLETED) {
            repair.setEndTime(LocalDateTime.now());
        }

        return repairRecordRepository.save(repair);
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
        repairRecordRepository.deleteById(id);
    }
}
