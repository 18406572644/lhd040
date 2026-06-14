package com.example.watchrepair.repository;

import com.example.watchrepair.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {

    List<PaymentRecord> findBySettlementIdOrderByCreateTimeDesc(Long settlementId);

    List<PaymentRecord> findByRepairIdOrderByCreateTimeDesc(Long repairId);
}
