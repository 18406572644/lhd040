import React, { useState } from 'react';
import {
  Button,
  Tag,
  Tabs,
  Descriptions,
  Table,
  List,
  Empty,
  Upload,
  Message,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Space,
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconTool,
  IconUser,
  IconClockCircle,
  IconPlus,
  IconDelete,
  IconCamera,
} from '@arco-design/web-react/icon';
import { useParams, useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { ImageCompare } from '@/components/ImageCompare';
import { mockRepairRecords, mockParts } from '@/mock/data';
import type { RepairPart } from '@/types';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;

const beforeImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkMyQzJDIi8+PHN2ZyB4PSI1MCUiIHk9IjUwJSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTAwLCAtMTAwKSI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5MCIgZmlsbD0iIzhCNDYxMyIgc3Ryb2tlPSIjQjQ3MzJCIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMTAwIDI1IEw5NSAxMDAgTDEwNSAxMDAgWiIgZmlsbD0iI0ZCRkI4QSIvPjxwYXRoIGQ9Ik0xMDAgMzAgTDEwMCA5NSIgc3Ryb2tlPSIjMkMyQzJDIiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxMDAiIHk9IjExMCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI0Q0QUYzNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+57u/5L6mLjPCtDwvdGV4dD48L3N2Zz48dGV4dCB4PSI1MCUiIHk9IjMwIiBmb250LXNpemU9IjE2IiBmaWxsPSIjQ0Q1QzVDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7nu4nkvazliIY8L3RleHQ+PC9zdmc+';

const afterImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkMyQzJDIi8+PHN2ZyB4PSI1MCUiIHk9IjUwJSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTAwLCAtMTAwKSI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5MCIgZmlsbD0iI0Q0QUYzNyIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNMTAwIDI1IEw5NSAxMDAgTDEwNSAxMDAgWiIgZmlsbD0iIzNDM0MzQzIi8+PHBhdGggZD0iTTEwMCAzMCBMMTAwIDk1IiBzdHJva2U9IiMxQTFBMUEiIHN0cm9rZS13aWR0aD0iMiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMkMyQzJDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7nu7/ku6MuM8K0PC90ZXh0Pjwvc3ZnPjx0ZXh0IHg9IjUwJSIgeT0iMzAiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjhFMjMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuuiu+W4iOiusTwvdGV4dD48L3N2Zz4=';

const RepairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repair = mockRepairRecords.find((r) => r.id === id);
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [partsUsed, setPartsUsed] = useState<RepairPart[]>(repair?.partsUsed || []);
  const [partForm] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  if (!repair) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><Empty description="维修记录不存在" /></div>;
  }

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

  const handleAddPart = async () => {
    try {
      const values = await partForm.validate();
      const part = mockParts.find((p) => p.id === values.partId);
      if (part) {
        const newPart: RepairPart = {
          id: String(Date.now()),
          name: part.name,
          quantity: values.quantity,
          unitPrice: values.unitPrice || part.unitPrice,
          totalPrice: (values.unitPrice || part.unitPrice) * values.quantity,
        };
        setPartsUsed([...partsUsed, newPart]);
        setPartModalVisible(false);
        partForm.resetFields();
        Message.success('添加成功');
      }
    } catch {}
  };

  const handleDeletePart = (partId: string) => {
    setPartsUsed(partsUsed.filter((p) => p.id !== partId));
    Message.success('删除成功');
  };

  const partColumns = [
    {
      title: '零件名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 80,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '小计',
      dataIndex: 'totalPrice',
      width: 120,
      render: (price: number) => (
        <span style={{ color: 'var(--color-brass-light)' }}>¥{price}</span>
      ),
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 80,
      render: (_: any, record: RepairPart) => (
        <Button
          type="text"
          size="small"
          status="danger"
          icon={<IconDelete />}
          onClick={() => handleDeletePart(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  const totalPartsCost = partsUsed.reduce((sum, p) => sum + p.totalPrice, 0);

  const statusList = ['待接收', '检测中', '维修中', '待取件', '已完成', '已取消'];

  return (
    <div className="page-container">
      <div className="detail-header">
        <Button type="text" icon={<IconArrowLeft />} onClick={() => navigate('/repairs')}>
          返回列表
        </Button>
        <Space style={{ marginLeft: 'auto' }}>
          <Button onClick={() => setStatusModalVisible(true)}>
            更新状态
          </Button>
          <Button type="primary" className="steampunk-btn">保存</Button>
        </Space>
      </div>

      <SteampunkCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-brass-light), var(--color-brass-dark))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                border: '3px solid var(--color-brass-gold)',
              }}
            >
              <IconTool style={{ color: 'var(--color-gray-dark)' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--color-brass-light)', fontSize: '20px' }}>
                {repair.id} - {repair.type}
              </h2>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                <Tag color={getStatusColor(repair.status)} size="large">
                  {repair.status}
                </Tag>
                <Tag color={getPriorityColor(repair.priority)}>
                  {repair.priority}优先级
                </Tag>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>维修费用</div>
            <div style={{ color: 'var(--color-brass-light)', fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-family-title)' }}>
              ¥{totalPartsCost + repair.laborCost}
            </div>
          </div>
        </div>
      </SteampunkCard>

      <div style={{ marginTop: '20px' }}>
        <SteampunkCard>
          <Tabs defaultActiveTab="info">
            <TabPane key="info" title="基本信息">
              <Descriptions
                column={2}
                data={[
                  {
                    label: (
                      <span><IconClockCircle style={{ marginRight: '6px' }} />钟表信息</span>
                    ),
                    value: (
                      <span
                        style={{ color: 'var(--color-brass-dark)', cursor: 'pointer' }}
                        onClick={() => navigate(`/clocks/${repair.clockId}`)}
                      >
                        {repair.clockInfo}
                      </span>
                    ),
                  },
                  {
                    label: (
                      <span><IconUser style={{ marginRight: '6px' }} />客户</span>
                    ),
                    value: (
                      <span
                        style={{ color: 'var(--color-brass-dark)', cursor: 'pointer' }}
                        onClick={() => navigate(`/customers/${repair.customerId}`)}
                      >
                        {repair.customerName}
                      </span>
                    ),
                  },
                  { label: '接件日期', value: repair.receiveDate },
                  { label: '预计完成', value: repair.expectedDate || '-' },
                  { label: '完成日期', value: repair.completeDate || '-' },
                  { label: '技师', value: repair.technician || '-' },
                ]}
              />

              <div className="divider-brass" style={{ margin: '20px 0' }}></div>

              <div>
                <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>问题描述</h4>
                <div style={{ color: 'var(--color-text-primary)', padding: '12px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-brass-dark)' }}>
                  {repair.description}
                </div>
              </div>

              {repair.diagnosis && (
                <>
                  <div className="divider-brass" style={{ margin: '20px 0' }}></div>
                  <div>
                    <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>检测结果</h4>
                    <div style={{ color: 'var(--color-text-primary)', padding: '12px', background: 'rgba(107, 142, 35, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-success)' }}>
                      {repair.diagnosis}
                    </div>
                  </div>
                </>
              )}

              {repair.solution && (
                <>
                  <div className="divider-brass" style={{ margin: '20px 0' }}></div>
                  <div>
                    <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>维修方案</h4>
                    <div style={{ color: 'var(--color-text-primary)', padding: '12px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-warning)' }}>
                      {repair.solution}
                    </div>
                  </div>
                </>
              )}

              {repair.notes && (
                <>
                  <div className="divider-brass" style={{ margin: '20px 0' }}></div>
                  <div>
                    <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>备注</h4>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                      {repair.notes}
                    </div>
                  </div>
                </>
              )}
            </TabPane>

            <TabPane key="parts" title={`使用零件 (${partsUsed.length})`}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  零件费用：<span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>¥{totalPartsCost}</span>
                  &nbsp;&nbsp;|&nbsp;&nbsp;
                  工时费用：<span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>¥{repair.laborCost}</span>
                </span>
                <Button
                  type="primary"
                  size="small"
                  icon={<IconPlus />}
                  onClick={() => setPartModalVisible(true)}
                  className="steampunk-btn"
                >
                  添加零件
                </Button>
              </div>

              {partsUsed.length > 0 ? (
                <Table
                  columns={partColumns}
                  data={partsUsed}
                  pagination={false}
                  rowKey="id"
                />
              ) : (
                <Empty description="暂无使用零件" style={{ padding: '40px 0' }} />
              )}

              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '6px', textAlign: 'right' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>总计：</span>
                <span style={{ color: 'var(--color-brass-light)', fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-family-title)', marginLeft: '8px' }}>
                  ¥{totalPartsCost + repair.laborCost}
                </span>
              </div>
            </TabPane>

            <TabPane key="photos" title="照片对比">
              {repair.beforePhotos.length > 0 && repair.afterPhotos.length > 0 ? (
                <div>
                  <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '16px' }}>维修前后对比</h4>
                  <ImageCompare
                    beforeImage={beforeImg}
                    afterImage={afterImg}
                    height={320}
                  />
                </div>
              ) : (
                <Empty description="暂无照片" style={{ padding: '40px 0' }} />
              )}

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>维修前照片</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {repair.beforePhotos.length > 0 ? (
                    repair.beforePhotos.map((photo, index) => (
                      <div
                        key={index}
                        style={{
                          width: 120,
                          height: 90,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '2px solid var(--color-border)',
                        }}
                      >
                        <img src={beforeImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))
                  ) : (
                    <Upload
                      listType="picture-card"
                      accept="image/*"
                      multiple
                      limit={5}
                    >
                      <IconCamera />
                      <div style={{ marginTop: 4 }}>上传照片</div>
                    </Upload>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>维修后照片</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {repair.afterPhotos.length > 0 ? (
                    repair.afterPhotos.map((photo, index) => (
                      <div
                        key={index}
                        style={{
                          width: 120,
                          height: 90,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          border: '2px solid var(--color-border)',
                        }}
                      >
                        <img src={afterImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))
                  ) : (
                    <Upload
                      listType="picture-card"
                      accept="image/*"
                      multiple
                      limit={5}
                    >
                      <IconCamera />
                      <div style={{ marginTop: 4 }}>上传照片</div>
                    </Upload>
                  )}
                </div>
              </div>
            </TabPane>
          </Tabs>
        </SteampunkCard>
      </div>

      <Modal
        title="添加零件"
        visible={partModalVisible}
        onOk={handleAddPart}
        onCancel={() => setPartModalVisible(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form form={partForm} layout="vertical">
          <FormItem
            field="partId"
            label="选择零件"
            rules={[{ required: true, message: '请选择零件' }]}
          >
            <Select placeholder="请选择零件" showSearch>
              {mockParts.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name} (库存:{p.stock}, ¥{p.unitPrice})
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            field="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber min={1} defaultValue={1} style={{ width: '100%' }} />
          </FormItem>
          <FormItem field="unitPrice" label="单价">
            <InputNumber placeholder="留空使用默认价格" style={{ width: '100%' }} />
          </FormItem>
        </Form>
      </Modal>

      <Modal
        title="更新状态"
        visible={statusModalVisible}
        onOk={() => {
          if (newStatus) {
            Message.success(`状态已更新为：${newStatus}`);
            setStatusModalVisible(false);
          }
        }}
        onCancel={() => setStatusModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {statusList.map((s) => (
            <Tag
              key={s}
              color={getStatusColor(s)}
              size="large"
              style={{
                cursor: 'pointer',
                padding: '8px 16px',
                fontSize: '14px',
                opacity: newStatus === s ? 1 : 0.7,
                borderWidth: newStatus === s ? '2px' : '1px',
              }}
              onClick={() => setNewStatus(s)}
            >
              {s}
            </Tag>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default RepairDetail;
