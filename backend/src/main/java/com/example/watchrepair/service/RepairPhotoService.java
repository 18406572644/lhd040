package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.entity.PhotoType;
import com.example.watchrepair.entity.RepairPhoto;
import com.example.watchrepair.entity.RepairRecord;
import com.example.watchrepair.repository.RepairPhotoRepository;
import com.example.watchrepair.repository.RepairRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class RepairPhotoService {

    private final RepairPhotoRepository repairPhotoRepository;
    private final RepairRecordRepository repairRecordRepository;

    @Value("${upload.path}")
    private String uploadPath;

    public RepairPhotoService(RepairPhotoRepository repairPhotoRepository, RepairRecordRepository repairRecordRepository) {
        this.repairPhotoRepository = repairPhotoRepository;
        this.repairRecordRepository = repairRecordRepository;
    }

    public RepairPhoto uploadPhoto(Long repairId, PhotoType photoType, MultipartFile file, String description) {
        RepairRecord repair = repairRecordRepository.findById(repairId)
                .orElseThrow(() -> new BusinessException("维修记录不存在"));

        if (file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }

        try {
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID().toString() + extension;

            Path filePath = Paths.get(uploadPath, fileName);
            Files.copy(file.getInputStream(), filePath);

            String photoUrl = "/photos/" + fileName;

            RepairPhoto photo = new RepairPhoto();
            photo.setRepairId(repairId);
            photo.setPhotoType(photoType);
            photo.setPhotoUrl(photoUrl);
            photo.setDescription(description);

            return repairPhotoRepository.save(photo);
        } catch (IOException e) {
            throw new BusinessException("文件上传失败: " + e.getMessage());
        }
    }

    public List<RepairPhoto> getPhotosByRepairId(Long repairId) {
        return repairPhotoRepository.findByRepairId(repairId);
    }

    public List<RepairPhoto> getPhotosByRepairIdAndType(Long repairId, PhotoType photoType) {
        return repairPhotoRepository.findByRepairIdAndPhotoType(repairId, photoType);
    }

    public RepairPhoto getPhotoById(Long id) {
        return repairPhotoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("照片不存在"));
    }

    public void deletePhoto(Long id) {
        RepairPhoto photo = getPhotoById(id);
        try {
            Path filePath = Paths.get(uploadPath, photo.getPhotoUrl().replace("/photos/", ""));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // 忽略文件删除错误
        }
        repairPhotoRepository.deleteById(id);
    }
}
