import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Radio, Space, Tag, Button, Breadcrumb, Modal, Table, Message } from '@arco-design/web-react';
import { IconLeft, IconInfoCircle } from '@arco-design/web-react/icon';
import type { ECharts } from 'echarts';
import type { TimeRange, RevenueGranularity, RevenueDataPoint } from '@/types';
import { generateRevenueData, generateDrillDownRevenueData } from '@/mock/chartData';
import { getLineChartOption } from '@/utils/chartTheme';

interface RevenueTrendChartProps {
  timeRange: TimeRange;
  customStart?: string;
  customEnd?: string;
  style?: React.CSSProperties;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  timeRange,
  customStart,
  customEnd,
  style,
}) => {
  const [granularity, setGranularity] = React.useState<RevenueGranularity>(
    timeRange === '7d' ? 'day' : timeRange === '30d' ? 'day' : 'week'
  );
  const [drillDownLevel, setDrillDownLevel] = React.useState<'overview' | 'detail'>('overview');
  const [drillDownMonth, setDrillDownMonth] = React.useState<string | null>(null);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);
  const [selectedData, setSelectedData] = React.useState<
    Array<{
      key: number;
      orderId: string;
      customer: string;
      type: string;
      amount: number;
      technician: string;
    }>
  >([]);
  const [selectedDate, setSelectedDate] = React.useState('');
  const chartRef = useRef<ReactECharts>(null);

  const baseData = useMemo(
    () => generateRevenueData(timeRange, granularity, customStart, customEnd),
    [timeRange, granularity, customStart, customEnd]
  );

  const displayData = useMemo(() => {
    if (drillDownLevel === 'detail' && drillDownMonth) {
      return generateDrillDownRevenueData(drillDownMonth);
    }
    return baseData;
  }, [drillDownLevel, drillDownMonth, baseData]);

  const chartOption = useMemo(() => {
    const xData = displayData.map((d) => d.date);
    const revenueData = displayData.map((d) => d.revenue);
    const orderData = displayData.map((d) => d.orderCount);
    const canDrillDown = granularity === 'month' && drillDownLevel === 'overview';
    return getLineChartOption(xData, revenueData, orderData, undefined, canDrillDown);
  }, [displayData, granularity, drillDownLevel]);

  const onChartClick = (params: unknown) => {
    const p = params as { dataIndex: number; seriesType: string; componentType: string };
    if (p.componentType !== 'series') return;
    const dataPoint = displayData[p.dataIndex];
    if (!dataPoint) return;

    if (granularity === 'month' && drillDownLevel === 'overview') {
      const originalIndex = baseData.findIndex((d) => d.date === dataPoint.date);
      if (originalIndex >= 0) {
        const monthLabel = dataPoint.date;
        setDrillDownMonth(monthLabel);
        setDrillDownLevel('detail');
        Message.success(`已下钻查看 ${monthLabel} 每日明细`);
      }
    } else {
      setSelectedDate(dataPoint.date);
      const mockDetail = Array.from({ length: dataPoint.orderCount }, (_, i) => ({
        key: i,
        orderId: `RX-2024-${String(1000 + Math.floor(Math.random() * 9000))}`,
        customer: `客户${String.fromCharCode(65 + (i % 26))}`,
        type: ['维修', '保养', '检测', '翻新'][i % 4],
        amount: Math.round(200 + Math.random() * 3000),
        technician: ['张师傅', '李师傅', '王师傅'][i % 3],
      }));
      setSelectedData(mockDetail);
      setDetailModalVisible(true);
    }
  };

  const goBack = () => {
    setDrillDownLevel('overview');
    setDrillDownMonth(null);
  };

  const totalRevenue = displayData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = displayData.reduce((sum, d) => sum + d.orderCount, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const detailColumns = [
    {
      title: '单号',
      dataIndex: 'orderId',
      width: 140,
    },
    {
      title: '客户',
      dataIndex: 'customer',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: string) => (
        <Tag
          color={
            v === '维修'
              ? 'gold'
              : v === '保养'
                ? 'green'
                : v === '检测'
                  ? 'blue'
                  : 'orange'
          }
          size="small"
        >
          {v}
        </Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: '处理技师',
      dataIndex: 'technician',
    },
  ];

  const handleEvents = {
    click: onChartClick,
  };

  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          {drillDownLevel === 'detail' ? (
            <Breadcrumb style={{ marginBottom: 8 }}>
              <Breadcrumb.Item>
                <Button
                  type="text"
                  size="small"
                  icon={<IconLeft />}
                  onClick={goBack}
                  style={{ padding: 0 }}
                >
                  返回总览
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <span style={{ color: 'var(--color-brass-light)' }}>{drillDownMonth} 每日明细</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          ) : null}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tag color="gold" bordered>
              总营收: <b style={{ marginLeft: 4 }}>¥{totalRevenue.toLocaleString()}</b>
            </Tag>
            <Tag color="green" bordered>
              总单数: <b style={{ marginLeft: 4 }}>{totalOrders}</b>
            </Tag>
            <Tag color="cyan" bordered>
              客单价: <b style={{ marginLeft: 4 }}>¥{avgOrderValue.toLocaleString()}</b>
            </Tag>
          </div>
        </div>
        <Space>
          <Radio.Group
            type="button"
            size="small"
            value={granularity}
            onChange={(v) => setGranularity(v as RevenueGranularity)}
            disabled={drillDownLevel === 'detail'}
          >
            <Radio value="day">按日</Radio>
            <Radio value="week">按周</Radio>
            <Radio value="month">按月</Radio>
          </Radio.Group>
          {granularity === 'month' && drillDownLevel === 'overview' && (
            <Tag
              color="orange"
              bordered
              size="small"
              icon={<IconInfoCircle />}
            >
              点击数据点下钻
            </Tag>
          )}
        </Space>
      </div>
      <ReactECharts
        ref={chartRef}
        option={chartOption}
        style={{ height: 360 }}
        onEvents={handleEvents}
        notMerge={true}
        lazyUpdate={true}
      />
      <Modal
        title={`${selectedDate} 明细订单`}
        visible={detailModalVisible}
        onOk={() => setDetailModalVisible(false)}
        onCancel={() => setDetailModalVisible(false)}
        okText="关闭"
        cancelButtonProps={undefined}
        style={{ width: 720 }}
      >
        <Table
          columns={detailColumns}
          data={selectedData}
          pagination={false}
          size="small"
          border={false}
        />
      </Modal>
    </div>
  );
};

export default RevenueTrendChart;
