import React, { useState } from 'react';
import {
  Table,
  Input,
  Button,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  Message,
  Popconfirm,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconDelete,
  IconEye,
  IconClockCircle,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockClocks, mockCustomers } from '@/mock/data';
import type { Clock } from '@/types';
import '../Customer/style.css';

const Option = Select.Option;
const FormItem = Form.Item;

const ClockList: React.FC = () => {
  const [clocks, setClocks] = useState<Clock[]>(mockClocks);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClock, setEditingClock] = useState<Clock | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const filteredData = clocks.filter((c) => {
    const matchSearch = !searchText ||
      c.brand.includes(searchText) ||
      c.model.includes(searchText) ||
      c.customerName.includes(searchText) ||
      c.serialNumber.includes(searchText);
    const matchStatus = !status || c.status === status;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      正常: 'green',
      维修中: 'orange',
      待保养: 'gold',
      已报废: 'gray',
    };
    return colorMap[status] || 'gray';
  };

  const handleAdd = () => {
    setEditingClock(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (clock: Clock) => {
    setEditingClock(clock);
    form.setFieldsValue(clock);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setClocks(clocks.filter((c) => c.id !== id));
    Message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      if (editingClock) {
        setClocks(clocks.map((c) =>
          c.id === editingClock.id ? { ...c, ...values } : c
        ));
        Message.success('更新成功');
      } else {
        const customer = mockCustomers.find((c) => c.id === values.customerId);
        const newClock: Clock = {
          ...values,
          id: String(Date.now()),
          customerName: customer?.name || '',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setClocks([newClock, ...clocks]);
        Message.success('添加成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = [
    {
      title: '品牌型号',
      dataIndex: 'brand',
      width: 180,
      render: (_: any, record: Clock) => (
        <div>
          <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {record.brand}
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px' }}>
            {record.model}
          </div>
        </div>
      ),
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
    },
    {
      title: '序列号',
      dataIndex: 'serialNumber',
      width: 160,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <Tag color={getStatusColor(s)}>{s}</Tag>,
    },
    {
      title: '上次保养',
      dataIndex: 'lastServiceDate',
      width: 120,
    },
    {
      title: '下次保养',
      dataIndex: 'nextMaintenanceDate',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: Clock) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => navigate(`/clocks/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            content="确定要删除该钟表档案吗？"
            onOk={() => handleDelete(record.id)}
          >
            <Button type="text" size="small" status="danger" icon={<IconDelete />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <SteampunkCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconClockCircle style={{ color: 'var(--color-brass-light)' }} />
            钟表档案
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<IconPlus />}
            className="steampunk-btn"
            onClick={handleAdd}
          >
            新增档案
          </Button>
        }
      >
        <div className="filter-bar">
          <Space size="medium">
            <Input
              style={{ width: 280 }}
              placeholder="搜索品牌/型号/客户/序列号"
              prefix={<IconSearch />}
              value={searchText}
              onChange={setSearchText}
              allowClear
            />
            <Select
              style={{ width: 140 }}
              placeholder="状态筛选"
              value={status}
              onChange={setStatus}
              allowClear
            >
              <Option value="正常">正常</Option>
              <Option value="维修中">维修中</Option>
              <Option value="待保养">待保养</Option>
              <Option value="已报废">已报废</Option>
            </Select>
          </Space>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共 {filteredData.length} 只钟表
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

      <Modal
        title={editingClock ? '编辑钟表档案' : '新增钟表档案'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        style={{ width: '600px' }}
      >
        <Form form={form} layout="vertical">
          <FormItem
            field="customerId"
            label="所属客户"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select placeholder="请选择客户" showSearch>
              {mockCustomers.map((c) => (
                <Option key={c.id} value={c.id}>{c.name} - {c.phone}</Option>
              ))}
            </Select>
          </FormItem>
          <Form.Item field="brand" label="品牌" rules={[{ required: true, message: '请输入品牌' }]}>
            <Input placeholder="请输入品牌" />
          </Form.Item>
          <Form.Item field="model" label="型号" rules={[{ required: true, message: '请输入型号' }]}>
            <Input placeholder="请输入型号" />
          </Form.Item>
          <Form.Item field="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Option value="自动机械表">自动机械表</Option>
              <Option value="手动机械表">手动机械表</Option>
              <Option value="石英表">石英表</Option>
              <Option value="光动能表">光动能表</Option>
              <Option value="怀表">怀表</Option>
              <Option value="挂钟">挂钟</Option>
            </Select>
          </Form.Item>
          <Form.Item field="serialNumber" label="序列号" rules={[{ required: true, message: '请输入序列号' }]}>
            <Input placeholder="请输入序列号" />
          </Form.Item>
          <Form.Item field="status" label="状态">
            <Select defaultValue="正常">
              <Option value="正常">正常</Option>
              <Option value="维修中">维修中</Option>
              <Option value="待保养">待保养</Option>
              <Option value="已报废">已报废</Option>
            </Select>
          </Form.Item>
          <Form.Item field="description" label="描述">
            <Input.TextArea placeholder="请输入描述信息" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClockList;
