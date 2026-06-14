package com.example.watchrepair.repository;

import com.example.watchrepair.entity.RepairRecord;
import com.example.watchrepair.entity.RepairStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairRecordRepository extends JpaRepository<RepairRecord, Long> {

    Page<RepairRecord> findByStatus(RepairStatus status, Pageable pageable);

    Page<RepairRecord> findByCustomerId(Long customerId, Pageable pageable);

    Page<RepairRecord> findByWatchId(Long watchId, Pageable pageable);

    List<RepairRecord> findByWatchId(Long watchId);
}
