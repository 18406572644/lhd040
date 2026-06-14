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
  IconPlus,
  IconSearch,
  IconEye,
  IconTool,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockRepairRecords } from '@/mock/data';
import type { RepairRecord } from '@/types';
import '../Customer/style.css';

const Option = Select.Option;

const RepairList: React.FC = () => {
  const [repairs] = useState<RepairRecord[]>(mockRepairRecords);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const navigate = useNavigate();

  const filteredData = repairs.filter((r) => {
    const matchSearch = !searchText ||
      r.id.includes(searchText) ||
      r.clockInfo.includes(searchText) ||
      r.customerName.includes(searchText);
    const matchStatus = !status || r.status === status;
    const matchType = !type || r.type === type;
    const matchPriority = !priority || r.priority === priority;
    return matchSearch && matchStatus && matchType && matchPriority;
  });

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      待接收: 'gold',
      检测中: 'blue',
      维修中: 'orange',
      待取件: 'cyan',
      已完成: 'green',
      已取消: 'gray',
    };
    return colorMap[status] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      低: 'green',
      中: 'blue',
      高: 'orange',
      紧急: 'red',
    };
    return colorMap[priority] || 'gray';
  };

  const columns = [
    {
      title: '维修单号',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => (
        <span style={{ color: 'var(--color-brass-dark)', fontFamily: 'var(--font-family-title)' }}>
          {id}
        </span>
      ),
    },
    {
      title: '钟表信息',
      dataIndex: 'clockInfo',
      width: 180,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (t: string) => <Tag size="small">{t}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <Tag color={getStatusColor(s)}>{s}</Tag>,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      render: (p: string) => <Tag color={getPriorityColor(p)} size="small">{p}</Tag>,
    },
    {
      title: '费用',
      dataIndex: 'totalCost',
      width: 100,
      render: (cost: number) => cost > 0 ? (
        <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>
          ¥{cost}
        </span>
      ) : '-',
    },
    {
      title: '技师',
      dataIndex: 'technician',
      width: 90,
      render: (t: string) => t || '-',
    },
    {
      title: '接件日期',
      dataIndex: 'receiveDate',
      width: 110,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: RepairRecord) => (
        <Button
          type="text"
          size="small"
          icon={<IconEye />}
          onClick={() => navigate(`/repairs/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <SteampunkCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconTool style={{ color: 'var(--color-brass-light)' }} />
            维修管理
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<IconPlus />}
            className="steampunk-btn"
            onClick={() => navigate('/repairs/new')}
          >
            新增维修单
          </Button>
        }
      >
        <div className="filter-bar">
          <Space size="medium" wrap>
            <Input
              style={{ width: 260 }}
              placeholder="搜索单号/钟表/客户"
              prefix={<IconSearch />}
              value={searchText}
              onChange={setSearchText}
              allowClear
            />
            <Select
              style={{ width: 130 }}
              placeholder="状态"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="待接收">待接收</Option>
              <Option value="检测中">检测中</Option>
              <Option value="维修中">维修中</Option>
              <Option value="待取件">待取件</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已取消">已取消</Option>
            </Select>
            <Select
              style={{ width: 120 }}
              placeholder="类型"
              value={type}
              onChange={setType}
              allowClear
            >
              <Option value="维修">维修</Option>
              <Option value="保养">保养</Option>
              <Option value="检测">检测</Option>
              <Option value="翻新">翻新</Option>
            </Select>
            <Select
              style={{ width: 120 }}
              placeholder="优先级"
              value={priority}
              onChange={setPriority}
              allowClear
            >
              <Option value="低">低</Option>
              <Option value="中">中</Option>
              <Option value="高">高</Option>
              <Option value="紧急">紧急</Option>
            </Select>
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

export default RepairList;
