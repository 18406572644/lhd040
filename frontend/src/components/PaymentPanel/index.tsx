import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Modal,
  Message,
  Space,
  Table,
  Tag,
  Alert,
} from '@arco-design/web-react';
import {
  IconGift,
  IconWechat,
  IconRight,
  IconEdit,
  IconPlus,
  IconUser,
  IconCheck,
} from '@arco-design/web-react/icon';
import { SteampunkCard } from '@/components/SteampunkCard';
import type { Settlement, PaymentRecord, PaymentMethodType, Customer } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

interface PaymentPanelProps {
  settlement: Settlement;
  customer: Customer | null;
  paymentRecords: PaymentRecord[];
  onPay: (method: PaymentMethodType, amount: number, transactionNo?: string, remark?: string) => Promise<any>;
  loading?: boolean;
}

const PAYMENT_METHODS: Array<{
  value: PaymentMethodType;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  { value: 'CASH', label: '现金', icon: <IconEdit />, description: '现金支付' },
  { value: 'WECHAT', label: '微信', icon: <IconWechat style={{ color: '#07c160' }} />, description: '微信扫码支付' },
  { value: 'ALIPAY', label: '支付宝', icon: <IconPlus style={{ color: '#1677ff' }} />, description: '支付宝扫码支付' },
  { value: 'BANK_CARD', label: '银行卡', icon: <IconCheck />, description: '刷卡支付' },
  { value: 'MEMBER_BALANCE', label: '会员余额', icon: <IconUser />, description: '使用会员储值余额' },
  { value: 'POINTS', label: '积分抵现', icon: <IconGift />, description: '使用会员积分抵扣' },
];

