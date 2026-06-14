package com.example.watchrepair.repository;

import com.example.watchrepair.entity.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    Page<Part> findByNameContainingOrPartNumberContaining(String name, String partNumber, Pageable pageable);

    Page<Part> findByCategory(String category, Pageable pageable);
}
