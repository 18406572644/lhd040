import React, { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Tag,
  Space,
  DatePicker,
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconSearch,
  IconStorage,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockPartTransactions } from '@/mock/data';
import '../Customer/style.css';

const Option = Select.Option;

const PartTransactions: React.FC = () => {
  const [transactions] = useState(mockPartTransactions);
  const [searchText, setSearchText] = useState('');
  const [type, setType] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();

  const filteredData = transactions.filter((t) => {
    const matchSearch = !searchText ||
      t.partName.includes(searchText) ||
      t.operator.includes(searchText) ||
      (t.relatedOrder && t.relatedOrder.includes(searchText));
    const matchType = !type || t.type === type;
    return matchSearch && matchType;
  });

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      入库: 'green',
      出库: 'orange',
      盘点: 'blue',
    };
    return colorMap[type] || 'gray';
  };

  const columns = [
    {
      title: '单据号',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => (
        <span style={{ color: 'var(--color-brass-dark)', fontFamily: 'var(--font-family-title)' }}>
          {id}
        </span>
      ),
    },
    {
      title: '零件名称',
      dataIndex: 'partName',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (t: string) => <Tag color={getTypeColor(t)}>{t}</Tag>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (q: number, record: any) => (
        <span style={{ color: record.type === '入库' ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {record.type === '入库' ? '+' : '-'}{q}
        </span>
      ),
    },
    {
      title: '变动前库存',
      dataIndex: 'stockBefore',
      width: 110,
    },
    {
      title: '变动后库存',
      dataIndex: 'stockAfter',
      width: 110,
    },
    {
      title: '关联单号',
      dataIndex: 'relatedOrder',
      width: 120,
      render: (order?: string) => order || '-',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      width: 100,
    },
    {
      title: '日期',
      dataIndex: 'date',
      width: 120,
    },
  ];

  return (
    <div className="page-container">
      <div className="detail-header">
        <Button type="text" icon={<IconArrowLeft />} onClick={() => navigate('/parts')}>
          返回库存
        </Button>
      </div>

      <SteampunkCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconStorage style={{ color: 'var(--color-brass-light)' }} />
            出入库记录
          </div>
        }
      >
        <div className="filter-bar">
          <Space size="medium">
            <Input
              style={{ width: 260 }}
              placeholder="搜索零件名称/操作人/单号"
              prefix={<IconSearch />}
              value={searchText}
              onChange={setSearchText}
              allowClear
            />
            <Select
              style={{ width: 130 }}
              placeholder="类型"
              value={type}
              onChange={setType}
              allowClear
            >
              <Option value="入库">入库</Option>
              <Option value="出库">出库</Option>
              <Option value="盘点">盘点</Option>
            </Select>
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} />
          </Space>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共 {filteredData.length} 条记录
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredData}
          pagination={{
            ...pagination,
            total: filteredData.length,
            onChange: (current, pageSize) => setPagination({ current, pageSize }),
          }}
          rowKey="id"
          style={{ marginTop: '16px' }}
        />
      </SteampunkCard>
    </div>
  );
};

export default PartTransactions;
