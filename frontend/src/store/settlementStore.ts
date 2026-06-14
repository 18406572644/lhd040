import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settlementApi } from '@/api/settlement';
import type {
  Settlement,
  PaymentRecord,
  PickupVoucher,
  PaymentMethodType,
} from '@/types';

interface SettlementState {
  allSettlements: Settlement[];
  settlements: Record<string, Settlement>;
  paymentRecords: Record<string, PaymentRecord[]>;
  vouchers: Record<string, PickupVoucher>;
  loading: Record<string, boolean>;

  getSettlement: (repairId: string) => Settlement | null;
  getPaymentRecords: (repairId: string) => PaymentRecord[];
  getVoucher: (repairId: string) => PickupVoucher | null;
  isLoading: (key: string) => boolean;
  setLoading: (key: string, value: boolean) => void;

  fetchAllSettlements: () => Promise<void>;
  fetchSettlementByRepairId: (repairId: string) => Promise<Settlement | null>;
  fetchPaymentRecords: (repairId: string) => Promise<void>;
  fetchVoucherByRepairId: (repairId: string) => Promise<void>;

  createSettlement: (
    repairId: string,
    repair: any,
    discount?: number,
    discountReason?: string,
    remark?: string,
    operator?: string
  ) => Promise<Settlement>;

  processPayment: (
    repairId: string,
    settlementId: string,
    method: PaymentMethodType,
    amount: number,
    customer: any,
    transactionNo?: string,
    operator?: string,
    remark?: string
  ) => Promise<PaymentRecord>;

  confirmPickup: (
    repairId: string,
    settlementId: string,
    customer: any,
    watch: any,
    signature?: string,
    manualConfirm?: boolean,
    operator?: string
  ) => Promise<PickupVoucher>;

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
      allSettlements: [],
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

      fetchAllSettlements: async () => {
        try {
          const res: any = await settlementApi.getAllSettlements();
          if ((res.code === 0 || res.code === 200) && res.data) {
            set({ allSettlements: res.data });
            const settlementMap: Record<string, Settlement> = {};
            res.data.forEach((s: any) => {
              if (s.repairId) {
                settlementMap[String(s.repairId)] = s as any;
              }
            });
            set((state) => ({
              settlements: { ...state.settlements, ...settlementMap },
            }));
          }
        } catch (err) {
          console.error('获取结算单列表失败', err);
        }
      },

      fetchSettlementByRepairId: async (repairId) => {
        try {
          const res: any = await settlementApi.getSettlementByRepairId(repairId);
          if ((res.code === 0 || res.code === 200) && res.data) {
            set((state) => ({
              settlements: { ...state.settlements, [repairId]: res.data as any },
            }));
            return res.data;
          }
          return null;
        } catch (err) {
          console.error('获取结算单失败', err);
          return null;
        }
      },

      fetchPaymentRecords: async (repairId) => {
        try {
          const res: any = await settlementApi.getPaymentRecordsByRepairId(repairId);
          if ((res.code === 0 || res.code === 200) && res.data) {
            set((state) => ({
              paymentRecords: { ...state.paymentRecords, [repairId]: res.data as any },
            }));
          }
        } catch (err) {
          console.error('获取支付记录失败', err);
        }
      },

      fetchVoucherByRepairId: async (repairId) => {
        try {
          const res: any = await settlementApi.getPickupVoucherByRepairId(repairId);
          if ((res.code === 0 || res.code === 200) && res.data) {
            set((state) => ({
              vouchers: { ...state.vouchers, [repairId]: res.data as any },
            }));
          }
        } catch (err) {
          console.error('获取取件凭证失败', err);
        }
      },

      createSettlement: async (repairId, repair, discount, discountReason, remark, operator) => {
        const existing = get().settlements[repairId];
        if (existing) {
          return existing;
        }

        const res: any = await settlementApi.createSettlement({
          repairId: Number(repairId),
          discount: discount || 0,
          discountReason,
          remark,
          operator,
        });

        if (!(res.code === 0 || res.code === 200) || !res.data) {
          throw new Error(res.message || '结算单生成失败');
        }

        const settlement = res.data;
        set((state) => ({
          settlements: { ...state.settlements, [repairId]: settlement as any },
          allSettlements: state.allSettlements.some(s => s.id === settlement.id)
            ? state.allSettlements
            : [...state.allSettlements, settlement as any],
        }));

        return settlement as any;
      },

      processPayment: async (
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

        const sid = typeof settlementId === 'string' && settlementId.startsWith('set-')
          ? Number(repairId)
          : Number(settlementId) || Number(repairId);

        const res: any = await settlementApi.processPayment({
          settlementId: Number(settlement.id) || sid,
          paymentMethod: method,
          amount,
          transactionNo,
          operator,
          remark,
        });

        if (!(res.code === 0 || res.code === 200) || !res.data) {
          throw new Error(res.message || '支付失败');
        }

        const paymentRecord = res.data;
        const existingRecords = get().paymentRecords[repairId] || [];

        const updatedRes: any = await settlementApi.getSettlementByRepairId(repairId);
        let updatedSettlement = settlement;
        if ((updatedRes.code === 0 || updatedRes.code === 200) && updatedRes.data) {
          updatedSettlement = updatedRes.data as any;
        } else {
          const newPaidAmount = (settlement.paidAmount || 0) + amount;
          updatedSettlement = {
            ...settlement,
            paidAmount: newPaidAmount,
            paymentMethod: method as any,
            transactionNo,
            paidTime: paymentRecord.paidTime,
            status: newPaidAmount >= (settlement.totalAmount || 0) ? '已支付' : '待支付',
          };
        }

        set((state) => ({
          settlements: { ...state.settlements, [repairId]: updatedSettlement },
          paymentRecords: {
            ...state.paymentRecords,
            [repairId]: [paymentRecord as any, ...existingRecords],
          },
          allSettlements: state.allSettlements.map(s =>
            String(s.repairId) === repairId ? (updatedSettlement as any) : s
          ),
        }));

        return paymentRecord as any;
      },

      confirmPickup: async (
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

        const sid = typeof settlementId === 'string' && settlementId.startsWith('set-')
          ? Number(repairId)
          : Number(settlementId) || Number(repairId);

        const res: any = await settlementApi.confirmPickup({
          repairId: Number(repairId),
          settlementId: Number(settlement.id) || sid,
          customerSignature: signature,
          manualConfirm,
          operator,
        });

        if (!(res.code === 0 || res.code === 200) || !res.data) {
          throw new Error(res.message || '取件确认失败');
        }

        const voucher = res.data;
        const updatedSettlement: any = {
          ...settlement,
          customerSignature: signature,
        };

        set((state) => ({
          settlements: { ...state.settlements, [repairId]: updatedSettlement },
          vouchers: { ...state.vouchers, [repairId]: voucher as any },
          allSettlements: state.allSettlements.map(s =>
            String(s.repairId) === repairId ? updatedSettlement : s
          ),
        }));

        return voucher as any;
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
            allSettlements: state.allSettlements.filter(s => String(s.repairId) !== repairId),
          };
        });
      },
    }),
    {
      name: 'settlement-storage',
      version: 2,
      partialize: (state) => ({
        allSettlements: state.allSettlements,
        settlements: state.settlements,
        paymentRecords: state.paymentRecords,
        vouchers: state.vouchers,
      }),
    }
  )
);

export default useSettlementStore;
