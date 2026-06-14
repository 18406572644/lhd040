import React from 'react';
import { Tag, Button, Empty } from '@arco-design/web-react';
import {
  IconTool,
  IconUser,
  IconClockCircle,
  IconStorage,
  IconArrowRise,
  IconNotification,
  IconRight,
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { SteampunkCard } from '@/components/SteampunkCard';
import { Gauge } from '@/components/Gauge';
import { GearDecoration } from '@/components/GearDecoration';
import { mockDashboardStats, mockRepairRecords, mockReminders } from '@/mock/data';
import './style.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = mockDashboardStats;
  const pendingRepairs = mockRepairRecords.filter((r) => ['待接收', '检测中', '维修中'].includes(r.status));
  const pendingReminders = mockReminders.filter((r) => r.status === '待发送').slice(0, 5);

  const statCards = [
    {
      title: '总维修订单',
      value: stats.totalRepairs,
      icon: <IconTool />,
      color: 'var(--color-brass-light)',
      suffix: '单',
    },
    {
      title: '客户总数',
      value: stats.totalCustomers,
      icon: <IconUser />,
      color: 'var(--color-leather-light)',
      suffix: '位',
    },
    {
      title: '钟表档案',
      value: stats.totalClocks,
      icon: <IconClockCircle />,
      color: '#6B8E23',
      suffix: '只',
    },
    {
      title: '库存告警',
      value: stats.lowStockParts,
      icon: <IconStorage />,
      color: '#CD5C5C',
      suffix: '项',
    },
  ];

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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h2 className="page-title">欢迎回来，技师！</h2>
          <p className="page-subtitle">今天是工作日，共有 {pendingRepairs.length} 个维修任务待处理</p>
        </div>
        <Button
          type="primary"
          className="steampunk-btn"
          icon={<IconTool />}
          onClick={() => navigate('/repairs/new')}
        >
          新建维修单
        </Button>
      </div>

      <div className="dashboard-row" style={{ marginBottom: '24px' }}>
        {statCards.map((card, index) => (
          <div className="dashboard-col-4" key={index}>
            <SteampunkCard>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: card.color + '20', color: card.color }}>
                  {card.icon}
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: card.color }}>
                    {card.value} <span className="stat-unit">{card.suffix}</span>
                  </div>
                  <div className="stat-label">{card.title}</div>
                </div>
              </div>
            </SteampunkCard>
          </div>
        ))}
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col-16">
          <SteampunkCard
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconTool style={{ color: 'var(--color-brass-light)' }} />
                待处理维修
              </div>
            }
            extra={
              <Button type="text" size="small" icon={<IconRight />} onClick={() => navigate('/repairs')}>
                查看全部
              </Button>
            }
          >
            {pendingRepairs.length > 0 ? (
              <div className="repair-list">
                {pendingRepairs.map((item) => (
                  <div
                    key={item.id}
                    className="repair-list-item"
                    onClick={() => navigate(`/repairs/${item.id}`)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                          {item.clockInfo}
                        </span>
                        <Tag color={getStatusColor(item.status)} size="small">{item.status}</Tag>
                        <Tag color={getPriorityColor(item.priority)} size="small">{item.priority}优先级</Tag>
                      </div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        <span style={{ marginRight: '16px' }}>单号：{item.id}</span>
                        <span style={{ marginRight: '16px' }}>客户：{item.customerName}</span>
                        <span>接件日期：{item.receiveDate}</span>
                      </div>
                    </div>
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {item.type}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无待处理维修" />
            )}
          </SteampunkCard>
        </div>

        <div className="dashboard-col-8">
          <div className="dashboard-col">
            <div className="dashboard-col-24" style={{ marginBottom: '16px' }}>
              <SteampunkCard
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconArrowRise style={{ color: 'var(--color-brass-light)' }} />
                    本月业绩
                  </div>
                }
              >
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div className="revenue-value">
                    ¥{stats.monthRevenue.toLocaleString()}
                  </div>
                  <div className="revenue-label">本月营收</div>
                  <div style={{ marginTop: '16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    累计营收：<span style={{ color: 'var(--color-brass-dark)' }}>¥{stats.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </SteampunkCard>
            </div>
            <div className="dashboard-col-24">
              <SteampunkCard
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconNotification style={{ color: 'var(--color-brass-light)' }} />
                    保养提醒
                  </div>
                }
                extra={
                  <Button type="text" size="small" icon={<IconRight />} onClick={() => navigate('/maintenance')}>
                    查看全部
                  </Button>
                }
              >
                {pendingReminders.length > 0 ? (
                  <div className="reminder-list">
                    {pendingReminders.map((item) => (
                      <div
                        key={item.id}
                        className="reminder-list-item"
                        onClick={() => navigate('/maintenance')}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>
                            {item.clockInfo}
                          </div>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                            {item.customerName} · {item.dueDate}到期
                          </div>
                        </div>
                        <Tag color="red" size="small">待提醒</Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无待发送提醒" style={{ padding: '20px 0' }} />
                )}
              </SteampunkCard>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row" style={{ marginTop: '24px' }}>
        <div className="dashboard-col-3">
          <SteampunkCard title="维修完成率">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Gauge
                value={Math.round((stats.completedRepairs / stats.totalRepairs) * 100)}
                max={100}
                label="完成率 %"
                size={160}
              />
            </div>
          </SteampunkCard>
        </div>
        <div className="dashboard-col-3">
          <SteampunkCard title="客户增长">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Gauge
                value={stats.totalCustomers}
                max={200}
                label="客户数"
                size={160}
                color="#6B8E23"
              />
            </div>
          </SteampunkCard>
        </div>
        <div className="dashboard-col-3">
          <SteampunkCard title="库存健康度">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
              <Gauge
                value={Math.max(0, 100 - stats.lowStockParts * 10)}
                max={100}
                label="健康度 %"
                size={160}
                color="#DAA520"
              />
            </div>
          </SteampunkCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
