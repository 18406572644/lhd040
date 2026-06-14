package com.example.watchrepair.controller;

import com.example.watchrepair.common.Result;
import com.example.watchrepair.entity.PhotoType;
import com.example.watchrepair.entity.RepairPhoto;
import com.example.watchrepair.service.RepairPhotoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/photos")
public class RepairPhotoController {

    private final RepairPhotoService repairPhotoService;

    public RepairPhotoController(RepairPhotoService repairPhotoService) {
        this.repairPhotoService = repairPhotoService;
    }

    @PostMapping("/upload/{repairId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TECHNICIAN')")
    public Result<RepairPhoto> uploadPhoto(
            @PathVariable Long repairId,
            @RequestParam PhotoType photoType,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String description) {
        return Result.success(repairPhotoService.uploadPhoto(repairId, photoType, file, description));
    }

    @GetMapping("/repair/{repairId}")
    public Result<List<RepairPhoto>> getPhotosByRepair(@PathVariable Long repairId) {
        return Result.success(repairPhotoService.getPhotosByRepairId(repairId));
    }

    @GetMapping("/repair/{repairId}/{photoType}")
    public Result<List<RepairPhoto>> getPhotosByRepairAndType(
            @PathVariable Long repairId,
            @PathVariable PhotoType photoType) {
        return Result.success(repairPhotoService.getPhotosByRepairIdAndType(repairId, photoType));
    }

    @GetMapping("/{id}")
    public Result<RepairPhoto> getPhotoById(@PathVariable Long id) {
        return Result.success(repairPhotoService.getPhotoById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> deletePhoto(@PathVariable Long id) {
        repairPhotoService.deletePhoto(id);
        return Result.success();
    }
}
