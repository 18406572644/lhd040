package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.entity.Part;
import com.example.watchrepair.repository.PartRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    public PageResult<Part> findAll(int page, int size, String keyword, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<Part> partPage;
        if (keyword != null && !keyword.isEmpty()) {
            partPage = partRepository.findByNameContainingOrPartNumberContaining(keyword, keyword, pageable);
        } else if (category != null && !category.isEmpty()) {
            partPage = partRepository.findByCategory(category, pageable);
        } else {
            partPage = partRepository.findAll(pageable);
        }
        return PageResult.of(partPage);
    }

    public Part findById(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new BusinessException("零件不存在"));
    }

    public Part create(Part part) {
        if (part.getQuantity() == null) {
            part.setQuantity(0);
        }
        return partRepository.save(part);
    }

    public Part update(Long id, Part part) {
        Part existing = findById(id);
        existing.setName(part.getName());
        existing.setPartNumber(part.getPartNumber());
        existing.setCategory(part.getCategory());
        existing.setQuantity(part.getQuantity());
        existing.setUnitPrice(part.getUnitPrice());
        existing.setSupplier(part.getSupplier());
        existing.setDescription(part.getDescription());
        return partRepository.save(existing);
    }

    public Part updateStock(Long id, int quantity) {
        Part part = findById(id);
        int newQuantity = part.getQuantity() + quantity;
        if (newQuantity < 0) {
            throw new BusinessException("库存不足");
        }
        part.setQuantity(newQuantity);
        return partRepository.save(part);
    }

    public void delete(Long id) {
        if (!partRepository.existsById(id)) {
            throw new BusinessException("零件不存在");
        }
        partRepository.deleteById(id);
    }
}
