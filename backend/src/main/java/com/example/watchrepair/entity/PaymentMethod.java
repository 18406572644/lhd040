package com.example.watchrepair.entity;

public enum PaymentMethod {
    CASH("现金"),
    WECHAT("微信"),
    ALIPAY("支付宝"),
    BANK_CARD("银行卡"),
    MEMBER_BALANCE("会员余额"),
    POINTS("积分抵现");

    private final String label;

    PaymentMethod(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
