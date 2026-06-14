import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Descriptions,
  Modal,
  Card,
  Empty,
  Message,
} from '@arco-design/web-react';
import {
  IconSearch,
  IconEye,
  IconRefresh,
  IconTool,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { useSettlementStore } from '@/store/settlementStore';
import { useRepairStore } from '@/store/repairStore';
import { mockCustomers } from '@/mock/data';
import { PAYMENT_METHOD_LABELS } from '@/types';
import type { Settlement, PaymentMethodType } from '@/types';

const Option = Select.Option;

const SettlementList: React.FC = () => {
  const navigate = useNavigate();
  const allSettlements = useSettlementStore((state) => state.allSettlements);
  const fetchAllSettlements = useSettlementStore((state) => state.fetchAllSettlements);
  const repairs = useRepairStore((state) => state.repairs);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [methodFilter, setMethodFilter] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchAllSettlements();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRepairInfo = (repairId: any) => {
    const rid = String(repairId);
    return repairs.find((r: any) => r.id === rid);
  };

  const getCustomerName = (customerId: any) => {
    const cid = String(customerId);
    const customer = mockCustomers.find((c) => c.id === cid);
    return customer?.name || '-';
  };

  const filteredSettlements = useMemo(() => {
    return allSettlements.filter((s: any) => {
      if (keyword) {
        const kw = keyword.toLowerCase();
        const settlementNo = (s.settlementNo || '').toLowerCase();
        const repairId = String(s.repairId || '');
        const customerName = getCustomerName(s.customerId).toLowerCase();
        if (
          !settlementNo.includes(kw) &&
          !repairId.includes(kw) &&
          !customerName.includes(kw)
        ) {
          return false;
        }
      }

      if (statusFilter && s.status !== statusFilter) {
        return false;
      }

      if (methodFilter && s.paymentMethod !== methodFilter) {
        return false;
      }

      return true;
    });
  }, [allSettlements, keyword, statusFilter, methodFilter, repairs]);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      '待支付': 'gold',
      '已支付': 'green',
      '已完成': 'green',
      '已取消': 'gray',
    };
    return colorMap[status] || 'gray';
  };

  const handleRefresh = () => {
    loadData();
    Message.success('刷新成功');
  };

  const handleViewDetail = (settlement: any) => {
    setSelectedSettlement(settlement);
    setDetailVisible(true);
  };

  const handleGoToRepair = (repairId: any) => {
    navigate(`/repairs/${repairId}`);
  };

  const columns = [
    {
      title: '结算单号',
      dataIndex: 'settlementNo',
      width: 200,
      render: (val: string, record: any) => (
        <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>
          {val || '-'}
        </span>
      ),
    },
    {
      title: '关联维修单',
      dataIndex: 'repairId',
      width: 120,
      render: (val: any, record: any) => (
        <Button
          type="text"
          size="small"
          icon={<IconTool />}
          onClick={() => handleGoToRepair(val)}
          style={{ color: 'var(--color-brass-light)' }}
        >
          #{val}
        </Button>
      ),
    },
    {
      title: '客户名称',
      dataIndex: 'customerId',
      width: 120,
      render: (val: any) => getCustomerName(val),
    },
    {
      title: '零件费用',
      dataIndex: 'partsCost',
      width: 110,
      align: 'right' as const,
      render: (val: number) => `¥${Number(val || 0).toFixed(2)}`,
    },
    {
      title: '人工费用',
      dataIndex: 'laborCost',
      width: 110,
      align: 'right' as const,
      render: (val: number) => `¥${Number(val || 0).toFixed(2)}`,
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 110,
      align: 'right' as const,
      render: (val: number) => `¥${Number(val || 0).toFixed(2)}`,
    },
    {
      title: '优惠金额',
      dataIndex: 'discount',
      width: 110,
      align: 'right' as const,
      render: (val: number) => val > 0 ? (
        <span style={{ color: 'var(--color-success)' }}>-¥{Number(val).toFixed(2)}</span>
      ) : '-',
    },
    {
      title: '应收金额',
      dataIndex: 'totalAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => (
        <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>
          ¥{Number(val || 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: '实付金额',
      dataIndex: 'paidAmount',
      width: 120,
      align: 'right' as const,
      render: (val: number) => `¥${Number(val || 0).toFixed(2)}`,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      width: 120,
      render: (val: any) => val ? PAYMENT_METHOD_LABELS[val as PaymentMethodType] : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (val: string) => (
        <Tag color={getStatusColor(val)}>{val || '-'}</Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      width: 100,
      render: (val: string) => val || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 170,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Button
          type="text"
          size="small"
          icon={<IconEye />}
          onClick={() => handleViewDetail(record)}
        >
          查看
        </Button>
      ),
    },
  ];

  const statistics = useMemo(() => {
    const total = filteredSettlements.length;
    const totalAmount = filteredSettlements.reduce((sum, s: any) => sum + Number(s.totalAmount || 0), 0);
    const paidAmount = filteredSettlements.reduce((sum, s: any) => sum + Number(s.paidAmount || 0), 0);
    const paidCount = filteredSettlements.filter((s: any) => s.status === '已支付' || s.status === '已完成').length;
    return { total, totalAmount, paidAmount, paidCount };
  }, [filteredSettlements]);

  return (
    <div style={{ padding: '20px', minHeight: '100%' }}>
      <SteampunkCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--color-brass-light)', margin: 0, fontFamily: 'var(--font-family-title)' }}>
            ⚙ 维修结算单管理
          </h2>
          <Button
            icon={<IconRefresh />}
            onClick={handleRefresh}
            style={{ borderColor: 'var(--color-brass-light)', color: 'var(--color-brass-light)' }}
          >
            刷新
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <Card
            className="steampunk-card"
            style={{ background: 'rgba(139, 69, 19, 0.1)', border: '1px solid var(--color-border)' }}
            bordered={false}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' }}>结算单总数</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-brass-light)', fontFamily: 'var(--font-family-title)' }}>
              {statistics.total}
            </div>
          </Card>
          <Card
            className="steampunk-card"
            style={{ background: 'rgba(107, 142, 35, 0.1)', border: '1px solid var(--color-border)' }}
            bordered={false}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' }}>已支付数</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-success)', fontFamily: 'var(--font-family-title)' }}>
              {statistics.paidCount}
            </div>
          </Card>
          <Card
            className="steampunk-card"
            style={{ background: 'rgba(218, 165, 32, 0.1)', border: '1px solid var(--color-border)' }}
            bordered={false}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' }}>应收总金额</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-warning)', fontFamily: 'var(--font-family-title)' }}>
              ¥{statistics.totalAmount.toFixed(2)}
            </div>
          </Card>
          <Card
            className="steampunk-card"
            style={{ background: 'rgba(30, 83, 115, 0.1)', border: '1px solid var(--color-border)' }}
            bordered={false}
          >
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' }}>实收总金额</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'rgb(var(--primary-6))', fontFamily: 'var(--font-family-title)' }}>
              ¥{statistics.paidAmount.toFixed(2)}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Space>
            <Input
              placeholder="搜索单号/维修单号/客户"
              prefix={<IconSearch />}
              value={keyword}
              onChange={setKeyword}
              style={{ width: 280 }}
              allowClear
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 140 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="待支付">待支付</Option>
              <Option value="已支付">已支付</Option>
              <Option value="已完成">已完成</Option>
            </Select>
            <Select
              placeholder="支付方式"
              allowClear
              style={{ width: 140 }}
              value={methodFilter}
              onChange={setMethodFilter}
            >
              <Option value="CASH">现金</Option>
              <Option value="WECHAT">微信</Option>
              <Option value="ALIPAY">支付宝</Option>
              <Option value="BANK_CARD">银行卡</Option>
              <Option value="MEMBER_BALANCE">会员余额</Option>
              <Option value="POINTS">积分抵现</Option>
            </Select>
          </Space>
          <div style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            共找到 <b style={{ color: 'var(--color-brass-light)' }}>{filteredSettlements.length}</b> 条记录
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredSettlements as any[]}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1800 }}
          pagination={{
            pageSize: 10,
            showTotal: true,
            sizeCanChange: true,
          }}
          noDataElement={<Empty description="暂无结算单数据" />}
          className="steampunk-table"
        />
      </SteampunkCard>

      <Modal
        title="结算单详情"
        visible={detailVisible}
        onOk={() => setDetailVisible(false)}
        onCancel={() => setDetailVisible(false)}
        okText="关闭"
        cancelText={null as any}
        style={{ width: 640 }}
        footer={null}
      >
        {selectedSettlement && (
          <div>
            <Descriptions
              column={2}
              title={
                <div style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>
                  结算单号：{selectedSettlement.settlementNo}
                </div>
              }
              data={[
                { label: '维修单号', value: `#${selectedSettlement.repairId}` },
                { label: '客户名称', value: getCustomerName(selectedSettlement.customerId) },
                { label: '状态', value: <Tag color={getStatusColor(selectedSettlement.status || '')}>{selectedSettlement.status}</Tag> },
                { label: '操作人', value: selectedSettlement.operator || '-' },
                { label: '零件费用', value: `¥${Number(selectedSettlement.partsCost || 0).toFixed(2)}` },
                { label: '人工费用', value: `¥${Number(selectedSettlement.laborCost || 0).toFixed(2)}` },
                { label: '小计', value: `¥${Number(selectedSettlement.subtotal || 0).toFixed(2)}` },
                { label: '优惠金额', value: selectedSettlement.discount > 0 ? `-¥${Number(selectedSettlement.discount).toFixed(2)}` : '无' },
                { label: '应收金额', value: <b style={{ color: 'var(--color-brass-light)' }}>¥{Number(selectedSettlement.totalAmount || 0).toFixed(2)}</b> },
                { label: '实付金额', value: `¥${Number(selectedSettlement.paidAmount || 0).toFixed(2)}` },
                { label: '支付方式', value: selectedSettlement.paymentMethod ? PAYMENT_METHOD_LABELS[selectedSettlement.paymentMethod as PaymentMethodType] : '-' },
                { label: '交易单号', value: selectedSettlement.transactionNo || '-' },
                { label: '创建时间', value: selectedSettlement.createTime || '-' },
                { label: '支付时间', value: selectedSettlement.paidTime || '-' },
              ]}
              style={{ marginTop: '16px' }}
            />
            {selectedSettlement.discountReason && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(107, 142, 35, 0.1)', borderRadius: '6px' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '4px' }}>优惠原因</div>
                <div>{selectedSettlement.discountReason}</div>
              </div>
            )}
            {selectedSettlement.remark && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-warning)' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '4px' }}>备注</div>
                <div>{selectedSettlement.remark}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SettlementList;
