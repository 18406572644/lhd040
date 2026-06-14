import React from 'react';
import { Radio, DatePicker, Space, Message } from '@arco-design/web-react';
import { IconCalendar } from '@arco-design/web-react/icon';
import type { TimeRange } from '@/types';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange, customStart?: string, customEnd?: string) => void;
  customStart?: string;
  customEnd?: string;
  style?: React.CSSProperties;
}

const { RangePicker } = DatePicker;

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
  customStart,
  customEnd,
  style,
}) => {
  const handleRangeChange = (val: TimeRange) => {
    if (val !== 'custom') {
      onChange(val);
    }
  };

  const handleCustomDateChange = (dates: string[] | undefined) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      onChange('custom', dates[0], dates[1]);
      Message.success(`已选择自定义时间范围：${dates[0]} ~ ${dates[1]}`);
    }
  };

  const defaultCustomDates = customStart && customEnd ? [customStart, customEnd] : undefined;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 0',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconCalendar style={{ color: 'var(--color-brass-light)', fontSize: 18 }} />
        <span style={{ color: 'var(--color-brass-light)', fontWeight: 500, fontSize: 14 }}>时间范围</span>
      </div>
      <Space size="medium" wrap>
        <Radio.Group
          type="button"
          value={value}
          onChange={handleRangeChange}
          size="small"
        >
          <Radio value="7d">近7天</Radio>
          <Radio value="30d">近30天</Radio>
          <Radio value="90d">近90天</Radio>
          <Radio value="custom">自定义</Radio>
        </Radio.Group>
        {value === 'custom' && (
          <RangePicker
            style={{ width: 280 }}
            size="small"
            defaultValue={defaultCustomDates as unknown as [string, string]}
            onChange={handleCustomDateChange}
            placeholder={['开始日期', '结束日期']}
            format="YYYY-MM-DD"
          />
        )}
      </Space>
    </div>
  );
};

export default TimeRangeSelector;
