package com.example.watchrepair.repository;

import com.example.watchrepair.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    Optional<Settlement> findByRepairId(Long repairId);

    Optional<Settlement> findBySettlementNo(String settlementNo);

    boolean existsByRepairId(Long repairId);
}
