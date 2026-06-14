import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Tabs, Tag, Progress } from '@arco-design/web-react';
import type { TimeRange } from '@/types';
import { getCustomerSourceData, getCustomerLevelData } from '@/mock/chartData';
import { getPieChartOption, getBarChartOption, steampunkChartColors } from '@/utils/chartTheme';

interface CustomerDistributionChartProps {
  timeRange: TimeRange;
  style?: React.CSSProperties;
}

const levelColors: Record<string, string> = {
  钻石: '#D4AF37',
  金卡: '#B8860B',
  银卡: '#A9A9A9',
  普通: '#708090',
};

export const CustomerDistributionChart: React.FC<CustomerDistributionChartProps> = ({ timeRange, style }) => {
  const sourceData = useMemo(() => getCustomerSourceData(timeRange), [timeRange]);
  const levelData = useMemo(() => getCustomerLevelData(timeRange), [timeRange]);

  const totalSource = sourceData.reduce((s, d) => s + d.value, 0);
  const totalLevel = levelData.reduce((s, d) => s + d.value, 0);
  const totalLevelRevenue = levelData.reduce((s, d) => s + d.revenue, 0);

  const sourceOption = useMemo(() => getPieChartOption(sourceData, '客户来源'), [sourceData]);

  const levelXData = levelData.map((d) => d.name);
  const levelCounts = levelData.map((d) => d.value);
  const levelRevenues = levelData.map((d) => Math.round(d.revenue / 1000));
  const levelOption = useMemo(
    () =>
      getBarChartOption(levelXData, [
        { name: '客户数', data: levelCounts },
        { name: '营收(千元)', data: levelRevenues },
      ]),
    [levelXData, levelCounts, levelRevenues]
  );

  return (
    <div style={style}>
      <Tabs defaultActiveTab="source" size="small" type="card">
        <Tabs.TabPane key="source" title={<span style={{ padding: '0 8px' }}>客户来源</span>}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sourceData.map((d, i) => (
                <Tag
                  key={d.name}
                  color="arcoblue"
                  bordered
                  size="small"
                  style={{
                    borderColor: steampunkChartColors[i % steampunkChartColors.length],
                    color: steampunkChartColors[i % steampunkChartColors.length],
                  }}
                >
                  {d.name}: {d.value}
                </Tag>
              ))}
            </div>
            <Tag color="gold" bordered size="small">
              新增客户: {totalSource}
            </Tag>
          </div>
          <ReactECharts option={sourceOption} style={{ height: 320 }} notMerge={true} />
        </Tabs.TabPane>

        <Tabs.TabPane key="level" title={<span style={{ padding: '0 8px' }}>客户等级</span>}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {levelData.map((d) => {
                const percent = totalLevel > 0 ? Math.round((d.value / totalLevel) * 100) : 0;
                return (
                  <Tag
                    key={d.name}
                    bordered
                    size="small"
                    style={{
                      borderColor: levelColors[d.name],
                      color: levelColors[d.name],
                    }}
                  >
                    {d.name}: {d.value} ({percent}%)
                  </Tag>
                );
              })}
            </div>
            <Tag color="gold" bordered size="small">
              总营收: ¥{totalLevelRevenue.toLocaleString()}
            </Tag>
          </div>

          <div style={{ marginBottom: 16 }}>
            {levelData.map((d) => {
              const percent = totalLevelRevenue > 0 ? Math.round((d.revenue / totalLevelRevenue) * 100) : 0;
              return (
                <div key={d.name} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: levelColors[d.name], fontWeight: 500 }}>{d.name}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      ¥{d.revenue.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <Progress
                    percent={percent}
                    status="normal"
                    color={levelColors[d.name]}
                    showText={false}
                    size="small"
                  />
                </div>
              );
            })}
          </div>

          <ReactECharts option={levelOption} style={{ height: 280 }} notMerge={true} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default CustomerDistributionChart;
