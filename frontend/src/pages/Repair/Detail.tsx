import React, { useState, useCallback, useMemo } from 'react';
import {
  Button,
  Tag,
  Tabs,
  Descriptions,
  Table,
  Empty,
  Upload,
  Message,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Space,
  Alert,
  Steps,
  Radio,
} from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconTool,
  IconUser,
  IconClockCircle,
  IconPlus,
  IconDelete,
  IconCamera,
  IconEye,
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconExclamationCircleFill,
  IconSync,
  IconSend,
} from '@arco-design/web-react/icon';
import { useParams, useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { ImageCompare } from '@/components/ImageCompare';
import { SettlementPanel } from '@/components/SettlementPanel';
import { PaymentPanel } from '@/components/PaymentPanel';
import { PickupVoucherPanel } from '@/components/PickupVoucherPanel';
import { mockParts, mockCustomers, mockClocks } from '@/mock/data';
import { useRepairStore } from '@/store/repairStore';
import { useSettlementStore } from '@/store/settlementStore';
import { fileToBase64 } from '@/utils/image';
import type { RepairPart, RepairStatusType, RepairStatusLog, PaymentMethodType, Settlement, PaymentRecord, PickupVoucher } from '@/types';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;

const STATUS_STEP_MAP: Record<string, number> = {
  '待接收': 0,
  '检测中': 1,
  '维修中': 2,
  '待取件': 3,
  '已完成': 4,
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    '待接收': 'gold',
    '检测中': 'blue',
    '维修中': 'orange',
    '待取件': 'cyan',
    '已完成': 'green',
    '已取消': 'gray',
  };
  return colorMap[status] || 'gray';
};

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    '低': 'green',
    '中': 'blue',
    '高': 'orange',
    '紧急': 'red',
  };
  return colorMap[priority] || 'gray';
};

const getStatusIcon = (fromStatus: RepairStatusType, toStatus: RepairStatusType) => {
  if (toStatus === '已取消') return <IconCloseCircleFill style={{ color: 'rgb(var(--danger-6))', fontSize: 20 }} />;
  if (fromStatus === toStatus) return <IconExclamationCircleFill style={{ color: 'rgb(var(--warning-6))', fontSize: 20 }} />;
  return <IconCheckCircleFill style={{ color: 'rgb(var(--success-6))', fontSize: 20 }} />;
};

const getStatusLogTitle = (log: RepairStatusLog) => {
  if (log.fromStatus === log.toStatus) {
    if (log.toStatus === '待接收') return '创建工单';
    return log.remark || '操作记录';
  }
  if (log.toStatus === '已取消') return `取消工单（从 ${log.fromStatus}）`;
  return `${log.fromStatus} → ${log.toStatus}`;
};

