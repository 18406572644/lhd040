package com.example.watchrepair.repository;

import com.example.watchrepair.entity.MaintenanceReminder;
import com.example.watchrepair.entity.ReminderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceReminderRepository extends JpaRepository<MaintenanceReminder, Long> {

    List<MaintenanceReminder> findByStatusAndReminderDateBefore(ReminderStatus status, LocalDate date);

    Page<MaintenanceReminder> findByStatus(ReminderStatus status, Pageable pageable);

    Page<MaintenanceReminder> findByCustomerId(Long customerId, Pageable pageable);

    List<MaintenanceReminder> findByWatchId(Long watchId);
}
