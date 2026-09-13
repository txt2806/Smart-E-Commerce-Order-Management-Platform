import React from 'react';
import { authService } from '../services/auth';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="dashboard-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
          Welcome back, {user?.username}!
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Here's what's happening with your Smart E-Commerce account today.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {/* Placeholder Stat Cards */}
        <div className="dashboard-card">
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>$0.00</p>
        </div>
        <div className="dashboard-card">
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Orders</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>0</p>
        </div>
        <div className="dashboard-card">
          <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Products</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
