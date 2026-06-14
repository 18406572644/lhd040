import React, { useState, useMemo } from 'react';
import {
  Button,
  Descriptions,
  Table,
  Form,
  InputNumber,
  Input,
  Select,
  Modal,
  Message,
  Space,
  Tag,
} from '@arco-design/web-react';
import { IconPrinter, IconPlus, IconEdit } from '@arco-design/web-react/icon';
import { SteampunkCard } from '@/components/SteampunkCard';
import type { RepairRecord, RepairPart, Settlement, PaymentMethodType } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/types';

const FormItem = Form.Item;
const Option = Select.Option;

interface SettlementPanelProps {
  repair: RepairRecord;
  settlement: Settlement | null;
  onGenerateSettlement: (discount?: number, discountReason?: string) => Promise<Settlement>;
  onPrint: () => void;
  loading?: boolean;
}

export const SettlementPanel: React.FC<SettlementPanelProps> = ({
  repair,
  settlement,
  onGenerateSettlement,
  onPrint,
  loading,
}) => {
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [form] = Form.useForm();

  const totalPartsCost = useMemo(
    () => repair.partsUsed.reduce((sum, p) => sum + p.totalPrice, 0),
    [repair.partsUsed]
  );

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
  ];

  const handleGenerate = async () => {
    try {
      const values = await form.validate();
      await onGenerateSettlement(values.discount, values.discountReason);
      setGenerateModalVisible(false);
      form.resetFields();
      Message.success('结算单生成成功');
    } catch (err: any) {
      if (err?.message) {
        Message.error(err.message);
      }
    }
  };

  return (
    <SteampunkCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--color-brass-light)', margin: 0 }}>
          维修结算单
        </h3>
        <Space>
          {!settlement && (
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={() => setGenerateModalVisible(true)}
              loading={loading}
              className="steampunk-btn"
            >
              生成结算单
            </Button>
          )}
          {settlement && (
            <Button
              icon={<IconPrinter />}
              onClick={onPrint}
              style={{ borderColor: 'var(--color-brass-light)', color: 'var(--color-brass-light)' }}
            >
              打印结算单
            </Button>
          )}
        </Space>
      </div>

      {!settlement ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <IconEdit style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }} />
          <p>点击上方按钮生成结算单</p>
        </div>
      ) : (
        <div className="settlement-print-area">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'var(--color-brass-light)', margin: 0, fontFamily: 'var(--font-family-title)' }}>
              钟表维修结算单
            </h2>
            <div style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              单号：{settlement.settlementNo}
            </div>
          </div>

          <Descriptions
            column={2}
            data={[
              { label: '客户名称', value: repair.customerName },
              { label: '维修单号', value: repair.id },
              { label: '维修类型', value: repair.type },
              { label: '技师', value: repair.technician || '-' },
              { label: '接件日期', value: repair.receiveDate },
              { label: '结算日期', value: settlement.createTime },
            ]}
            style={{ marginBottom: '20px' }}
          />

          <div className="divider-brass" style={{ margin: '16px 0' }}></div>

          <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>维修费用明细</h4>

          <Descriptions
            column={1}
            data={[
              {
                label: '故障描述',
                value: repair.description,
              },
            ]}
            style={{ marginBottom: '16px' }}
          />

          {repair.partsUsed.length > 0 && (
            <>
              <h4 style={{ color: 'var(--color-brass-light)', marginBottom: '12px' }}>零件明细</h4>
              <Table
                columns={partColumns}
                data={repair.partsUsed}
                pagination={false}
                rowKey="id"
                size="small"
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          <div className="divider-brass" style={{ margin: '16px 0' }}></div>

          <div style={{ padding: '20px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>零件费用：</span>
              <span>¥{totalPartsCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>人工费用：</span>
              <span>¥{repair.laborCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>小计：</span>
              <span>¥{(totalPartsCost + repair.laborCost).toFixed(2)}</span>
            </div>
            {settlement.discount > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>优惠：</span>
                  <span style={{ color: 'var(--color-success)' }}>-¥{settlement.discount.toFixed(2)}</span>
                </div>
                {settlement.discountReason && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>优惠原因：</span>
                    <span>{settlement.discountReason}</span>
                  </div>
                )}
              </>
            )}
            <div className="divider-brass" style={{ margin: '12px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 500 }}>应收金额：</span>
              <span
                style={{
                  color: 'var(--color-brass-light)',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-family-title)',
                }}
              >
                ¥{settlement.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Tag color={settlement.status === '已支付' ? 'green' : 'gold'} size="large">
                {settlement.status}
              </Tag>
              {settlement.paymentMethod && (
                <Tag color="blue" style={{ marginLeft: '8px' }}>
                  支付方式：{PAYMENT_METHOD_LABELS[settlement.paymentMethod as PaymentMethodType]}
                </Tag>
              )}
            </div>
            {settlement.status === '已支付' && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                支付时间：{settlement.paidTime}
              </div>
            )}
          </div>

          {settlement.remark && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(218, 165, 32, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-warning)' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '4px' }}>备注</div>
              <div style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>{settlement.remark}</div>
            </div>
          )}
        </div>
      )}

      <Modal
        title="生成结算单"
        visible={generateModalVisible}
        onOk={handleGenerate}
        onCancel={() => { setGenerateModalVisible(false); form.resetFields(); }}
        okText="生成"
        cancelText="取消"
        style={{ width: 480 }}
      >
        <Form form={form} layout="vertical">
          <FormItem field="discount" label="优惠金额 (¥)">
            <InputNumber
              min={0}
              precision={2}
              defaultValue={0}
              placeholder="请输入优惠金额"
              style={{ width: '100%' }}
            />
          </FormItem>
          <FormItem field="discountReason" label="优惠原因">
            <Input.TextArea
              placeholder="请输入优惠原因"
              rows={2}
              maxLength={200}
              showWordLimit
            />
          </FormItem>
          <div style={{ padding: '12px', background: 'rgba(107, 142, 35, 0.1)', borderRadius: '6px' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '4px' }}>费用预览</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>零件费用 + 人工费用：</span>
              <span>¥{(totalPartsCost + repair.laborCost).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-brass-light)', fontWeight: 500, marginTop: '4px' }}>
              <span>应收金额：</span>
              <span>¥{(totalPartsCost + repair.laborCost).toFixed(2)}</span>
            </div>
          </div>
        </Form>
      </Modal>
    </SteampunkCard>
  );
};

export default SettlementPanel;
