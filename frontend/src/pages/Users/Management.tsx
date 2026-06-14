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
  Switch,
  Avatar,
  Radio,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconDelete,
  IconUserGroup,
} from '@arco-design/web-react/icon';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockUsers } from '@/mock/data';
import type { SystemUser } from '@/types';
import '../Customer/style.css';

const Option = Select.Option;
const FormItem = Form.Item;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);
  const [searchText, setSearchText] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [form] = Form.useForm();

  const filteredData = users.filter((u) => {
    const matchSearch = !searchText ||
      u.name.includes(searchText) ||
      u.username.includes(searchText) ||
      (u.phone && u.phone.includes(searchText));
    const matchRole = !role || u.role === role;
    return matchSearch && matchRole;
  });

  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '管理员',
      manager: '经理',
      technician: '技师',
      receptionist: '前台',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      admin: 'red',
      manager: 'purple',
      technician: 'blue',
      receptionist: 'green',
    };
    return colorMap[role] || 'gray';
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ status: '启用', role: 'technician' });
    setModalVisible(true);
  };

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    Message.success('删除成功');
  };

  const handleToggleStatus = (id: string, status: boolean) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, status: status ? '启用' : '禁用' } : u
    ));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validate();
      if (editingUser) {
        setUsers(users.map((u) =>
          u.id === editingUser.id ? { ...u, ...values } : u
        ));
        Message.success('更新成功');
      } else {
        const newUser: SystemUser = {
          ...values,
          id: String(Date.now()),
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers([newUser, ...users]);
        Message.success('添加成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = [
    {
      title: '用户信息',
      dataIndex: 'name',
      width: 180,
      render: (_: any, record: SystemUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            size={36}
            style={{
              background: 'linear-gradient(135deg, var(--color-brass-light), var(--color-brass-dark))',
              color: 'var(--color-gray-dark)',
              fontWeight: 'bold',
              border: '2px solid var(--color-brass-gold)',
            }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{record.name}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (r: string) => <Tag color={getRoleColor(r)}>{getRoleText(r)}</Tag>,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      render: (p?: string) => p || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      render: (e?: string) => e || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: string, record: SystemUser) => (
        <Switch
          checked={status === '启用'}
          onChange={(checked) => handleToggleStatus(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      width: 150,
      render: (d?: string) => d || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: SystemUser) => (
        <Space size="small">
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
            content="确定要删除该用户吗？"
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
            <IconUserGroup style={{ color: 'var(--color-brass-light)' }} />
            用户管理
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<IconPlus />}
            className="steampunk-btn"
            onClick={handleAdd}
          >
            新增用户
          </Button>
        }
      >
        <div className="filter-bar">
          <Space size="medium">
            <Input
              style={{ width: 260 }}
              placeholder="搜索姓名/用户名/手机"
              prefix={<IconSearch />}
              value={searchText}
              onChange={setSearchText}
              allowClear
            />
            <Select
              style={{ width: 140 }}
              placeholder="角色筛选"
              value={role}
              onChange={setRole}
              allowClear
            >
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="technician">技师</Option>
              <Option value="receptionist">前台</Option>
            </Select>
          </Space>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共 {filteredData.length} 位用户
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
        title={editingUser ? '编辑用户' : '新增用户'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        style={{ width: '500px' }}
      >
        <Form form={form} layout="vertical">
          <FormItem
            field="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </FormItem>
          <FormItem
            field="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </FormItem>
          {!editingUser && (
            <FormItem
              field="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </FormItem>
          )}
          <FormItem
            field="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="technician">技师</Option>
              <Option value="receptionist">前台</Option>
            </Select>
          </FormItem>
          <FormItem field="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </FormItem>
          <FormItem field="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </FormItem>
          <FormItem field="status" label="状态">
            <Radio.Group>
              <Radio value="启用">启用</Radio>
              <Radio value="禁用">禁用</Radio>
            </Radio.Group>
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
