import React, { useState } from 'react';
import {
  Button,
  Modal,
  Message,
  Checkbox,
  Space,
  Tag,
  Descriptions,
} from '@arco-design/web-react';
import {
  IconPrinter,
  IconQrcode,
  IconUser,
  IconClockCircle,
  IconCheckCircle,
} from '@arco-design/web-react/icon';
import { QRCodeSVG } from 'qrcode.react';
import { SteampunkCard } from '@/components/SteampunkCard';
import { SignaturePad } from '@/components/SignaturePad';
import type { PickupVoucher, Settlement, RepairRecord, Customer } from '@/types';

interface PickupVoucherPanelProps {
  repair: RepairRecord;
  settlement: Settlement | null;
  voucher: PickupVoucher | null;
  customer: Customer | null;
  onConfirmPickup: (signature?: string, manualConfirm?: boolean) => Promise<PickupVoucher>;
  onPrint: () => void;
  loading?: boolean;
}

export const PickupVoucherPanel: React.FC<PickupVoucherPanelProps> = ({
  repair,
  settlement,
  voucher,
  customer,
  onConfirmPickup,
  onPrint,
  loading,
}) => {
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [manualConfirm, setManualConfirm] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const canConfirm = settlement?.status === '已支付' && !voucher;

  const handleSignatureConfirm = (sig: string) => {
    setSignature(sig);
    setSignatureModalVisible(false);
    Message.success('签名成功');
  };

  const handleConfirmPickup = async () => {
    if (!signature && !manualConfirm) {
      Message.warning('请先签名确认或勾选手动确认');
      return;
    }
    try {
      await onConfirmPickup(signature || undefined, manualConfirm);
      setConfirmModalVisible(false);
      setSignature(null);
      setManualConfirm(false);
      Message.success('取件确认成功');
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
          取件凭证
        </h3>
        <Space>
          {canConfirm && (
            <Button
              type="primary"
              icon={<IconCheckCircle />}
              onClick={() => setConfirmModalVisible(true)}
              loading={loading}
              className="steampunk-btn"
            >
              确认取件
            </Button>
          )}
          {voucher && (
            <Button
              icon={<IconPrinter />}
              onClick={onPrint}
              style={{ borderColor: 'var(--color-brass-light)', color: 'var(--color-brass-light)' }}
            >
              打印凭证
            </Button>
          )}
        </Space>
      </div>

      {!settlement ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <IconQrcode style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }} />
          <p>请先生成结算单并完成支付</p>
        </div>
      ) : settlement.status !== '已支付' ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <IconQrcode style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }} />
          <p>请先完成支付后再取件</p>
        </div>
      ) : !voucher ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <IconQrcode style={{ fontSize: 48, opacity: 0.3, marginBottom: 12 }} />
          <p>点击上方按钮确认取件</p>
        </div>
      ) : (
        <div className="voucher-print-area">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--color-brass-light)', margin: 0, fontFamily: 'var(--font-family-title)' }}>
              钟表维修取件凭证
            </h2>
            <div style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              凭证号：{voucher.voucherNo}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Descriptions
                column={1}
                data={[
                  {
                    label: (
                      <span><IconUser style={{ marginRight: '6px' }} />客户信息</span>
                    ),
                    value: (
                      <div>
                        <div>{voucher.customerName}</div>
                        {customer && <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '4px' }}>{(customer as any).phone}</div>}
                      </div>
                    ),
                  },
                  {
                    label: (
                      <span><IconClockCircle style={{ marginRight: '6px' }} />钟表信息</span>
                    ),
                    value: voucher.watchInfo,
                  },
                  { label: '维修单号', value: repair.id },
                  { label: '维修类型', value: repair.type },
                  { label: '结算单号', value: settlement.settlementNo },
                  { label: '应收金额', value: `¥${settlement.totalAmount.toFixed(2)}` },
                  { label: '实付金额', value: <span style={{ color: 'var(--color-success)' }}>¥{settlement.paidAmount.toFixed(2)}</span> },
                  { label: '取件时间', value: voucher.pickupTime },
                  { label: '操作人', value: voucher.operator || '-' },
                ]}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  padding: '16px',
                  background: '#fff',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <QRCodeSVG
                  value={voucher.qrCodeData}
                  size={160}
                  level="M"
                  includeMargin
                />
              </div>
              <div style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                扫码验证取件
              </div>
            </div>
          </div>

          <div className="divider-brass" style={{ margin: '20px 0' }}></div>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' }}>
                客户签字确认
              </div>
              {voucher.customerSignature ? (
                <div
                  style={{
                    width: '300px',
                    height: '100px',
                    border: '1px dashed var(--color-border)',
                    borderRadius: '4px',
                    background: '#fffdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={voucher.customerSignature}
                    alt="客户签名"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: '300px',
                    height: '100px',
                    border: '1px dashed var(--color-border)',
                    borderRadius: '4px',
                    background: '#fffdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                  }}
                >
                  手动确认取件
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <Tag color="green" size="large">
                <IconCheckCircle style={{ marginRight: '4px' }} />
                已取件
              </Tag>
              <div style={{ marginTop: '8px', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                开具时间：{voucher.createTime}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(107, 142, 35, 0.1)', borderRadius: '6px', borderLeft: '3px solid var(--color-success)' }}>
            <div style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>
              温馨提示：请妥善保管此凭证，如有问题请凭此证联系我们。感谢您的信任与支持！
            </div>
          </div>
        </div>
      )}

      <Modal
        title="确认取件"
        visible={confirmModalVisible}
        onOk={handleConfirmPickup}
        onCancel={() => { setConfirmModalVisible(false); setSignature(null); setManualConfirm(false); }}
        okText="确认取件"
        cancelText="取消"
        style={{ width: 520 }}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '12px' }}>
            请客户确认以下信息并签字：
          </div>
          <div style={{ padding: '12px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>客户：</span>
              <span>{repair.customerName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>维修单号：</span>
              <span>{repair.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>应付金额：</span>
              <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>¥{settlement?.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '8px' }}>
            客户签名：
          </div>
          {signature ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '200px',
                  height: '80px',
                  border: '1px dashed var(--color-border)',
                  borderRadius: '4px',
                  background: '#fffdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={signature}
                  alt="签名"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <Button size="small" onClick={() => setSignatureModalVisible(true)}>
                重新签名
              </Button>
            </div>
          ) : (
            <Button
              type="outline"
              icon={<IconQrcode />}
              onClick={() => setSignatureModalVisible(true)}
              style={{ borderColor: 'var(--color-brass-light)', color: 'var(--color-brass-light)' }}
            >
              点击签名
            </Button>
          )}
        </div>

        <div>
          <Checkbox checked={manualConfirm} onChange={setManualConfirm}>
            客户无法签名，手动确认取件
          </Checkbox>
        </div>
      </Modal>

      <Modal
        title="电子签名"
        visible={signatureModalVisible}
        footer={null}
        onCancel={() => setSignatureModalVisible(false)}
        style={{ width: 460 }}
        maskClosable={false}
      >
        <SignaturePad
          onConfirm={handleSignatureConfirm}
          onCancel={() => setSignatureModalVisible(false)}
          width={400}
          height={200}
        />
      </Modal>
    </SteampunkCard>
  );
};

export default PickupVoucherPanel;
