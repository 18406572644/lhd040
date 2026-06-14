package com.example.watchrepair.repository;

import com.example.watchrepair.entity.PickupVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PickupVoucherRepository extends JpaRepository<PickupVoucher, Long> {

    Optional<PickupVoucher> findByRepairId(Long repairId);

    Optional<PickupVoucher> findByVoucherNo(String voucherNo);
}
