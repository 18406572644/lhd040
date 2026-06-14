package com.example.watchrepair.repository;

import com.example.watchrepair.entity.RepairStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairStatusLogRepository extends JpaRepository<RepairStatusLog, Long> {

    List<RepairStatusLog> findByRepairIdOrderByCreateTimeAsc(Long repairId);

    List<RepairStatusLog> findByRepairId(Long repairId);
}
