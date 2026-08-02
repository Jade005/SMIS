import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

// Public Landing Page
import LandingPage from '../pages/LandingPage';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductMgmt from '../pages/admin/ProductMgmt';
import InventoryMgmt from '../pages/admin/InventoryMgmt';
import SupplierMgmt from '../pages/admin/SupplierMgmt';
import OrderMgmt from '../pages/admin/OrderMgmt';
import UserMgmt from '../pages/admin/UserMgmt';
import ReportsPage from '../pages/admin/ReportsPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';

// Cashier Pages
import CashierDashboard from '../pages/cashier/CashierDashboard';
import POSPage from '../pages/cashier/POSPage';
import ProductAvailability from '../pages/cashier/ProductAvailability';
import TransactionHistory from '../pages/cashier/TransactionHistory';
import RegisterCustomer from '../pages/cashier/RegisterCustomer';

// Customer Pages
import CustomerCatalog from '../pages/customer/CustomerCatalog';
import CustomerCart from '../pages/customer/CustomerCart';
import OrderHistory from '../pages/customer/OrderHistory';

// Shell Layout for Authenticated Pages
const AppLayout = ({ title }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-area">
        <Navbar title={title} />
        <Outlet />
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AppLayout title="Admin Management Portal" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<ProductMgmt />} />
          <Route path="/admin/inventory" element={<InventoryMgmt />} />
          <Route path="/admin/suppliers" element={<SupplierMgmt />} />
          <Route path="/admin/orders" element={<OrderMgmt />} />
          <Route path="/admin/users" element={<UserMgmt />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* Cashier Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['cashier']} />}>
        <Route element={<AppLayout title="Cashier POS Terminal" />}>
          <Route path="/cashier" element={<CashierDashboard />} />
          <Route path="/cashier/pos" element={<POSPage />} />
          <Route path="/cashier/availability" element={<ProductAvailability />} />
          <Route path="/cashier/transactions" element={<TransactionHistory />} />
          <Route path="/cashier/register-customer" element={<RegisterCustomer />} />
        </Route>
      </Route>

      {/* Customer Portal Routes */}
      <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
        <Route element={<AppLayout title="Customer Online Store" />}>
          <Route path="/customer" element={<CustomerCatalog />} />
          <Route path="/customer/cart" element={<CustomerCart />} />
          <Route path="/customer/orders" element={<OrderHistory />} />
        </Route>
      </Route>

      {/* Default Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
