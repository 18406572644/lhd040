package com.example.watchrepair.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "repair_status_log")
public class RepairStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long repairId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RepairStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RepairStatus toStatus;

    @Column(length = 100)
    private String operator;

    @Column(columnDefinition = "text")
    private String remark;

    @Column(columnDefinition = "text")
    private String diagnosisResult;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal estimatedCost;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRepairId() {
        return repairId;
    }

    public void setRepairId(Long repairId) {
        this.repairId = repairId;
    }

    public RepairStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(RepairStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public RepairStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(RepairStatus toStatus) {
        this.toStatus = toStatus;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getDiagnosisResult() {
        return diagnosisResult;
    }

    public void setDiagnosisResult(String diagnosisResult) {
        this.diagnosisResult = diagnosisResult;
    }

    public java.math.BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(java.math.BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}
