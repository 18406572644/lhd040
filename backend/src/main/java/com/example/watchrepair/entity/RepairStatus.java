package com.example.watchrepair.entity;

import java.util.Arrays;
import java.util.List;

public enum RepairStatus {
    PENDING("待接收"),
    INSPECTING("检测中"),
    REPAIRING("维修中"),
    PICKUP("待取件"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    private final String label;

    RepairStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public List<RepairStatus> getAllowedTransitions() {
        return switch (this) {
            case PENDING -> Arrays.asList(INSPECTING, CANCELLED);
            case INSPECTING -> Arrays.asList(REPAIRING, CANCELLED);
            case REPAIRING -> Arrays.asList(PICKUP, CANCELLED);
            case PICKUP -> Arrays.asList(COMPLETED);
            case COMPLETED -> List.of();
            case CANCELLED -> List.of();
        };
    }

    public boolean canTransitionTo(RepairStatus target) {
        return getAllowedTransitions().contains(target);
    }
}
