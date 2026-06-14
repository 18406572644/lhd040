import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Tag, Modal, Table, Empty } from '@arco-design/web-react';
import type { TimeRange, RepairTypeData } from '@/types';
import { getRepairTypeData } from '@/mock/chartData';
import { getPieChartOption } from '@/utils/chartTheme';

interface RepairTypePieChartProps {
  timeRange: TimeRange;
  style?: React.CSSProperties;
}

export const RepairTypePieChart: React.FC<RepairTypePieChartProps> = ({ timeRange, style }) => {
  const data: RepairTypeData[] = useMemo(() => getRepairTypeData(timeRange), [timeRange]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Array<Record<string, unknown>>>([]);

  const total = data.reduce((s, d) => s + d.value, 0);

  const option = useMemo(() => getPieChartOption(data, '维修类型'), [data]);

  const typeColors: Record<string, string> = {
    维修: 'gold',
    保养: 'green',
    检测: 'blue',
    翻新: 'orange',
  };

  const onChartClick = (params: unknown) => {
    const p = params as { name: string; value: number };
    if (!p.name) return;
    setSelectedType(p.name);
    const mockDetail = Array.from({ length: Math.min(p.value, 20) }, (_, i) => ({
      key: i,
      orderId: `RX-2024-${String(2000 + Math.floor(Math.random() * 8000))}`,
      customer: ['李大明', '王小红', '张伟', '刘芳', '陈国强'][i % 5],
      clock: ['百达翡丽', '劳力士', '卡地亚', '欧米茄', '积家'][i % 5],
      amount: Math.round(300 + Math.random() * 5000),
      status: ['已完成', '维修中', '待取件', '检测中'][i % 4],
      receiveDate: `2024-0${1 + (i % 5)}-${String(10 + (i % 20)).padStart(2, '0')}`,
    }));
    setDetailData(mockDetail);
    setModalVisible(true);
  };

  const handleEvents = { click: onChartClick };

  const columns = [
    { title: '单号', dataIndex: 'orderId', width: 140 },
    { title: '客户', dataIndex: 'customer' },
    { title: '钟表', dataIndex: 'clock' },
    {
      title: '金额',
      dataIndex: 'amount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          已完成: 'green',
          维修中: 'orange',
          待取件: 'cyan',
          检测中: 'blue',
        };
        return (
          <Tag color={colorMap[v] || 'gray'} size="small">
            {v}
          </Tag>
        );
      },
    },
    { title: '接件日期', dataIndex: 'receiveDate' },
  ];

  return (
    <div style={style}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          {data.map((d) => (
            <Tag
              key={d.name}
              color={typeColors[d.name]}
              bordered
              size="small"
              style={{ marginRight: 6, marginBottom: 4 }}
            >
              {d.name}: {d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
            </Tag>
          ))}
        </div>
        <Tag color="gold" bordered size="small">
          总计: {total}
        </Tag>
      </div>
      <ReactECharts
        option={option}
        style={{ height: 320 }}
        onEvents={handleEvents}
        notMerge={true}
      />
      <Modal
        title={`「${selectedType}」类维修订单明细`}
        visible={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        okText="关闭"
        cancelButtonProps={undefined}
        style={{ width: 780 }}
      >
        {detailData.length > 0 ? (
          <Table columns={columns} data={detailData} pagination={false} size="small" />
        ) : (
          <Empty />
        )}
      </Modal>
    </div>
  );
};

export default RepairTypePieChart;
