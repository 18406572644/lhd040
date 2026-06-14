import React, { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Tag,
  Space,
  Message,
  Popconfirm,
  Modal,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconSend,
  IconNotification,
  IconPhone,
} from '@arco-design/web-react/icon';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockReminders } from '@/mock/data';
import type { MaintenanceReminder } from '@/types';
import '../Customer/style.css';

const Option = Select.Option;

const MaintenanceReminders: React.FC = () => {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>(mockReminders);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredData = reminders.filter((r) => {
    const matchSearch = !searchText ||
      r.clockInfo.includes(searchText) ||
      r.customerName.includes(searchText) ||
      r.customerPhone.includes(searchText);
    const matchStatus = !status || r.status === status;
    const matchType = !type || r.type === type;
    return matchSearch && matchStatus && matchType;
  });

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      待发送: 'gray',
      已发送: 'blue',
      已确认: 'green',
      已完成: 'cyan',
    };
    return colorMap[status] || 'gray';
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      定期保养: 'gold',
      机芯清洗: 'orange',
      防水检测: 'cyan',
      表带更换: 'purple',
    };
    return colorMap[type] || 'gray';
  };

  const handleSend = (id: string) => {
    setReminders(reminders.map((r) =>
      r.id === id
        ? { ...r, status: '已发送' as const, sendDate: new Date().toISOString().split('T')[0] }
        : r
    ));
    Message.success('提醒已发送');
  };

  const handleBatchSend = () => {
    setReminders(reminders.map((r) =>
      selectedIds.includes(r.id)
        ? { ...r, status: '已发送' as const, sendDate: new Date().toISOString().split('T')[0] }
        : r
    ));
    setSelectedIds([]);
    setBatchModalVisible(false);
    Message.success(`已发送 ${selectedIds.length} 条提醒`);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const columns = [
    {
      title: '钟表信息',
      dataIndex: 'clockInfo',
      width: 220,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'customerPhone',
      width: 130,
      render: (phone: string) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconPhone style={{ color: 'var(--color-brass-dark)' }} />
          {phone}
        </span>
      ),
    },
    {
      title: '提醒类型',
      dataIndex: 'type',
      width: 100,
      render: (t: string) => <Tag color={getTypeColor(t)}>{t}</Tag>,
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      width: 120,
      render: (date: string) => (
        <span style={{ color: isOverdue(date) ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
          {date}
          {isOverdue(date) && ' (已逾期)'}
        </span>
      ),
      sorter: (a: MaintenanceReminder, b: MaintenanceReminder) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <Tag color={getStatusColor(s)}>{s}</Tag>,
    },
    {
      title: '发送日期',
      dataIndex: 'sendDate',
      width: 110,
      render: (date?: string) => date || '-',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: MaintenanceReminder) => (
        <Space size="small">
          {record.status === '待发送' && (
            <Popconfirm
              title="发送提醒"
              content={`确定要给 ${record.customerName} 发送保养提醒吗？`}
              onOk={() => handleSend(record.id)}
            >
              <Button
                type="text"
                size="small"
                icon={<IconSend />}
              >
                发送
              </Button>
            </Popconfirm>
          )}
          <Button type="text" size="small">
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <SteampunkCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconNotification style={{ color: 'var(--color-brass-light)' }} />
            保养提醒
          </div>
        }
        extra={
          <Space>
            <Button onClick={() => setBatchModalVisible(true)} disabled={selectedIds.length === 0}>
              批量发送 ({selectedIds.length})
            </Button>
            <Button type="primary" icon={<IconPlus />} className="steampunk-btn">
              新增提醒
            </Button>
          </Space>
        }
      >
        <div className="filter-bar">
          <Space size="medium">
            <Input
              style={{ width: 260 }}
              placeholder="搜索钟表/客户/电话"
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
              <Option value="待发送">待发送</Option>
              <Option value="已发送">已发送</Option>
              <Option value="已确认">已确认</Option>
              <Option value="已完成">已完成</Option>
            </Select>
            <Select
              style={{ width: 130 }}
              placeholder="类型"
              value={type}
              onChange={setType}
              allowClear
            >
              <Option value="定期保养">定期保养</Option>
              <Option value="机芯清洗">机芯清洗</Option>
              <Option value="防水检测">防水检测</Option>
              <Option value="表带更换">表带更换</Option>
            </Select>
          </Space>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共 {filteredData.length} 条提醒
            {filteredData.filter((r) => r.status === '待发送').length > 0 && (
              <span style={{ color: 'var(--color-danger)', marginLeft: '8px' }}>
                {filteredData.filter((r) => r.status === '待发送').length} 条待发送
              </span>
            )}
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
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedIds,
            onChange: (keys) => setSelectedIds(keys as string[]),
          }}
          rowClassName={(record) =>
            record.status === '待发送' && isOverdue(record.dueDate) ? 'overdue-row' : ''
          }
        />
      </SteampunkCard>

      <Modal
        title="批量发送提醒"
        visible={batchModalVisible}
        onOk={handleBatchSend}
        onCancel={() => setBatchModalVisible(false)}
        okText="确认发送"
        cancelText="取消"
      >
        <p style={{ color: 'var(--color-text-primary)' }}>
          确定要发送选中的 <strong style={{ color: 'var(--color-brass-light)' }}>{selectedIds.length}</strong> 条保养提醒吗？
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '8px' }}>
          系统将通过短信通知客户。
        </p>
      </Modal>
    </div>
  );
};

export default MaintenanceReminders;
