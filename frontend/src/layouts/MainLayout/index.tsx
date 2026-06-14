import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Breadcrumb } from '@arco-design/web-react';
import {
  IconDashboard,
  IconUser,
  IconClockCircle,
  IconTool,
  IconStorage,
  IconNotification,
  IconUserGroup,
  IconSettings,
  IconPoweroff,
  IconMenuFold,
  IconMenuUnfold,
  IconEdit,
} from '@arco-design/web-react/icon';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GearDecoration } from '@/components/GearDecoration';
import './style.css';

const Sider = Layout.Sider;
const Header = Layout.Header;
const Content = Layout.Content;
const Footer = Layout.Footer;
const MenuItem = Menu.Item;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { key: '/dashboard', icon: <IconDashboard />, label: '仪表板' },
    { key: '/customers', icon: <IconUser />, label: '客户管理' },
    { key: '/clocks', icon: <IconClockCircle />, label: '钟表档案' },
    { key: '/repairs', icon: <IconTool />, label: '维修管理' },
    { key: '/settlements', icon: <IconEdit />, label: '结算单' },
    { key: '/parts', icon: <IconStorage />, label: '零件库存' },
    { key: '/maintenance', icon: <IconNotification />, label: '保养提醒' },
    { key: '/users', icon: <IconUserGroup />, label: '用户管理' },
  ];

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbItems = () => {
    const pathMap: Record<string, string> = {
      '/dashboard': '仪表板',
      '/customers': '客户管理',
      '/clocks': '钟表档案',
      '/repairs': '维修管理',
      '/settlements': '结算单',
      '/parts': '零件库存',
      '/maintenance': '保养提醒',
      '/users': '用户管理',
    };
    const items: { name: string; path?: string }[] = [{ name: '首页', path: '/dashboard' }];
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += '/' + segment;
      const name = pathMap[currentPath];
      if (name) {
        items.push({ name, path: index === pathSegments.length - 1 ? undefined : currentPath });
      } else if (segment !== 'dashboard') {
        items.push({ name: '详情' });
      }
    });

    return items;
  };

  const dropList = (
    <Menu onClickMenuItem={(key) => key === 'logout' && handleLogout()}>
      <Menu.Item key="profile">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconSettings />
          个人设置
        </span>
      </Menu.Item>
      <Menu.Item key="logout">
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconPoweroff />
          退出登录
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="main-layout">
      <Sider
        collapsed={collapsed}
        collapsible
        trigger={null}
        className="steampunk-sider"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        <GearDecoration
          size={60}
          reverse
          style={{ position: 'absolute', top: 10, right: -10, opacity: 0.15 }}
        />
        <div className="logo-container">
          <div className="logo-icon">⚙</div>
          {!collapsed && <span className="logo-text">匠心工坊</span>}
        </div>
        <div className="sider-divider" />
        <Menu
          selectedKeys={[location.pathname]}
          onClickMenuItem={handleMenuClick}
          style={{ width: '100%', marginTop: '16px' }}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.key}>
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
        <GearDecoration
          size={100}
          style={{ position: 'absolute', bottom: 20, left: -20, opacity: 0.08 }}
        />
      </Sider>
      <Layout>
        <Header className="steampunk-header">
          <Button
            type="text"
            icon={collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: 'var(--color-brass-light)', fontSize: '20px' }}
          />
          <Breadcrumb style={{ marginLeft: '20px' }}>
            {getBreadcrumbItems().map((item, index) => (
              <Breadcrumb.Item key={index}>
                {item.path ? <a onClick={() => navigate(item.path!)}>{item.name}</a> : item.name}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Dropdown droplist={dropList} position="br">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <Avatar size={36} style={{ background: 'var(--color-brass-dark)', color: 'var(--color-gray-dark)', fontWeight: 'bold', border: '2px solid var(--color-brass-light)' }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <div>
                  <div style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 500 }}>
                    {user?.name}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                    {user?.role === 'admin' ? '管理员' : user?.role === 'manager' ? '经理' : user?.role === 'technician' ? '技师' : '前台'}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="main-content">
          <Outlet />
        </Content>
        <Footer className="steampunk-footer">
          <span>匠心钟表维修管理系统 v1.0.0</span>
          <span style={{ color: 'var(--color-brass-dark)' }}>⚙</span>
          <span>© 2024 精工技艺，传承百年</span>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
