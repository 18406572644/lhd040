import React from 'react';
import { Button, Tag, Tabs, Empty, Descriptions } from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconTool,
  IconCalendar,
  IconUser,
} from '@arco-design/web-react/icon';
import { useParams, useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockClocks, mockRepairRecords, mockCustomers } from '@/mock/data';
import '../Customer/style.css';

const TabPane = Tabs.TabPane;

const ClockDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clock = mockClocks.find((c) => c.id === id);
  const customer = mockCustomers.find((c) => c.id === clock?.customerId);
  const clockRepairs = mockRepairRecords.filter((r) => r.clockId === id);

  if (!clock) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><Empty description="钟表档案不存在" /></div>;
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      正常: 'green',
      维修中: 'orange',
      待保养: 'gold',
      已报废: 'gray',
    };
    return colorMap[status] || 'gray';
  };

  const getRepairStatusColor = (status: string) => {
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

  return (
    <div className="page-container">
      <div className="detail-header">
        <Button type="text" icon={<IconArrowLeft />} onClick={() => navigate('/clocks')}>
          返回列表
        </Button>
      </div>

      <SteampunkCard>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary))',
              border: '2px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            ⌚
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, color: 'var(--color-brass-light)', fontSize: '22px' }}>
                {clock.brand} {clock.model}
              </h2>
              <Tag color={getStatusColor(clock.status)} size="large">
                {clock.status}
              </Tag>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>类型</span>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '2px' }}>{clock.type}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>序列号</span>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '2px' }}>{clock.serialNumber}</div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  <IconCalendar style={{ marginRight: '4px' }} />购买日期
                </span>
                <div style={{ color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  {clock.purchaseDate || '-'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  <IconUser style={{ marginRight: '4px' }} />客户
                </span>
                <div
                  style={{ color: 'var(--color-brass-dark)', marginTop: '2px', cursor: 'pointer' }}
                  onClick={() => navigate(`/customers/${clock.customerId}`)}
                >
                  {customer?.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {clock.description && (
          <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--color-brass-dark)' }}>
            <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>描述：</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{clock.description}</span>
          </div>
        )}
      </SteampunkCard>

      <div style={{ marginTop: '20px' }}>
        <SteampunkCard>
          <Tabs defaultActiveTab="repairs">
            <TabPane
              key="repairs"
              title={
                <span>
                  <IconTool style={{ marginRight: '6px' }} />
                  维修记录 ({clockRepairs.length})
                </span>
              }
            >
              {clockRepairs.length > 0 ? (
                <div className="detail-list">
                  {clockRepairs.map((repair) => (
                    <div
                      key={repair.id}
                      className="detail-list-item"
                      onClick={() => navigate(`/repairs/${repair.id}`)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {repair.id} - {repair.type}
                          </span>
                          <Tag color={getRepairStatusColor(repair.status)} size="small">
                            {repair.status}
                          </Tag>
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                          <span style={{ marginRight: '20px' }}>接件日期：{repair.receiveDate}</span>
                          {repair.technician && (
                            <span style={{ marginRight: '20px' }}>技师：{repair.technician}</span>
                          )}
                          {repair.totalCost > 0 && (
                            <span style={{ color: 'var(--color-brass-light)' }}>
                              费用：¥{repair.totalCost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无维修记录" style={{ padding: '40px 0' }} />
              )}
            </TabPane>

            <TabPane key="info" title="详细信息">
              <Descriptions
                column={2}
                data={[
                  { label: '品牌', value: clock.brand },
                  { label: '型号', value: clock.model },
                  { label: '类型', value: clock.type },
                  { label: '序列号', value: clock.serialNumber },
                  { label: '状态', value: <Tag color={getStatusColor(clock.status)}>{clock.status}</Tag> },
                  { label: '购买日期', value: clock.purchaseDate || '-' },
                  { label: '上次保养', value: clock.lastServiceDate || '-' },
                  { label: '下次保养', value: clock.nextMaintenanceDate || '-' },
                  { label: '建档时间', value: clock.createdAt },
                ]}
              />
            </TabPane>
          </Tabs>
        </SteampunkCard>
      </div>
    </div>
  );
};

export default ClockDetail;
