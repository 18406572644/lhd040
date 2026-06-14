import React, { useMemo } from 'react';
import { Progress, Tag, Table, Tooltip } from '@arco-design/web-react';
import { IconUser, IconCheckCircle, IconClockCircle } from '@arco-design/web-react/icon';
import type { TimeRange, TechnicianRanking } from '@/types';
import { getTechnicianRanking } from '@/mock/chartData';

interface TechnicianRankingChartProps {
  timeRange: TimeRange;
  style?: React.CSSProperties;
}

const getRankingBadge = (index: number) => {
  const badges = [
    { bg: 'linear-gradient(135deg, #FFD700, #DAA520)', label: '🥇' },
    { bg: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)', label: '🥈' },
    { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', label: '🥉' },
  ];
  if (index < 3) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: badges[index].bg,
          fontSize: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {badges[index].label}
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'rgba(139, 69, 19, 0.3)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-brass-light)',
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {index + 1}
    </span>
  );
};

export const TechnicianRankingChart: React.FC<TechnicianRankingChartProps> = ({ timeRange, style }) => {
  const data: TechnicianRanking[] = useMemo(() => getTechnicianRanking(timeRange), [timeRange]);

  const totalOrders = data.reduce((s, d) => s + d.orderCount, 0);
  const avgCompletion = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.completionRate, 0) / data.length) : 0;
  const avgDuration = data.length > 0 ? (data.reduce((s, d) => s + d.avgDuration, 0) / data.length).toFixed(1) : '0';

  const columns = [
    {
      title: '排名',
      dataIndex: 'index',
      width: 60,
      render: (_: unknown, __: unknown, index: number) => getRankingBadge(index),
    },
    {
      title: '技师',
      dataIndex: 'name',
      width: 100,
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #8B4513)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1A1A1A',
            }}
          >
            <IconUser />
          </div>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ),
    },
    {
      title: '维修单数',
      dataIndex: 'orderCount',
      width: 140,
      render: (v: number, record: TechnicianRanking) => {
        const max = Math.max(...data.map((d) => d.orderCount));
        const percent = max > 0 ? Math.round((v / max) * 100) : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Progress
              percent={percent}
              status="normal"
              color="#D4AF37"
              showText={false}
              width={80}
              size="small"
              style={{ minWidth: 80 }}
            />
            <span style={{ color: 'var(--color-brass-light)', fontWeight: 600 }}>{v}</span>
            <Tag color="gold" size="small" bordered>
              {totalOrders > 0 ? Math.round((v / totalOrders) * 100) : 0}%
            </Tag>
          </div>
        );
      },
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      width: 150,
      render: (v: number) => {
        const color = v >= 90 ? '#6B8E23' : v >= 80 ? '#DAA520' : '#CD5C5C';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCheckCircle style={{ color }} />
            <Progress percent={v} status="normal" color={color} showText={false} width={80} size="small" />
            <span style={{ color, fontWeight: 600 }}>{v}%</span>
          </div>
        );
      },
    },
    {
      title: '平均耗时',
      dataIndex: 'avgDuration',
      width: 130,
      render: (v: number) => {
        const color = v <= 2.5 ? '#6B8E23' : v <= 3.5 ? '#DAA520' : '#CD5C5C';
        return (
          <Tooltip content={`平均每单耗时 ${v} 天`}>
            <Tag color={v <= 2.5 ? 'green' : v <= 3.5 ? 'orange' : 'red'} bordered>
              <IconClockCircle style={{ marginRight: 4 }} />
              {v} 天/单
            </Tag>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="gold" bordered>
            总单数: <b style={{ marginLeft: 4 }}>{totalOrders}</b>
          </Tag>
          <Tag color="green" bordered>
            平均完成率: <b style={{ marginLeft: 4 }}>{avgCompletion}%</b>
          </Tag>
          <Tag color="cyan" bordered>
            平均耗时: <b style={{ marginLeft: 4 }}>{avgDuration} 天</b>
          </Tag>
        </div>
      </div>
      <Table
        columns={columns}
        data={data.map((d, i) => ({ ...d, key: i, index: i }))}
        pagination={false}
        border={false}
        rowClassName={() => 'tech-row'}
        style={{
          '--color-bg-tertiary': 'transparent',
        } as React.CSSProperties}
      />
      <style>{`
        .tech-row .arco-table-td {
          padding: 10px 12px !important;
          border-bottom: 1px solid rgba(139, 69, 19, 0.3) !important;
        }
        .tech-row:last-child .arco-table-td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};

export default TechnicianRankingChart;
