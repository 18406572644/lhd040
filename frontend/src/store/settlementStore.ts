import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Settlement,
  PaymentRecord,
  PickupVoucher,
  PaymentMethodType,
} from '@/types';

interface SettlementState {
  settlements: Record<string, Settlement>;
  paymentRecords: Record<string, PaymentRecord[]>;
  vouchers: Record<string, PickupVoucher>;
  loading: Record<string, boolean>;

  getSettlement: (repairId: string) => Settlement | null;
  getPaymentRecords: (repairId: string) => PaymentRecord[];
  getVoucher: (repairId: string) => PickupVoucher | null;
  isLoading: (key: string) => boolean;
  setLoading: (key: string, value: boolean) => void;

  generateSettlementNo: () => string;
  generatePaymentNo: () => string;
  generateVoucherNo: () => string;

  createSettlement: (
    repairId: string,
    repair: any,
    discount?: number,
    discountReason?: string,
    remark?: string,
    operator?: string
  ) => Settlement;

  processPayment: (
    repairId: string,
    settlementId: string,
    method: PaymentMethodType,
    amount: number,
    customer: any,
    transactionNo?: string,
    operator?: string,
    remark?: string
  ) => PaymentRecord;

  confirmPickup: (
    repairId: string,
    settlementId: string,
    customer: any,
    watch: any,
    signature?: string,
    manualConfirm?: boolean,
    operator?: string
  ) => PickupVoucher;

  clearSettlement: (repairId: string) => void;
}

const formatDateTime = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
};

export const useSettlementStore = create<SettlementState>()(
  persist(
    (set, get) => ({
      settlements: {},
      paymentRecords: {},
      vouchers: {},
      loading: {},

      getSettlement: (repairId) => {
        return get().settlements[repairId] || null;
      },

      getPaymentRecords: (repairId) => {
        return get().paymentRecords[repairId] || [];
      },

      getVoucher: (repairId) => {
        return get().vouchers[repairId] || null;
      },

      isLoading: (key) => {
        return get().loading[key] || false;
      },

      setLoading: (key, value) => {
        set((state) => ({
          loading: { ...state.loading, [key]: value },
        }));
      },

      generateSettlementNo: () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `JS${date}${random}`;
      },

      generatePaymentNo: () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `ZF${date}${random}`;
      },

      generateVoucherNo: () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `QJ${date}${random}`;
      },

      createSettlement: (repairId, repair, discount, discountReason, remark, operator) => {
        const existing = get().settlements[repairId];
        if (existing) {
          return existing;
        }

        const partsCost = repair.partsUsed.reduce((sum: number, p: any) => sum + p.totalPrice, 0);
        const laborCost = repair.laborCost || 0;
        const subtotal = partsCost + laborCost;
        const discountAmount = discount || 0;
        const totalAmount = Math.max(0, subtotal - discountAmount);

        const settlement: Settlement = {
          id: `set-${Date.now()}`,
          settlementNo: get().generateSettlementNo(),
          repairId,
          customerId: repair.customerId,
          laborCost,
          partsCost,
          subtotal,
          discount: discountAmount,
          totalAmount,
          paidAmount: 0,
          discountReason,
          remark,
          status: '待支付',
          operator,
          createTime: formatDateTime(new Date()),
        };

        set((state) => ({
          settlements: { ...state.settlements, [repairId]: settlement },
        }));

        return settlement;
      },

      processPayment: (
        repairId,
        settlementId,
        method,
        amount,
        customer,
        transactionNo,
        operator,
        remark
      ) => {
        const settlement = get().settlements[repairId];
        if (!settlement) {
          throw new Error('结算单不存在');
        }

        const remainingAmount = settlement.totalAmount - settlement.paidAmount;
        if (amount > remainingAmount) {
          throw new Error(`支付金额不能超过待付金额：${remainingAmount.toFixed(2)}`);
        }

        if (method === 'MEMBER_BALANCE') {
          const balance = customer?.memberBalance ?? 0;
          if (balance < amount) {
            throw new Error(`会员余额不足，当前余额：${balance}`);
          }
        }

        if (method === 'POINTS') {
          const points = customer?.memberPoints ?? 0;
          const pointsNeeded = amount * 100;
          if (points < pointsNeeded) {
            throw new Error(`积分不足，需要${pointsNeeded}积分，当前${points}积分`);
          }
        }

        const now = new Date();
        const paymentRecord: PaymentRecord = {
          id: `pay-${Date.now()}`,
          paymentNo: get().generatePaymentNo(),
          settlementId,
          repairId,
          customerId: settlement.customerId,
          paymentMethod: method,
          amount,
          transactionNo,
          status: '已支付',
          operator,
          remark,
          createTime: formatDateTime(now),
          paidTime: formatDateTime(now),
        };

        const newPaidAmount = settlement.paidAmount + amount;
        const updatedSettlement: Settlement = {
          ...settlement,
          paidAmount: newPaidAmount,
          paymentMethod: method,
          transactionNo,
          paidTime: formatDateTime(now),
          status: newPaidAmount >= settlement.totalAmount ? '已支付' : '待支付',
        };

        const existingRecords = get().paymentRecords[repairId] || [];

        set((state) => ({
          settlements: { ...state.settlements, [repairId]: updatedSettlement },
          paymentRecords: {
            ...state.paymentRecords,
            [repairId]: [paymentRecord, ...existingRecords],
          },
        }));

        return paymentRecord;
      },

      confirmPickup: (
        repairId,
        settlementId,
        customer,
        watch,
        signature,
        manualConfirm,
        operator
      ) => {
        const settlement = get().settlements[repairId];
        if (!settlement) {
          throw new Error('结算单不存在');
        }
        if (settlement.status !== '已支付') {
          throw new Error('请先完成支付后再取件');
        }
        if (!signature && !manualConfirm) {
          throw new Error('请客户签字确认或手动确认取件');
        }

        const now = new Date();
        const voucherNo = get().generateVoucherNo();
        const qrCodeData = `PICKUP:${voucherNo}|REPAIR:${repairId}|CUSTOMER:${customer?.name || ''}`;

        const voucher: PickupVoucher = {
          id: `vch-${Date.now()}`,
          voucherNo,
          repairId,
          settlementId,
          customerId: settlement.customerId,
          customerName: customer?.name || '',
          watchInfo: watch ? `${watch.brand} ${watch.model}` : '',
          qrCodeData,
          status: '已取件',
          operator,
          customerSignature: signature,
          pickupTime: formatDateTime(now),
          createTime: formatDateTime(now),
        };

        const updatedSettlement: Settlement = {
          ...settlement,
          customerSignature: signature,
        };

        set((state) => ({
          settlements: { ...state.settlements, [repairId]: updatedSettlement },
          vouchers: { ...state.vouchers, [repairId]: voucher },
        }));

        return voucher;
      },

      clearSettlement: (repairId) => {
        set((state) => {
          const { [repairId]: _, ...remainingSettlements } = state.settlements;
          const { [repairId]: __, ...remainingRecords } = state.paymentRecords;
          const { [repairId]: ___, ...remainingVouchers } = state.vouchers;
          return {
            settlements: remainingSettlements,
            paymentRecords: remainingRecords,
            vouchers: remainingVouchers,
          };
        });
      },
    }),
    {
      name: 'settlement-storage',
      version: 1,
    }
  )
);

export default useSettlementStore;
