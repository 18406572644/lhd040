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

export interface RepairRecord {
  id: string;
  clockId: string;
  clockInfo: string;
  customerId: string;
  customerName: string;
  type: '维修' | '保养' | '检测' | '翻新';
  status: '待接收' | '检测中' | '维修中' | '待取件' | '已完成' | '已取消';
  priority: '低' | '中' | '高' | '紧急';
  description: string;
  diagnosis?: string;
  solution?: string;
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
