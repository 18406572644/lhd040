import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import MainLayout from '@/layouts/MainLayout';
import { Spin } from '@arco-design/web-react';

const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const CustomerList = lazy(() => import('@/pages/Customer/List'));
const CustomerDetail = lazy(() => import('@/pages/Customer/Detail'));
const ClockList = lazy(() => import('@/pages/Clock/List'));
const ClockDetail = lazy(() => import('@/pages/Clock/Detail'));
const RepairList = lazy(() => import('@/pages/Repair/List'));
const RepairDetail = lazy(() => import('@/pages/Repair/Detail'));
const RepairCreate = lazy(() => import('@/pages/Repair/Create'));
const PartInventory = lazy(() => import('@/pages/Parts/Inventory'));
const PartTransactions = lazy(() => import('@/pages/Parts/Transactions'));
const MaintenanceReminders = lazy(() => import('@/pages/Maintenance/Reminders'));
const UserManagement = lazy(() => import('@/pages/Users/Management'));
const SettlementList = lazy(() => import('@/pages/Settlement/List'));

const loadingFallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size={40} dot />
  </div>
);

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={loadingFallback}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="clocks" element={<ClockList />} />
            <Route path="clocks/:id" element={<ClockDetail />} />
            <Route path="repairs" element={<RepairList />} />
            <Route path="repairs/new" element={<RepairCreate />} />
            <Route path="repairs/:id" element={<RepairDetail />} />
            <Route path="parts" element={<PartInventory />} />
            <Route path="parts/transactions" element={<PartTransactions />} />
            <Route path="maintenance" element={<MaintenanceReminders />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settlements" element={<SettlementList />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
