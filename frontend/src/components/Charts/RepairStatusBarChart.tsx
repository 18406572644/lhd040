import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Tag, Modal, Table } from '@arco-design/web-react';
import type { TimeRange, RepairStatusData } from '@/types';
import { getRepairStatusData } from '@/mock/chartData';
import { getBarChartOption } from '@/utils/chartTheme';

interface RepairStatusBarChartProps {
  timeRange: TimeRange;
  style?: React.CSSProperties;
}

export const RepairStatusBarChart: React.FC<RepairStatusBarChartProps> = ({ timeRange, style }) => {
  const data: RepairStatusData[] = useMemo(() => getRepairStatusData(timeRange), [timeRange]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Array<Record<string, unknown>>>([]);

  const statusColors: Record<string, string> = {
    待接收: 'gold',
    检测中: 'blue',
    维修中: 'orange',
    待取件: 'cyan',
    已完成: 'green',
    已取消: 'gray',
  };

  const xData = data.map((d) => d.name);
  const values = data.map((d) => d.value);
  const option = useMemo(
    () =>
      getBarChartOption(xData, [
        { name: '订单数', data: values },
      ]),
    [xData, values]
  );

  const total = data.reduce((s, d) => s + d.value, 0);
  const completedCount = data.find((d) => d.name === '已完成')?.value || 0;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const onChartClick = (params: unknown) => {
    const p = params as { name: string; data: number; componentType: string };
    if (p.componentType !== 'series' || !p.name) return;
    setSelectedStatus(p.name);
    const mockDetail = Array.from({ length: Math.min(p.data, 20) }, (_, i) => ({
      key: i,
      orderId: `RX-2024-${String(3000 + Math.floor(Math.random() * 7000))}`,
      customer: ['李大明', '王小红', '张伟', '刘芳', '陈国强', '赵丽娜'][i % 6],
      type: ['维修', '保养', '检测', '翻新'][i % 4],
      priority: ['低', '中', '高', '紧急'][i % 4],
      technician: ['张师傅', '李师傅', '王师傅', '赵师傅'][i % 4],
      days: Math.round(1 + Math.random() * 15),
    }));
    setDetailData(mockDetail);
    setModalVisible(true);
  };

  const handleEvents = { click: onChartClick };

  const columns = [
    { title: '单号', dataIndex: 'orderId', width: 140 },
    { title: '客户', dataIndex: 'customer' },
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: string) => (
        <Tag
          color={v === '维修' ? 'gold' : v === '保养' ? 'green' : v === '检测' ? 'blue' : 'orange'}
          size="small"
        >
          {v}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      render: (v: string) => (
        <Tag
          color={v === '紧急' ? 'red' : v === '高' ? 'orange' : v === '中' ? 'blue' : 'green'}
          size="small"
        >
          {v}
        </Tag>
      ),
    },
    { title: '处理技师', dataIndex: 'technician' },
    {
      title: selectedStatus === '已完成' || selectedStatus === '已取消' ? '耗时' : '已处理(天)',
      dataIndex: 'days',
      render: (v: number) => `${v} 天`,
    },
  ];

  return (
    <div style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.map((d) => (
            <Tag key={d.name} color={statusColors[d.name]} bordered size="small">
              {d.name}: {d.value}
            </Tag>
          ))}
        </div>
        <Tag color="green" bordered size="small">
          完成率: {completionRate}%
        </Tag>
      </div>
      <ReactECharts
        option={option}
        style={{ height: 320 }}
        onEvents={handleEvents}
        notMerge={true}
      />
      <Modal
        title={`「${selectedStatus}」状态订单明细`}
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        okText="关闭"
        cancelButtonProps={undefined}
        style={{ width: 780 }}
      >
        <Table columns={columns} data={detailData} pagination={false} size="small" />
      </Modal>
    </div>
  );
};

export default RepairStatusBarChart;
