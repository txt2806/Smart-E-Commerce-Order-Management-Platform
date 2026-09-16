import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { ShieldAlert, ArrowLeft, Store } from 'lucide-react';

export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const user = authService.getCurrentUser();
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role: support both 'SELLER' and 'ROLE_SELLER', etc.
  const userRole = (user.role || '').toUpperCase().replace('ROLE_', '');
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace('ROLE_', ''));

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div className="surface-card" style={{ maxWidth: '480px', padding: '36px', borderRadius: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            color: 'var(--critical-status)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Khu Vực Giới Hạn Quyền Truy Cập</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
            Tài khoản hiện tại của bạn (<strong>{user.username}</strong> - Vai trò: <em>{userRole}</em>) không có quyền truy cập vào phân hệ này. Vui lòng đăng nhập bằng tài khoản có thẩm quyền tương ứng.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <a href="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} />
              <span>Về Trang Chủ</span>
            </a>
            <a href="/login" className="btn-primary">
              <span>Đổi Tài Khoản</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
