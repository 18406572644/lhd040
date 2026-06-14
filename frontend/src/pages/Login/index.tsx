import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Message } from '@arco-design/web-react';
import { IconUser, IconLock, IconEyeInvisible, IconEye } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GearDecoration } from '@/components/GearDecoration';
import './style.css';

const FormItem = Form.Item;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        Message.success('登录成功，欢迎回来！');
        navigate('/dashboard');
      } else {
        Message.error('登录失败，请检查用户名和密码');
      }
    } catch (error) {
      Message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-decorations">
        <GearDecoration size={200} style={{ position: 'absolute', top: '5%', left: '5%', opacity: 0.08 }} />
        <GearDecoration size={150} reverse style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.06 }} />
        <GearDecoration size={120} style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.05 }} />
        <GearDecoration size={180} reverse style={{ position: 'absolute', bottom: '10%', right: '5%', opacity: 0.07 }} />
        <GearDecoration size={80} style={{ position: 'absolute', top: '40%', left: '8%', opacity: 0.06 }} />
        <GearDecoration size={60} reverse style={{ position: 'absolute', top: '60%', right: '12%', opacity: 0.08 }} />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="rivet rivet-tl"></div>
          <div className="rivet rivet-tr"></div>
          <div className="rivet rivet-bl"></div>
          <div className="rivet rivet-br"></div>

          <div className="login-header">
            <div className="login-logo">
              <span className="gear-icon">⚙</span>
            </div>
            <h1 className="login-title">匠心工坊</h1>
            <p className="login-subtitle">钟表维修管理系统</p>
            <div className="title-divider"></div>
          </div>

          <Form
            layout="vertical"
            className="login-form"
            onSubmit={handleSubmit}
            initialValues={{ username: 'admin', password: '123456', remember: true }}
          >
            <FormItem
              field="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<IconUser />}
                placeholder="请输入用户名"
                size="large"
                className="steampunk-input"
              />
            </FormItem>

            <FormItem
              field="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<IconLock />}
                placeholder="请输入密码"
                size="large"
                className="steampunk-input"
              />
            </FormItem>

            <FormItem field="remember">
              <Checkbox>记住我</Checkbox>
            </FormItem>

            <FormItem>
              <Button
                type="primary"
                htmlType="submit"
                long
                size="large"
                loading={loading}
                className="steampunk-btn"
              >
                登 录
              </Button>
            </FormItem>
          </Form>

          <div className="login-footer">
            <p className="tip-text">提示：任意用户名 + 3位以上密码即可登录</p>
            <div className="footer-decor">
              <span>⚙</span>
              <span>精工技艺 · 传承百年</span>
              <span>⚙</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
