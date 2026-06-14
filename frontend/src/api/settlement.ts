import request from '@/utils/request';
import type {
  Settlement,
  PaymentRecord,
  PickupVoucher,
  SettlementRequest,
  PaymentRequest,
  PickupConfirmRequest,
  PaymentMethodType,
} from '@/types';

export const settlementApi = {
  getAllSettlements: (): Promise<{ code: number; data: Settlement[]; message?: string }> => {
    return request.get('/settlements');
  },

  createSettlement: (data: SettlementRequest): Promise<{ code: number; data: Settlement; message?: string }> => {
    return request.post('/settlements', data);
  },

  getSettlementByRepairId: (repairId: string): Promise<{ code: number; data: Settlement; message?: string }> => {
    return request.get(`/settlements/repair/${repairId}`);
  },

  getSettlementById: (id: string): Promise<{ code: number; data: Settlement; message?: string }> => {
    return request.get(`/settlements/${id}`);
  },

  processPayment: (data: PaymentRequest): Promise<{ code: number; data: PaymentRecord; message?: string }> => {
    return request.post('/settlements/pay', data);
  },

  getPaymentRecordsBySettlementId: (settlementId: string): Promise<{ code: number; data: PaymentRecord[]; message?: string }> => {
    return request.get(`/settlements/${settlementId}/payments`);
  },

  getPaymentRecordsByRepairId: (repairId: string): Promise<{ code: number; data: PaymentRecord[]; message?: string }> => {
    return request.get(`/settlements/repair/${repairId}/payments`);
  },

  confirmPickup: (data: PickupConfirmRequest): Promise<{ code: number; data: PickupVoucher; message?: string }> => {
    return request.post('/settlements/pickup', data);
  },

  getPickupVoucherByRepairId: (repairId: string): Promise<{ code: number; data: PickupVoucher; message?: string }> => {
    return request.get(`/settlements/repair/${repairId}/pickup`);
  },

  getPickupVoucherById: (id: string): Promise<{ code: number; data: PickupVoucher; message?: string }> => {
    return request.get(`/settlements/pickup/${id}`);
  },
};

export default settlementApi;
