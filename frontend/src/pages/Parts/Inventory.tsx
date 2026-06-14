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
  InputNumber,
  Badge,
  Radio,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconStorage,
  IconImport,
  IconExport,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockParts } from '@/mock/data';
import type { Part } from '@/types';
import '../Customer/style.css';

const Option = Select.Option;
const FormItem = Form.Item;

const PartInventory: React.FC = () => {
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'stock'>('add');
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [stockForm] = Form.useForm();
  const [partForm] = Form.useForm();
  const navigate = useNavigate();

  const filteredData = parts.filter((p) => {
    const matchSearch = !searchText ||
      p.name.includes(searchText) ||
      p.code.includes(searchText);
    const matchCategory = !category || p.category === category;
    return matchSearch && matchCategory;
  });

  const categories = Array.from(new Set(parts.map((p) => p.category)));

  const getStockStatus = (part: Part) => {
    if (part.stock <= part.minStock) return 'error';
    if (part.stock <= part.minStock * 1.5) return 'warning';
    return 'success';
  };

  const handleAddPart = () => {
    setEditingPart(null);
    partForm.resetFields();
    setModalType('add');
    setModalVisible(true);
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    partForm.setFieldsValue(part);
    setModalType('add');
    setModalVisible(true);
  };

  const handleStockIn = (part: Part) => {
    setEditingPart(part);
    stockForm.resetFields();
    stockForm.setFieldsValue({ partId: part.id, type: '入库' });
    setModalType('stock');
    setModalVisible(true);
  };

  const handleStockOut = (part: Part) => {
    setEditingPart(part);
    stockForm.resetFields();
    stockForm.setFieldsValue({ partId: part.id, type: '出库' });
    setModalType('stock');
    setModalVisible(true);
  };

  const handleSubmitPart = async () => {
    try {
      const values = await partForm.validate();
      if (editingPart) {
        setParts(parts.map((p) =>
          p.id === editingPart.id ? { ...p, ...values } : p
        ));
        Message.success('更新成功');
      } else {
        const newPart: Part = {
          ...values,
          id: String(Date.now()),
          stock: values.stock || 0,
        };
        setParts([newPart, ...parts]);
        Message.success('添加成功');
      }
      setModalVisible(false);
    } catch {}
  };

  const handleStockSubmit = async () => {
    try {
      const values = await stockForm.validate();
      if (editingPart) {
        const quantity = values.type === '入库' ? values.quantity : -values.quantity;
        setParts(parts.map((p) =>
          p.id === editingPart.id
            ? { ...p, stock: Math.max(0, p.stock + quantity) }
            : p
        ));
        Message.success(`${values.type}成功`);
      }
      setModalVisible(false);
    } catch {}
  };

  const columns = [
    {
      title: '零件名称',
      dataIndex: 'name',
      width: 200,
      render: (name: string, record: Part) => (
        <div>
          <div style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{name}</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{record.code}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      filters: categories.map((c) => ({ text: c, value: c })),
      onFilter: (value: string, record: Part) => record.category === value,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 120,
      sorter: (a: Part, b: Part) => a.stock - b.stock,
      render: (stock: number, record: Part) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge status={getStockStatus(record) as any} />
          <span style={{ color: stock <= record.minStock ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
            {stock} {record.unit}
          </span>
        </div>
      ),
    },
    {
      title: '最低库存',
      dataIndex: 'minStock',
      width: 100,
      render: (min: number, record: Part) => `${min} ${record.unit}`,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 100,
      render: (price: number) => (
        <span style={{ color: 'var(--color-brass-light)' }}>¥{price}</span>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      width: 160,
    },
    {
      title: '最后入库',
      dataIndex: 'lastRestockDate',
      width: 120,
      render: (date: string) => date || '-',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Part) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<IconImport />}
            onClick={() => handleStockIn(record)}
          >
            入库
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconExport />}
            onClick={() => handleStockOut(record)}
          >
            出库
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEditPart(record)}
          >
            编辑
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
            <IconStorage style={{ color: 'var(--color-brass-light)' }} />
            零件库存
          </div>
        }
        extra={
          <Space>
            <Button onClick={() => navigate('/parts/transactions')}>
              出入库记录
            </Button>
            <Button
              type="primary"
              icon={<IconPlus />}
              className="steampunk-btn"
              onClick={handleAddPart}
            >
              新增零件
            </Button>
          </Space>
        }
      >
        <div className="filter-bar">
          <Space size="medium">
            <Input
              style={{ width: 260 }}
              placeholder="搜索零件名称/编码"
              prefix={<IconSearch />}
              value={searchText}
              onChange={setSearchText}
              allowClear
            />
            <Select
              style={{ width: 140 }}
              placeholder="分类"
              value={category}
              onChange={setCategory}
              allowClear
            >
              {categories.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Space>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共 {filteredData.length} 种零件 ·
            <span style={{ color: 'var(--color-danger)', marginLeft: '4px' }}>
              {filteredData.filter((p) => p.stock <= p.minStock).length} 项库存告警
            </span>
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
          rowClassName={(record) =>
            record.stock <= record.minStock ? 'low-stock-row' : ''
          }
        />
      </SteampunkCard>

      <Modal
        title={editingPart ? '编辑零件' : '新增零件'}
        visible={modalVisible && modalType === 'add'}
        onOk={handleSubmitPart}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        style={{ width: '550px' }}
      >
        <Form form={partForm} layout="vertical">
          <FormItem field="name" label="零件名称" rules={[{ required: true, message: '请输入零件名称' }]}>
            <Input placeholder="请输入零件名称" />
          </FormItem>
          <FormItem field="code" label="零件编码" rules={[{ required: true, message: '请输入零件编码' }]}>
            <Input placeholder="请输入零件编码" />
          </FormItem>
          <div style={{ display: 'flex', gap: '16px' }}>
            <FormItem field="category" label="分类" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Select placeholder="请选择分类">
                {categories.map((c) => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            </FormItem>
            <FormItem field="unit" label="单位" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Select placeholder="单位">
                <Option value="个">个</Option>
                <Option value="片">片</Option>
                <Option value="条">条</Option>
                <Option value="粒">粒</Option>
                <Option value="套">套</Option>
              </Select>
            </FormItem>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <FormItem field="stock" label="库存数量" style={{ flex: 1 }}>
              <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
            </FormItem>
            <FormItem field="minStock" label="最低库存" style={{ flex: 1 }}>
              <InputNumber min={0} defaultValue={0} style={{ width: '100%' }} />
            </FormItem>
          </div>
          <FormItem field="unitPrice" label="单价" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} prefix="¥" />
          </FormItem>
          <FormItem field="supplier" label="供应商">
            <Input placeholder="请输入供应商" />
          </FormItem>
          <FormItem field="description" label="描述">
            <Input.TextArea placeholder="请输入描述信息" rows={3} />
          </FormItem>
        </Form>
      </Modal>

      <Modal
        title={stockForm.getFieldValue?.('type') === '入库' ? '零件入库' : '零件出库'}
        visible={modalVisible && modalType === 'stock'}
        onOk={handleStockSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={stockForm} layout="vertical">
          <FormItem field="type" label="操作类型" rules={[{ required: true }]}>
            <Radio.Group disabled>
              <Radio value="入库">入库</Radio>
              <Radio value="出库">出库</Radio>
            </Radio.Group>
          </FormItem>
          <Form.Item label="零件名称">
            <Input value={editingPart?.name} disabled />
          </Form.Item>
          <Form.Item label="当前库存">
            <Input value={`${editingPart?.stock} ${editingPart?.unit}`} disabled />
          </Form.Item>
          <FormItem field="quantity" label="数量" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </FormItem>
          <FormItem field="notes" label="备注">
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default PartInventory;
