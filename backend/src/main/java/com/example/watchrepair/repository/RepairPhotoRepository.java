package com.example.watchrepair.repository;

import com.example.watchrepair.entity.PhotoType;
import com.example.watchrepair.entity.RepairPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairPhotoRepository extends JpaRepository<RepairPhoto, Long> {

    List<RepairPhoto> findByRepairId(Long repairId);

    List<RepairPhoto> findByRepairIdAndPhotoType(Long repairId, PhotoType photoType);
}
