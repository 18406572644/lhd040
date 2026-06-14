package com.example.watchrepair.dto;

public class PickupConfirmRequest {

    private Long repairId;
    private Long settlementId;
    private String customerSignature;
    private Boolean manualConfirm;
    private String operator;
    private String remark;

    public Long getRepairId() {
        return repairId;
    }

    public void setRepairId(Long repairId) {
        this.repairId = repairId;
    }

    public Long getSettlementId() {
        return settlementId;
    }

    public void setSettlementId(Long settlementId) {
        this.settlementId = settlementId;
    }

    public String getCustomerSignature() {
        return customerSignature;
    }

    public void setCustomerSignature(String customerSignature) {
        this.customerSignature = customerSignature;
    }

    public Boolean getManualConfirm() {
        return manualConfirm;
    }

    public void setManualConfirm(Boolean manualConfirm) {
        this.manualConfirm = manualConfirm;
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
}
