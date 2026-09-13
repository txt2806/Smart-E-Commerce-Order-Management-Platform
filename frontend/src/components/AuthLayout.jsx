import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="split-auth-container">
      {/* Left side: Visual Canvas (55%) */}
      <div className="auth-visual-column">
        <div className="auth-visual-overlay"></div>
        <img 
          src="/login-cover.jpg" 
          alt="Premium Lifestyle" 
          className="auth-visual-image"
        />
        <div className="auth-visual-content">
          <h2 className="visual-title">Elevate Your Lifestyle</h2>
          <p className="visual-subtitle">
            Join the Smart E-Commerce platform today and get <strong>15% OFF</strong> your first exclusive order.
          </p>
        </div>
      </div>

      {/* Right side: Auth Container (45%) */}
      <div className="auth-form-column">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          
          <div className="auth-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