const FlowTimeline: React.FC<{ logs: RepairStatusLog[] }> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return <Empty description="暂无流程记录" style={{ padding: '40px 0' }} />;
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        return (
          <div
            key={log.id}
            style={{
              display: 'flex',
              gap: '16px',
              paddingBottom: isLast ? 0 : '24px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 24 }}>
              {getStatusIcon(log.fromStatus, log.toStatus)}
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: 'linear-gradient(to bottom, var(--color-brass-dark), var(--color-border))',
                    marginTop: 4,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, fontSize: 14 }}>
                  {getStatusLogTitle(log)}
                </span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12, flexShrink: 0, marginLeft: 12 }}>
                  {log.createTime}
                </span>
              </div>
              {log.operator && (
                <div style={{ color: 'var(--color-brass-light)', fontSize: 12, marginBottom: 4 }}>
                  操作人：{log.operator}
                </div>
              )}
              {log.remark && log.fromStatus !== log.toStatus && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 4 }}>
                  {log.remark}
                </div>
              )}
              {log.fromStatus === log.toStatus && log.remark && log.toStatus !== '待接收' && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 4 }}>
                  {log.remark}
                </div>
              )}
              {log.diagnosisResult && (
                <div style={{
                  background: 'rgba(107, 142, 35, 0.1)',
                  borderRadius: 4,
                  padding: '8px 12px',
                  marginTop: 4,
                  borderLeft: '3px solid var(--color-success)',
                }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 2 }}>诊断结果</div>
                  <div style={{ color: 'var(--color-text-primary)', fontSize: 13 }}>{log.diagnosisResult}</div>
                </div>
              )}
              {log.estimatedCost != null && (
                <div style={{
                  background: 'rgba(218, 165, 32, 0.1)',
                  borderRadius: 4,
                  padding: '8px 12px',
                  marginTop: 4,
                  borderLeft: '3px solid var(--color-warning)',
                }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginBottom: 2 }}>预估费用</div>
                  <div style={{ color: 'var(--color-brass-light)', fontSize: 15, fontWeight: 'bold', fontFamily: 'var(--font-family-title)' }}>
                    ¥{log.estimatedCost}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const STATUS_FLOW: Record<string, string[]> = {
  '待接收': ['检测中', '已取消'],
  '检测中': ['维修中', '已取消'],
  '维修中': ['待取件', '已取消'],
  '待取件': ['已完成'],
  '已完成': [],
  '已取消': [],
};

const RepairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const repairs = useRepairStore((state) => state.repairs);
  const repair = useMemo(() => repairs.find((r) => r.id === id), [repairs, id]);

  const photosByRepair = useRepairStore((state) => state.photos[id || ''] || []);
  const beforePhotos = useMemo(
    () => photosByRepair.filter((p: any) => p.type === 'before'),
    [photosByRepair]
  );
  const afterPhotos = useMemo(
    () => photosByRepair.filter((p: any) => p.type === 'after'),
    [photosByRepair]
  );

  const addPart = useRepairStore((state) => state.addPart);
  const removePart = useRepairStore((state) => state.removePart);
  const transitionStatus = useRepairStore((state) => state.transitionStatus);
  const uploadPhoto = useRepairStore((state) => state.uploadPhoto);
  const deletePhoto = useRepairStore((state) => state.deletePhoto);
  const sendPickupNotify = useRepairStore((state) => state.sendPickupNotify);
  const updateStatus = useRepairStore((state) => state.updateStatus);

  const getSettlement = useSettlementStore((state) => state.getSettlement);
  const getPaymentRecords = useSettlementStore((state) => state.getPaymentRecords);
  const getVoucher = useSettlementStore((state) => state.getVoucher);
  const createSettlement = useSettlementStore((state) => state.createSettlement);
  const processPayment = useSettlementStore((state) => state.processPayment);
  const confirmPickup = useSettlementStore((state) => state.confirmPickup);
  const isLoading = useSettlementStore((state) => state.isLoading);
  const setLoading = useSettlementStore((state) => state.setLoading);

  const [partModalVisible, setPartModalVisible] = useState(false);
  const [partForm] = Form.useForm();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [pickupNotifyModalVisible, setPickupNotifyModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [pickupForm] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const settlement = useMemo(() => id ? getSettlement(id) : null, [id, getSettlement]);
  const paymentRecords = useMemo(() => id ? getPaymentRecords(id) : [], [id, getPaymentRecords]);
  const voucher = useMemo(() => id ? getVoucher(id) : null, [id, getVoucher]);
  const loading = useMemo(() => isLoading(id || ''), [id, isLoading]);

  const handleGenerateSettlement = async (discount?: number, discountReason?: string) => {
    if (!id || !repair) throw new Error('数据异常');
    setLoading(id, true);
    try {
      return createSettlement(id, repair, discount, discountReason, '', '前台小刘');
    } finally {
      setLoading(id, false);
    }
  };

  const handlePay = async (
    method: PaymentMethodType,
    amount: number,
    transactionNo?: string,
    remark?: string
  ) => {
    if (!id || !settlement) throw new Error('数据异常');
    setLoading(id, true);
    try {
      const customer = customerData;
      processPayment(id, settlement.id, method, amount, customer, transactionNo, '前台小刘', remark);
    } finally {
      setLoading(id, false);
    }
  };

  const handleConfirmPickup = async (signature?: string, manualConfirm?: boolean) => {
    if (!id || !settlement) throw new Error('数据异常');
    setLoading(id, true);
    try {
      const result = confirmPickup(
        id,
        settlement.id,
        customerData,
        clockData,
        signature,
        manualConfirm,
        '前台小刘'
      );
      updateStatus(id, '已完成');
      return result;
    } finally {
      setLoading(id, false);
    }
  };

  const handlePrintSettlement = () => {
    window.print();
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const allowedTransitions = useMemo(() => {
    if (!repair) return [];
    return STATUS_FLOW[repair.status] || [];
  }, [repair]);

  if (!repair) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Empty description="维修记录不存在" />
      </div>
    );
  }

  const isCancelled = repair.status === '已取消';
  const isCompleted = repair.status === '已完成';

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
        addPart(repair.id, newPart);
        setPartModalVisible(false);
        partForm.resetFields();
        Message.success('添加成功');
      }
    } catch {}
  };

  const handleDeletePart = (partId: string) => {
    removePart(repair.id, partId);
    Message.success('删除成功');
  };

  const handleCustomUpload = useCallback(
    (type: 'before' | 'after') => {
      return async (options: {
        file: File;
        onProgress: (percent: number) => void;
        onSuccess: () => void;
        onError: (response?: object) => void;
      }) => {
        const { file, onProgress, onSuccess, onError } = options;
        try {
          setUploading(true);
          onProgress(30);
          const base64Url = await fileToBase64(file);
          onProgress(70);
          uploadPhoto(repair.id, {
            url: base64Url,
            type,
            name: file.name || (type === 'before' ? '维修前照片' : '维修后照片'),
          });
          onProgress(100);
          onSuccess();
          Message.success('照片上传成功');
        } catch (err) {
          onError({ message: '上传失败' });
          Message.error('照片上传失败');
        } finally {
          setUploading(false);
        }
      };
    },
    [repair.id, uploadPhoto]
  );

  const handleDeletePhoto = (photoId: string) => {
    deletePhoto(repair.id, photoId);
    Message.success('照片已删除');
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewVisible(true);
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

  const totalPartsCost = repair.partsUsed.reduce((sum, p) => sum + p.totalPrice, 0);

  const handleStatusTransition = async () => {
    try {
      const values = await statusForm.validate();
      const targetStatus = values.targetStatus as RepairStatusType;

      try {
        transitionStatus(repair.id, {
          status: targetStatus,
          remark: values.remark,
          diagnosisResult: values.diagnosisResult,
          estimatedCost: values.estimatedCost,
          operator: values.operator,
        });
        Message.success(`状态已更新为：${targetStatus}`);
        setStatusModalVisible(false);
        statusForm.resetFields();
      } catch (err: any) {
        Message.error(err.message || '状态变更失败');
      }
    } catch {}
  };

  const handleSendPickupNotify = async () => {
    try {
      const values = await pickupForm.validate();
      try {
        sendPickupNotify(repair.id, values.notifyMethod, values.message);
        Message.success('取件通知已发送');
        setPickupNotifyModalVisible(false);
        pickupForm.resetFields();
      } catch (err: any) {
        Message.error(err.message || '发送通知失败');
      }
    } catch {}
  };

  const customerData = mockCustomers.find((c) => c.id === repair.customerId);
  const clockData = mockClocks.find((c) => c.id === repair.clockId);

  const beforeImgUrl = beforePhotos.length > 0 ? beforePhotos[0].url : '';
  const afterImgUrl = afterPhotos.length > 0 ? afterPhotos[0].url : '';

  const renderPhotoGrid = (photos: typeof beforePhotos, type: 'before' | 'after') => {
    const label = type === 'before' ? '维修前' : '维修后';
    return (
      <div>
        <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>
          {label}照片 ({photos.length})
        </h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                width: 120,
                height: 90,
                borderRadius: '6px',
                overflow: 'hidden',
                border: '2px solid var(--color-border)',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={() => handlePreview(photo.url)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Button
                size="mini"
                status="danger"
                icon={<IconDelete />}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '24px',
                  height: '24px',
                  padding: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.id);
                }}
              />
            </div>
          ))}
          <Upload
            listType="picture-card"
            accept="image/*"
            multiple
            limit={5}
            customRequest={handleCustomUpload(type)}
            fileList={[]}
            disabled={uploading}
            style={{ width: 120, height: 90 }}
          >
            <IconCamera />
            <div style={{ marginTop: 4, fontSize: '12px' }}>上传照片</div>
          </Upload>
        </div>
      </div>
    );
  };

  const currentStep = repair.status === '已取消' ? -1 : (STATUS_STEP_MAP[repair.status] ?? 0);

  return (
    <>
      <div className="page-container">
        <div className="detail-header">
          <Button type="text" icon={<IconArrowLeft />} onClick={() => navigate('/repairs')}>
            返回列表
          </Button>
          <Space style={{ marginLeft: 'auto' }}>
            {repair.status === '待取件' && (
              <Button
                type="outline"
                icon={<IconSend />}
                onClick={() => setPickupNotifyModalVisible(true)}
                style={{ borderColor: 'var(--color-brass-light)', color: 'var(--color-brass-light)' }}
              >
                发送取件通知
              </Button>
            )}
            {!isCompleted && !isCancelled && (
              <Button
                icon={<IconSync />}
                onClick={() => setStatusModalVisible(true)}
                style={{ borderColor: 'var(--color-brass-dark)', color: 'var(--color-brass-dark)' }}
              >
                变更状态
              </Button>
            )}
            <Button type="primary" className="steampunk-btn">
              保存
            </Button>
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
                  <Tag color={getPriorityColor(repair.priority)}>{repair.priority}优先级</Tag>
                  {repair.pickupNotified && (
                    <Tag color='purple' icon={<IconSend />}>已通知取件</Tag>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>维修费用</div>
              <div
                style={{
                  color: 'var(--color-brass-light)', fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--font-family-title)' }}
              >
                ¥{totalPartsCost + repair.laborCost}
              </div>
            </div>
          </div>

          {repair.status !== '已取消' && (
            <div style={{ marginTop: '20px' }}>
              <Steps
                current={currentStep}
                size="small"
                lineless={false}
                style={{ padding: '0 20px' }}
              >
                <Steps.Step title="待接收" />
                <Steps.Step title="检测中" />
                <Steps.Step title="维修中" />
                <Steps.Step title="待取件" />
                <Steps.Step title="已完成" />
              </Steps>
            </div>
          )}
        </SteampunkCard>

        <div style={{ marginTop: '20px' }}>
          <SteampunkCard>
            <Tabs activeTab={activeTab} onChange={setActiveTab}>
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
                        {clockData ? `${clockData.brand} ${clockData.model}` : repair.clockInfo}
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
                        {customerData?.name || repair.customerName}
                        {customerData?.phone && ` (${customerData.phone})`}
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

              {(repair.diagnosisResult || repair.diagnosis) && (
                <>
                  <div className="divider-brass" style={{ margin: '20px 0' }}></div>
                  <div>
                    <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>检测结果</h4>
                    <div style={{ color: 'var(--color-text-primary)', padding: '12px', background: 'rgba(107, 142, 35, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-success)' }}>
                      {repair.diagnosisResult || repair.diagnosis}
                      {repair.estimatedCost != null && (
                        <div style={{ marginTop: '8px', color: 'var(--color-brass-light)', fontWeight: 'bold' }}>
                          预估费用：¥{repair.estimatedCost}
                        </div>
                      )}
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

              <TabPane key="timeline" title={`流程轨迹 (${repair.statusLogs?.length || 0})`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ color: 'var(--color-brass-light)', margin: 0 }}>工单流转记录</h4>
                  <Tag color={getStatusColor(repair.status)} size="large">
                    当前状态：{repair.status}
                  </Tag>
                </div>
                <FlowTimeline logs={repair.statusLogs || []} />
              </TabPane>

              <TabPane key="parts" title={`使用零件 (${repair.partsUsed.length})`}>
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

                {repair.partsUsed.length > 0 ? (
                  <Table
                    columns={partColumns}
                    data={repair.partsUsed}
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
                {beforePhotos.length > 0 && afterPhotos.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '16px' }}>维修前后对比</h4>
                    <ImageCompare
                      beforeImage={beforeImgUrl}
                      afterImage={afterImgUrl}
                      height={320}
                    />
                  </div>
                )}
                {(beforePhotos.length === 0 || afterPhotos.length === 0) && (
                  <div style={{ padding: '20px 0', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    {beforePhotos.length === 0 && <p>请上传维修前照片以启用对比功能</p>}
                    {afterPhotos.length === 0 && beforePhotos.length > 0 && <p>请上传维修后照片以启用对比功能</p>}
                  </div>
                )}

                <div style={{ marginTop: '24px' }}>
                  {renderPhotoGrid(beforePhotos, 'before')}
                </div>

                <div style={{ marginTop: '24px' }}>
                  {renderPhotoGrid(afterPhotos, 'after')}
                </div>
              </TabPane>

              {repair.status === '待取件' || repair.status === '已完成' ? (
                <TabPane key="settlement" title="取件结算">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <SettlementPanel
                      repair={repair}
                      settlement={settlement}
                      onGenerateSettlement={handleGenerateSettlement}
                      onPrint={handlePrintSettlement}
                      loading={loading}
                    />

                    {settlement && (
                      <PaymentPanel
                        settlement={settlement}
                        customer={customerData || null}
                        paymentRecords={paymentRecords}
                        onPay={handlePay}
                        loading={loading}
                      />
                    )}

                    {settlement && (
                      <PickupVoucherPanel
                        repair={repair}
                        settlement={settlement}
                        voucher={voucher}
                        customer={customerData || null}
                        onConfirmPickup={handleConfirmPickup}
                        onPrint={handlePrintVoucher}
                        loading={loading}
                      />
                    )}
                  </div>
                </TabPane>
              ) : null}
            </Tabs>
          </SteampunkCard>
        </div>
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
        title="变更状态"
        visible={statusModalVisible}
        onOk={handleStatusTransition}
        onCancel={() => { setStatusModalVisible(false); statusForm.resetFields(); }}
        okText="确认变更"
        cancelText="取消"
        style={{ width: 520 }}
      >
        <Alert
          type="info"
          style={{ marginBottom: '16px' }}
          content={`当前状态：${repair.status}。仅允许变更为以下状态：${allowedTransitions.join('、') || '无（终态）'}`}
        />
        {allowedTransitions.length === 0 ? (
          <Empty description="当前状态不可变更" style={{ padding: '20px 0' }} />
        ) : (
          <Form form={statusForm} layout="vertical">
            <FormItem
              field="targetStatus"
              label="目标状态"
              rules={[{ required: true, message: '请选择目标状态' }]}
            >
              <Radio.Group>
                {allowedTransitions.map((s) => (
                  <Radio key={s} value={s}>
                    <Tag color={getStatusColor(s)}>{s}</Tag>
                  </Radio>
                ))}
              </Radio.Group>
            </FormItem>

            <FormItem
              field="operator"
              label="操作人"
            >
              <Select placeholder="请选择操作人" allowClear>
                <Option value="张师傅">张师傅</Option>
                <Option value="李师傅">李师傅</Option>
                <Option value="王师傅">王师傅</Option>
                <Option value="前台小刘">前台小刘</Option>
              </Select>
            </FormItem>

            <FormItem
              field="remark"
              label="备注"
              rules={[{ required: true, message: '请填写状态变更备注' }]}
            >
              <Input.TextArea placeholder="请填写状态变更原因或备注" rows={3} maxLength={200} showWordLimit />
            </FormItem>

            <Form.Item noStyle shouldUpdate>
              {(values) => {
                if (values.targetStatus === '维修中' && repair.status === '检测中') {
                  return (
                    <>
                      <Alert
                        type="warning"
                        style={{ marginBottom: '12px' }}
                        content="检测中流转到维修中，必须填写诊断结果和预估费用"
                      />
                      <FormItem
                        field="diagnosisResult"
                        label="诊断结果"
                        rules={[{ required: true, message: '请填写诊断结果' }]}
                      >
                        <Input.TextArea placeholder="请填写详细的诊断结果" rows={3} maxLength={500} showWordLimit />
                      </FormItem>
                      <FormItem
                        field="estimatedCost"
                        label="预估费用 (¥)"
                        rules={[{ required: true, message: '请填写预估费用' }]}
                      >
                        <InputNumber
                          min={0}
                          precision={2}
                          placeholder="请填写预估费用"
                          style={{ width: '100%' }}
                        />
                      </FormItem>
                    </>
                  );
                }
                return null;
              }}
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="发送取件通知"
        visible={pickupNotifyModalVisible}
        onOk={handleSendPickupNotify}
        onCancel={() => { setPickupNotifyModalVisible(false); pickupForm.resetFields(); }}
        okText="发送通知"
        cancelText="取消"
      >
        <Alert
          type="info"
          style={{ marginBottom: '16px' }}
          content={`将通知客户 ${repair.customerName} 前来取件`}
        />
        <Form form={pickupForm} layout="vertical" initialValues={{ notifyMethod: '短信' }}>
          <FormItem
            field="notifyMethod"
            label="通知方式"
            rules={[{ required: true, message: '请选择通知方式' }]}
          >
            <Radio.Group>
              <Radio value="短信">短信</Radio>
              <Radio value="电话">电话</Radio>
              <Radio value="微信">微信</Radio>
              <Radio value="邮件">邮件</Radio>
            </Radio.Group>
          </FormItem>
          <FormItem
            field="message"
            label="附加消息"
          >
            <Input.TextArea
              placeholder="可选填附加消息，将随通知一并发送"
              rows={3}
              maxLength={200}
              showWordLimit
            />
          </FormItem>
        </Form>
      </Modal>

      <Modal
        title="照片预览"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        style={{ width: 'auto', maxWidth: '90vw' }}
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt="预览"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        )}
      </Modal>
    </>
  );
};

export default RepairDetail;
