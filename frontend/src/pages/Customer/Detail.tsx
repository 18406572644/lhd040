import React from 'react';
import { Button, Tag, Tabs, Empty } from '@arco-design/web-react';
import {
  IconArrowLeft,
  IconPhone,
  IconEmail,
  IconLocation,
  IconClockCircle,
  IconTool,
} from '@arco-design/web-react/icon';
import { useParams, useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { mockCustomers, mockClocks, mockRepairRecords } from '@/mock/data';
import './style.css';

const TabPane = Tabs.TabPane;

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customer = mockCustomers.find((c) => c.id === id);
  const customerClocks = mockClocks.filter((c) => c.customerId === id);
  const customerRepairs = mockRepairRecords.filter((r) => r.customerId === id);

  if (!customer) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><Empty description="客户不存在" /></div>;
  }

  const getMemberColor = (level: string) => {
    const colors: Record<string, string> = {
      普通: 'gray',
      银卡: 'blue',
      金卡: 'gold',
      钻石: 'purple',
    };
    return colors[level] || 'gray';
  };

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
        <Button type="text" icon={<IconArrowLeft />} onClick={() => navigate('/customers')}>
          返回列表
        </Button>
      </div>

      <SteampunkCard>
        <div className="customer-info-header">
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-brass-light), var(--color-brass-dark))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gray-dark)',
              fontWeight: 'bold',
              fontSize: '32px',
              border: '3px solid var(--color-brass-gold)',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
            }}
          >
            {customer.name.charAt(0)}
          </div>
          <div style={{ flex: 1, marginLeft: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, color: 'var(--color-brass-light)', fontSize: '24px' }}>
                {customer.name}
              </h2>
              <Tag color={getMemberColor(customer.memberLevel)} size="large">
                {customer.memberLevel}会员
              </Tag>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '24px', color: 'var(--color-text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconPhone /> {customer.phone}
              </span>
              {customer.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconEmail /> {customer.email}
                </span>
              )}
              {customer.address && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconLocation /> {customer.address}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>累计消费</div>
            <div style={{ color: 'var(--color-brass-light)', fontSize: '28px', fontWeight: 'bold', fontFamily: 'var(--font-family-title)' }}>
              ¥{customer.totalAmount.toLocaleString()}
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {customer.totalRepairs} 次维修
            </div>
          </div>
        </div>

        {customer.notes && (
          <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(139, 69, 19, 0.1)', borderRadius: '8px', borderLeft: '3px solid var(--color-brass-dark)' }}>
            <span style={{ color: 'var(--color-brass-light)', fontWeight: 500 }}>备注：</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{customer.notes}</span>
          </div>
        )}
      </SteampunkCard>

      <div style={{ marginTop: '20px' }}>
        <SteampunkCard>
          <Tabs defaultActiveTab="clocks">
            <TabPane
              key="clocks"
              title={
                <span>
                  <IconClockCircle style={{ marginRight: '6px' }} />
                  钟表档案 ({customerClocks.length})
                </span>
              }
            >
              {customerClocks.length > 0 ? (
                <div className="detail-list">
                  {customerClocks.map((clock) => (
                    <div
                      key={clock.id}
                      className="detail-list-item"
                      onClick={() => navigate(`/clocks/${clock.id}`)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {clock.brand} {clock.model}
                          </span>
                          <Tag color={getStatusColor(clock.status)} size="small">
                            {clock.status}
                          </Tag>
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                          <span style={{ marginRight: '20px' }}>类型：{clock.type}</span>
                          <span style={{ marginRight: '20px' }}>编号：{clock.serialNumber}</span>
                          {clock.lastServiceDate && (
                            <span>上次保养：{clock.lastServiceDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无钟表档案" style={{ padding: '40px 0' }} />
              )}
            </TabPane>

            <TabPane
              key="repairs"
              title={
                <span>
                  <IconTool style={{ marginRight: '6px' }} />
                  维修记录 ({customerRepairs.length})
                </span>
              }
            >
              {customerRepairs.length > 0 ? (
                <div className="detail-list">
                  {customerRepairs.map((repair) => (
                    <div
                      key={repair.id}
                      className="detail-list-item"
                      onClick={() => navigate(`/repairs/${repair.id}`)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                            {repair.id}
                          </span>
                          <Tag color={getRepairStatusColor(repair.status)} size="small">
                            {repair.status}
                          </Tag>
                          <Tag size="small">{repair.type}</Tag>
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                          <span style={{ marginRight: '20px' }}>{repair.clockInfo}</span>
                          <span style={{ marginRight: '20px' }}>接件日期：{repair.receiveDate}</span>
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
          </Tabs>
        </SteampunkCard>
      </div>
    </div>
  );
};

export default CustomerDetail;
