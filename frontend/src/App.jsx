import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Storefront from './pages/Storefront';
import CustomerPortal from './pages/CustomerPortal';
import SellerConsole from './pages/SellerConsole';
import AdminCommandCenter from './pages/AdminCommandCenter';
import Login from './pages/Login';
import Register from './pages/Register';
import MyStore from './pages/MyStore';
import { RoleRoute } from './components/RoleRoute';

// Wrapper components to bridge outlet context
const StorefrontPage = () => {
  const { onAddToCart, onOpenPDP } = useOutletContext();
  return <Storefront onAddToCart={onAddToCart} onOpenPDP={onOpenPDP} />;
};

const CustomerOrdersPage = () => {
  const { onAddToCart } = useOutletContext();
  return <CustomerPortal onAddToCart={onAddToCart} />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Core Store Platform Layout */}
        <Route path="/" element={<MainLayout />}>
          {/* Default entry point for all visitors is the Storefront Homepage */}
          <Route index element={<StorefrontPage />} />
          <Route path="storefront" element={<StorefrontPage />} />

          {/* Customer Orders & Portal: Requires Logged In User */}
          <Route 
            path="orders" 
            element={
              <RoleRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
                <CustomerOrdersPage />
              </RoleRoute>
            } 
          />
          <Route 
            path="customer" 
            element={
              <RoleRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}>
                <CustomerOrdersPage />
              </RoleRoute>
            } 
          />

          {/* Seller Central Console: Requires SELLER or ADMIN role */}
          <Route 
            path="seller" 
            element={
              <RoleRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerConsole />
              </RoleRoute>
            } 
          />
          <Route 
            path="dashboard" 
            element={
              <RoleRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerConsole />
              </RoleRoute>
            } 
          />
          <Route 
            path="products" 
            element={
              <RoleRoute allowedRoles={['SELLER', 'ADMIN']}>
                <SellerConsole />
              </RoleRoute>
            } 
          />
          <Route 
            path="my-store" 
            element={
              <RoleRoute allowedRoles={['SELLER', 'ADMIN']}>
                <MyStore />
              </RoleRoute>
            } 
          />

          {/* Platform Super-Admin Command Center: Requires ADMIN role */}
          <Route 
            path="admin" 
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminCommandCenter />
              </RoleRoute>
            } 
          />

          {/* Fallback to Storefront */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
