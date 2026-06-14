import type {
  RevenueDataPoint,
  RepairTypeData,
  RepairStatusData,
  TechnicianRanking,
  CustomerSourceData,
  CustomerLevelData,
  TimeRange,
  RevenueGranularity,
} from '../types';

const generateRandomRevenue = (base: number, variance: number) => {
  return Math.round(base + (Math.random() - 0.3) * variance);
};

export const generateRevenueData = (
  timeRange: TimeRange,
  granularity: RevenueGranularity,
  customStart?: string,
  customEnd?: string
): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  let days = 30;

  switch (timeRange) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    case 'custom':
      if (customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      }
      break;
  }

  const today = new Date('2024-06-14');

  if (granularity === 'day') {
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const baseRevenue = 500 + (days - i) * 10;
      data.push({
        date: dateStr,
        revenue: generateRandomRevenue(baseRevenue, 800),
        orderCount: Math.round(2 + Math.random() * 8),
      });
    }
  } else if (granularity === 'week') {
    const weeks = Math.ceil(days / 7);
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - i * 7 - 6);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const dateStr = `${weekStart.getMonth() + 1}/${weekStart.getDate()}-${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
      const baseRevenue = 3500 + (weeks - i) * 80;
      data.push({
        date: dateStr,
        revenue: generateRandomRevenue(baseRevenue, 2500),
        orderCount: Math.round(15 + Math.random() * 35),
      });
    }
  } else if (granularity === 'month') {
    const months = Math.ceil(days / 30);
    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(today);
      monthDate.setMonth(monthDate.getMonth() - i);
      const dateStr = `${monthDate.getFullYear()}/${monthDate.getMonth() + 1}`;
      const baseRevenue = 15000 + (months - i) * 500;
      data.push({
        date: dateStr,
        revenue: generateRandomRevenue(baseRevenue, 8000),
        orderCount: Math.round(60 + Math.random() * 120),
      });
    }
  }

  return data;
};

export const generateDrillDownRevenueData = (monthLabel: string): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  const [year, month] = monthLabel.split('/').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${month}/${d}`;
    const baseRevenue = 400 + d * 15;
    data.push({
      date: dateStr,
      revenue: generateRandomRevenue(baseRevenue, 1000),
      orderCount: Math.round(2 + Math.random() * 10),
    });
  }
  return data;
};

export const getRepairTypeData = (timeRange: TimeRange): RepairTypeData[] => {
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 2.8 : 1;
  return [
    { name: '维修', value: Math.round(68 * multiplier) },
    { name: '保养', value: Math.round(45 * multiplier) },
    { name: '检测', value: Math.round(28 * multiplier) },
    { name: '翻新', value: Math.round(15 * multiplier) },
  ];
};

export const getRepairStatusData = (timeRange: TimeRange): RepairStatusData[] => {
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 2.8 : 1;
  return [
    { name: '待接收', value: Math.round(8 * multiplier) },
    { name: '检测中', value: Math.round(15 * multiplier) },
    { name: '维修中', value: Math.round(22 * multiplier) },
    { name: '待取件', value: Math.round(12 * multiplier) },
    { name: '已完成', value: Math.round(85 * multiplier) },
    { name: '已取消', value: Math.round(6 * multiplier) },
  ];
};

export const getTechnicianRanking = (timeRange: TimeRange): TechnicianRanking[] => {
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 2.8 : 1;
  return [
    {
      name: '张师傅',
      orderCount: Math.round(45 * multiplier),
      completionRate: 94,
      avgDuration: 2.1,
    },
    {
      name: '李师傅',
      orderCount: Math.round(38 * multiplier),
      completionRate: 91,
      avgDuration: 2.8,
    },
    {
      name: '王师傅',
      orderCount: Math.round(32 * multiplier),
      completionRate: 88,
      avgDuration: 3.2,
    },
    {
      name: '赵师傅',
      orderCount: Math.round(25 * multiplier),
      completionRate: 85,
      avgDuration: 3.5,
    },
    {
      name: '陈师傅',
      orderCount: Math.round(18 * multiplier),
      completionRate: 82,
      avgDuration: 4.0,
    },
  ];
};

export const getCustomerSourceData = (timeRange: TimeRange): CustomerSourceData[] => {
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 2.8 : 1;
  return [
    { name: '老客户推荐', value: Math.round(35 * multiplier) },
    { name: '线上搜索', value: Math.round(28 * multiplier) },
    { name: '门店过路', value: Math.round(22 * multiplier) },
    { name: '社交媒体', value: Math.round(15 * multiplier) },
    { name: '合作伙伴', value: Math.round(10 * multiplier) },
  ];
};

export const getCustomerLevelData = (timeRange: TimeRange): CustomerLevelData[] => {
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 2.8 : 1;
  return [
    { name: '钻石', value: Math.round(8 * multiplier), revenue: 58000 },
    { name: '金卡', value: Math.round(22 * multiplier), revenue: 45000 },
    { name: '银卡', value: Math.round(35 * multiplier), revenue: 32000 },
    { name: '普通', value: Math.round(45 * multiplier), revenue: 21800 },
  ];
};