export const PaymentPanel: React.FC<PaymentPanelProps> = ({
  settlement,
  customer,
  paymentRecords,
  onPay,
  loading,
}) => {
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('CASH');

  const remainingAmount = settlement.totalAmount - settlement.paidAmount;
  const isPaid = settlement.status === '已支付';

  const paymentColumns = [
    {
      title: '支付单号',
      dataIndex: 'paymentNo',
      width: 180,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      width: 100,
      render: (method: PaymentMethodType) => PAYMENT_METHOD_LABELS[method],
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      render: (amount: number) => (
        <span style={{ color: 'var(--color-brass-light)' }}>¥{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '交易单号',
      dataIndex: 'transactionNo',
      width: 160,
      render: (no?: string) => no || '-',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      width: 100,
      render: (op?: string) => op || '-',
    },
    {
      title: '支付时间',
      dataIndex: 'paidTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (r?: string) => r || '-',
    },
  ];

  const handlePay = async () => {
    try {
      const values = await form.validate();
      await onPay(
        selectedMethod,
        values.amount,
        values.transactionNo,
        values.remark
      );
      setPayModalVisible(false);
      form.resetFields();
      Message.success('支付成功');
    } catch (err: any) {
      if (err?.message) {
        Message.error(err.message);
      }
    }
  };

  const getMemberInfo = () => {
    if (!customer) return null;
    const balance = (customer as any).memberBalance ?? 0;
    const points = (customer as any).memberPoints ?? 0;
    return (
      <div style={{ padding: '12px', background: 'rgba(107, 142, 35, 0.1)', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>会员余额：</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>¥{Number(balance).toFixed(2)}</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>会员积分：</span>
            <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>{points} 分</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginLeft: '4px' }}>(100积分=1元)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <SteampunkCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--color-brass-light)', margin: 0 }}>
          支付结算
        </h3>
        {!isPaid && (
          <Button
            type="primary"
            icon={<IconRight />}
            onClick={() => setPayModalVisible(true)}
            loading={loading}
            className="steampunk-btn"
          >
            确认收款
          </Button>
        )}
      </div>

      {getMemberInfo()}

      <div style={{ padding: '20px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>应收金额：</span>
          <span style={{ fontSize: '16px' }}>¥{settlement.totalAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>已付金额：</span>
          <span style={{ color: 'var(--color-success)', fontSize: '16px' }}>¥{settlement.paidAmount.toFixed(2)}</span>
        </div>
        <div className="divider-brass" style={{ margin: '12px 0' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 500 }}>待付金额：</span>
          <span
            style={{
              color: isPaid ? 'var(--color-success)' : 'var(--color-brass-light)',
              fontSize: '28px',
              fontWeight: 'bold',
              fontFamily: 'var(--font-family-title)',
            }}
          >
            {isPaid ? '已付清' : `¥${remainingAmount.toFixed(2)}`}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ color: 'var(--color-brass-light)', margin: 0 }}>支付记录</h4>
        <Tag color={isPaid ? 'green' : 'gold'} size="large">
          {settlement.status}
        </Tag>
      </div>

      {paymentRecords.length > 0 ? (
        <Table
          columns={paymentColumns}
          data={paymentRecords}
          pagination={false}
          rowKey="id"
          size="small"
        />
      ) : (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          暂无支付记录
        </div>
      )}

      <Modal
        title="确认收款"
        visible={payModalVisible}
        onOk={handlePay}
        onCancel={() => { setPayModalVisible(false); form.resetFields(); }}
        okText="确认支付"
        cancelText="取消"
        style={{ width: 560 }}
      >
        {getMemberInfo()}

        <Alert
          type="info"
          style={{ marginBottom: '16px' }}
          content={`应收金额：¥${settlement.totalAmount.toFixed(2)}，已付：¥${settlement.paidAmount.toFixed(2)}，待付：¥${remainingAmount.toFixed(2)}`}
        />

        <Form form={form} layout="vertical" initialValues={{ amount: remainingAmount }}>
          <FormItem
            label="支付方式"
            required
          >
            <RadioGroup
              value={selectedMethod}
              onChange={setSelectedMethod}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {PAYMENT_METHODS.map((method) => (
                  <Radio
                    key={method.value}
                    value={method.value}
                    style={{
                      width: '100%',
                      padding: '12px',
                      margin: 0,
                      border: selectedMethod === method.value
                        ? '2px solid var(--color-brass-light)'
                        : '1px solid var(--color-border)',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{method.icon}</span>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {method.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                          {method.description}
                        </div>
                      </div>
                    </div>
                  </Radio>
                ))}
              </Space>
            </RadioGroup>
          </FormItem>

          <FormItem
            field="amount"
            label="支付金额 (¥)"
            rules={[
              { required: true, message: '请输入支付金额' },
              {
                validator: (value: any, callback: (error?: any) => void) => {
                  const num = Number(value);
                  if (num <= 0) {
                    callback('支付金额必须大于0');
                    return;
                  }
                  if (num > remainingAmount) {
                    callback(`支付金额不能超过待付金额：¥${remainingAmount.toFixed(2)}`);
                    return;
                  }
                  if (selectedMethod === 'POINTS') {
                    const pointsNeeded = num * 100;
                    const customerPoints = (customer as any)?.memberPoints ?? 0;
                    if (customerPoints < pointsNeeded) {
                      callback(`积分不足，需要${pointsNeeded}积分，当前${customerPoints}积分`);
                      return;
                    }
                  }
                  if (selectedMethod === 'MEMBER_BALANCE') {
                    const balance = (customer as any)?.memberBalance ?? 0;
                    if (balance < num) {
                      callback(`余额不足，需要¥${num.toFixed(2)}，当前余额¥${Number(balance).toFixed(2)}`);
                      return;
                    }
                  }
                  callback();
                },
              },
            ]}
          >
            <InputNumber
              min={0.01}
              max={remainingAmount}
              precision={2}
              step={0.01}
              placeholder="请输入支付金额"
              style={{ width: '100%' }}
            />
          </FormItem>

          <FormItem field="transactionNo" label="交易单号">
            <Input placeholder="请输入交易单号（选填）" maxLength={100} />
          </FormItem>

          <FormItem field="operator" label="操作人">
            <Select placeholder="请选择操作人" allowClear>
              <Option value="前台小刘">前台小刘</Option>
              <Option value="张师傅">张师傅</Option>
              <Option value="李师傅">李师傅</Option>
            </Select>
          </FormItem>

          <FormItem field="remark" label="备注">
            <Input.TextArea placeholder="请输入备注（选填）" rows={2} maxLength={200} showWordLimit />
          </FormItem>
        </Form>
      </Modal>
    </SteampunkCard>
  );
};

export default PaymentPanel;
