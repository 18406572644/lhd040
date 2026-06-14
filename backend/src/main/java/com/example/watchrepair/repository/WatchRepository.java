package com.example.watchrepair.repository;

import com.example.watchrepair.entity.Watch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WatchRepository extends JpaRepository<Watch, Long> {

    List<Watch> findByCustomerId(Long customerId);

    Page<Watch> findByCustomerId(Long customerId, Pageable pageable);

    Page<Watch> findByBrandContainingOrModelContaining(String brand, String model, Pageable pageable);
}
