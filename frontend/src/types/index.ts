export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  memberLevel: '普通' | '银卡' | '金卡' | '钻石';
  totalRepairs: number;
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

export interface Clock {
  id: string;
  customerId: string;
  customerName: string;
  brand: string;
  model: string;
  type: string;
  serialNumber: string;
  purchaseDate?: string;
  lastServiceDate?: string;
  nextMaintenanceDate?: string;
  status: '正常' | '维修中' | '待保养' | '已报废';
  description?: string;
  photoUrl?: string;
  createdAt: string;
}

export type RepairStatusType = '待接收' | '检测中' | '维修中' | '待取件' | '已完成' | '已取消';

export interface RepairRecord {
  id: string;
  clockId: string;
  clockInfo: string;
  customerId: string;
  customerName: string;
  type: '维修' | '保养' | '检测' | '翻新';
  status: RepairStatusType;
  priority: '低' | '中' | '高' | '紧急';
  description: string;
  diagnosis?: string;
  solution?: string;
  diagnosisResult?: string;
  estimatedCost?: number;
  pickupNotified?: string;
  partsUsed: RepairPart[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  beforePhotos: string[];
  afterPhotos: string[];
  receiveDate: string;
  expectedDate?: string;
  completeDate?: string;
  technician?: string;
  notes?: string;
  statusLogs: RepairStatusLog[];
}

export interface RepairStatusLog {
  id: string;
  fromStatus: RepairStatusType;
  toStatus: RepairStatusType;
  operator?: string;
  remark?: string;
  diagnosisResult?: string;
  estimatedCost?: number;
  createTime: string;
}

export interface RepairPart {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastRestockDate?: string;
  description?: string;
  imageUrl?: string;
}

export interface PartTransaction {
  id: string;
  partId: string;
  partName: string;
  type: '入库' | '出库' | '盘点';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  relatedOrder?: string;
  operator: string;
  date: string;
  notes?: string;
}

export interface MaintenanceReminder {
  id: string;
  clockId: string;
  clockInfo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: '定期保养' | '机芯清洗' | '防水检测' | '表带更换';
  dueDate: string;
  status: '待发送' | '已发送' | '已确认' | '已完成';
  sendDate?: string;
  notes?: string;
}

export interface SystemUser {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'technician' | 'receptionist';
  phone?: string;
  email?: string;
  status: '启用' | '禁用';
  lastLogin?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRepairs: number;
  pendingRepairs: number;
  completedRepairs: number;
  totalCustomers: number;
  totalClocks: number;
  totalRevenue: number;
  monthRevenue: number;
  lowStockParts: number;
  pendingReminders: number;
}

export type TimeRange = '7d' | '30d' | '90d' | 'custom';
export type RevenueGranularity = 'day' | 'week' | 'month';

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RepairTypeData {
  name: string;
  value: number;
}

export interface RepairStatusData {
  name: string;
  value: number;
}

export interface TechnicianRanking {
  name: string;
  orderCount: number;
  completionRate: number;
  avgDuration: number;
}

export interface CustomerSourceData {
  name: string;
  value: number;
}

export interface CustomerLevelData {
  name: string;
  value: number;
  revenue: number;
}

export interface ChartDrillDownContext {
  type: 'revenue' | 'repairType' | 'repairStatus' | 'technician' | 'customer';
  dataKey?: string;
  dataLabel?: string;
}

export type PaymentMethodType = 'CASH' | 'WECHAT' | 'ALIPAY' | 'BANK_CARD' | 'MEMBER_BALANCE' | 'POINTS';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  CASH: '现金',
  WECHAT: '微信',
  ALIPAY: '支付宝',
  BANK_CARD: '银行卡',
  MEMBER_BALANCE: '会员余额',
  POINTS: '积分抵现',
};

export interface Settlement {
  id: string;
  settlementNo: string;
  repairId: string;
  customerId: string;
  laborCost: number;
  partsCost: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  discountReason?: string;
  remark?: string;
  paymentMethod?: PaymentMethodType;
  transactionNo?: string;
  status: '待支付' | '已支付';
  operator?: string;
  customerSignature?: string;
  createTime: string;
  paidTime?: string;
}

export interface PaymentRecord {
  id: string;
  paymentNo: string;
  settlementId: string;
  repairId: string;
  customerId: string;
  paymentMethod: PaymentMethodType;
  amount: number;
  transactionNo?: string;
  status: string;
  operator?: string;
  remark?: string;
  createTime: string;
  paidTime: string;
}

export interface PickupVoucher {
  id: string;
  voucherNo: string;
  repairId: string;
  settlementId: string;
  customerId: string;
  customerName: string;
  watchInfo: string;
  qrCodeData: string;
  status: string;
  operator?: string;
  customerSignature?: string;
  pickupTime: string;
  createTime: string;
}

export interface SettlementRequest {
  repairId: number | string;
  discount?: number;
  discountReason?: string;
  remark?: string;
  operator?: string;
}

export interface PaymentRequest {
  settlementId: number | string;
  paymentMethod: PaymentMethodType;
  amount: number;
  transactionNo?: string;
  operator?: string;
  remark?: string;
}

export interface PickupConfirmRequest {
  repairId: number | string;
  settlementId: number | string;
  customerSignature?: string;
  manualConfirm?: boolean;
  operator?: string;
  remark?: string;
}
