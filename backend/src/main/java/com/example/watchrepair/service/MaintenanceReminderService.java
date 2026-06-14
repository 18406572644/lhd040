package com.example.watchrepair.service;

import com.example.watchrepair.common.BusinessException;
import com.example.watchrepair.common.PageResult;
import com.example.watchrepair.entity.Customer;
import com.example.watchrepair.entity.MaintenanceReminder;
import com.example.watchrepair.entity.ReminderStatus;
import com.example.watchrepair.entity.Watch;
import com.example.watchrepair.repository.CustomerRepository;
import com.example.watchrepair.repository.MaintenanceReminderRepository;
import com.example.watchrepair.repository.WatchRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceReminderService {

    private final MaintenanceReminderRepository reminderRepository;
    private final WatchRepository watchRepository;
    private final CustomerRepository customerRepository;

    public MaintenanceReminderService(MaintenanceReminderRepository reminderRepository,
                                      WatchRepository watchRepository,
                                      CustomerRepository customerRepository) {
        this.reminderRepository = reminderRepository;
        this.watchRepository = watchRepository;
        this.customerRepository = customerRepository;
    }

    public PageResult<MaintenanceReminder> findAll(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "reminderDate"));
        Page<MaintenanceReminder> reminderPage;
        if (status != null && !status.isEmpty()) {
            reminderPage = reminderRepository.findByStatus(ReminderStatus.valueOf(status), pageable);
        } else {
            reminderPage = reminderRepository.findAll(pageable);
        }
        return PageResult.of(reminderPage);
    }

    public PageResult<MaintenanceReminder> findByCustomerId(Long customerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reminderDate"));
        Page<MaintenanceReminder> reminderPage = reminderRepository.findByCustomerId(customerId, pageable);
        return PageResult.of(reminderPage);
    }

    public List<MaintenanceReminder> getPendingReminders() {
        return reminderRepository.findByStatusAndReminderDateBefore(
                ReminderStatus.PENDING, LocalDate.now().plusDays(1));
    }

    public MaintenanceReminder findById(Long id) {
        return reminderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("保养提醒不存在"));
    }

    public MaintenanceReminder create(MaintenanceReminder reminder) {
        Watch watch = watchRepository.findById(reminder.getWatchId())
                .orElseThrow(() -> new BusinessException("钟表档案不存在"));
        Customer customer = customerRepository.findById(reminder.getCustomerId())
                .orElseThrow(() -> new BusinessException("客户不存在"));

        if (reminder.getStatus() == null) {
            reminder.setStatus(ReminderStatus.PENDING);
        }

        return reminderRepository.save(reminder);
    }

    public MaintenanceReminder update(Long id, MaintenanceReminder reminder) {
        MaintenanceReminder existing = findById(id);
        existing.setReminderDate(reminder.getReminderDate());
        existing.setReminderType(reminder.getReminderType());
        existing.setMessage(reminder.getMessage());
        if (reminder.getStatus() != null) {
            existing.setStatus(reminder.getStatus());
        }
        return reminderRepository.save(existing);
    }

    public MaintenanceReminder markAsSent(Long id) {
        MaintenanceReminder reminder = findById(id);
        reminder.setStatus(ReminderStatus.SENT);
        return reminderRepository.save(reminder);
    }

    public MaintenanceReminder markAsCompleted(Long id) {
        MaintenanceReminder reminder = findById(id);
        reminder.setStatus(ReminderStatus.COMPLETED);
        return reminderRepository.save(reminder);
    }

    public void delete(Long id) {
        if (!reminderRepository.existsById(id)) {
            throw new BusinessException("保养提醒不存在");
        }
        reminderRepository.deleteById(id);
    }

    public List<MaintenanceReminder> findByWatchId(Long watchId) {
        return reminderRepository.findByWatchId(watchId);
    }
}
