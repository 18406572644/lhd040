package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.entity.Watch;
import com.example.watchrepair.repository.WatchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchService {

    private final WatchRepository watchRepository;

    public WatchService(WatchRepository watchRepository) {
        this.watchRepository = watchRepository;
    }

    public PageResult<Watch> findAll(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Watch> watchPage;
        if (keyword != null && !keyword.isEmpty()) {
            watchPage = watchRepository.findByBrandContainingOrModelContaining(keyword, keyword, pageable);
        } else {
            watchPage = watchRepository.findAll(pageable);
        }
        return PageResult.of(watchPage);
    }

    public PageResult<Watch> findByCustomerId(Long customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Watch> watchPage = watchRepository.findByCustomerId(customerId, pageable);
        return PageResult.of(watchPage);
    }

    public List<Watch> listByCustomerId(Long customerId) {
        return watchRepository.findByCustomerId(customerId);
    }

    public Watch findById(Long id) {
        return watchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("钟表档案不存在"));
    }

    public Watch create(Watch watch) {
        return watchRepository.save(watch);
    }

    public Watch update(Long id, Watch watch) {
        Watch existing = findById(id);
        existing.setCustomerId(watch.getCustomerId());
        existing.setBrand(watch.getBrand());
        existing.setModel(watch.getModel());
        existing.setSerialNumber(watch.getSerialNumber());
        existing.setWatchType(watch.getWatchType());
        existing.setPurchaseDate(watch.getPurchaseDate());
        existing.setLastMaintenanceDate(watch.getLastMaintenanceDate());
        existing.setNextMaintenanceDate(watch.getNextMaintenanceDate());
        existing.setDescription(watch.getDescription());
        return watchRepository.save(existing);
    }

    public void delete(Long id) {
        if (!watchRepository.existsById(id)) {
            throw new BusinessException("钟表档案不存在");
        }
        watchRepository.deleteById(id);
    }
}
