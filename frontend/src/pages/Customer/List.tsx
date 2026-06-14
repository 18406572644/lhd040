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
  IconUser,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockCustomers } from '@/mock/data';
import type { Customer } from '@/types';
import './style.css';

const Option = Select.Option;
const FormItem = Form.Item;

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchText, setSearchText] = useState('');
  const [memberLevel, setMemberLevel] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const filteredData = customers.filter((c) => {
    const matchSearch = !searchText ||
      c.name.includes(searchText) ||
      c.phone.includes(searchText);
    const matchLevel = !memberLevel || c.memberLevel === memberLevel;
    return matchSearch && matchLevel;
  });

  const getMemberColor = (level: string) => {
    const colors: Record<string, string> = {
      普通: 'gray',
      银卡: 'blue',
      金卡: 'gold',
      钻石: 'purple',
    };
    return colors[level] || 'gray';
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    Message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      if (editingCustomer) {
        setCustomers(customers.map((c) =>
          c.id === editingCustomer.id ? { ...c, ...values } : c
        ));
        Message.success('更新成功');
      } else {
        const newCustomer: Customer = {
          ...values,
          id: String(Date.now()),
          totalRepairs: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCustomers([newCustomer, ...customers]);
        Message.success('添加成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'name',
      width: 120,
      render: (name: string, record: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-brass-light), var(--color-brass-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gray-dark)',
              fontWeight: 'bold',
              fontSize: '14px',
              border: '2px solid var(--color-brass-gold)',
            }}
          >
            {name.charAt(0)}
          </div>
          <span style={{ color: 'var(--color-text-primary)' }}>{name}</span>
        </div>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 140,
    },
    {
      title: '会员等级',
      dataIndex: 'memberLevel',
      width: 100,
      render: (level: string) => <Tag color={getMemberColor(level)}>{level}</Tag>,
    },
    {
      title: '维修次数',
      dataIndex: 'totalRepairs',
      width: 100,
      sorter: (a: Customer, b: Customer) => a.totalRepairs - b.totalRepairs,
    },
    {
      title: '累计消费',
      dataIndex: 'totalAmount',
      width: 120,
      render: (amount: number) => (
        <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>
          ¥{amount.toLocaleString()}
        </span>
      ),
      sorter: (a: Customer, b: Customer) => a.totalAmount - b.totalAmount,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: Customer) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => navigate(`/customers/${record.id}`)}
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
            content="确定要删除该客户吗？"
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
            <IconUser style={{ color: 'var(--color-brass-light)' }} />
            客户管理
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<IconPlus />}
            className="steampunk-btn"
            onClick={handleAdd}
          >
            新增客户
          </Button>
        }
      >
        <div className="filter-bar">
          <Space size="medium">
            <Input
              style={{ width: 240 }}
              placeholder="搜索客户名称/电话"
              prefix={<IconSearch />}
              value={searchText}
              onChange={setSearchText}
              allowClear
            />
            <Select
              style={{ width: 140 }}
              placeholder="会员等级"
              value={memberLevel}
              onChange={setMemberLevel}
              allowClear
            >
              <Option value="普通">普通会员</Option>
              <Option value="银卡">银卡会员</Option>
              <Option value="金卡">金卡会员</Option>
              <Option value="钻石">钻石会员</Option>
            </Select>
          </Space>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共 {filteredData.length} 位客户
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
          rowClassName={() => 'table-row'}
        />
      </SteampunkCard>

      <Modal
        title={editingCustomer ? '编辑客户' : '新增客户'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <FormItem
            field="name"
            label="客户姓名"
            rules={[{ required: true, message: '请输入客户姓名' }]}
          >
            <Input placeholder="请输入客户姓名" />
          </FormItem>
          <FormItem
            field="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </FormItem>
          <FormItem field="email" label="电子邮箱">
            <Input placeholder="请输入电子邮箱" />
          </FormItem>
          <FormItem field="memberLevel" label="会员等级">
            <Select defaultValue="普通">
              <Option value="普通">普通会员</Option>
              <Option value="银卡">银卡会员</Option>
              <Option value="金卡">金卡会员</Option>
              <Option value="钻石">钻石会员</Option>
            </Select>
          </FormItem>
          <FormItem field="address" label="地址">
            <Input placeholder="请输入地址" />
          </FormItem>
          <FormItem field="notes" label="备注">
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerList;
