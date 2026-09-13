import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Globe, Apple, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/auth';
import './Login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'otp'
  
  // Form states
  const [formData, setFormData] = useState({ username: '', password: '', phone: '' });
  const [errors, setErrors] = useState({ username: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'username' && value.length < 3) {
      errorMsg = 'Username must be at least 3 characters.';
    }
    if (name === 'password' && value.length < 6) {
      errorMsg = 'Password must be at least 6 characters.';
    }
    if (name === 'phone' && !/^[0-9]{10}$/.test(value)) {
      errorMsg = 'Please enter a valid 10-digit phone number.';
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: '' }); // Clear error while typing
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    validateField(id, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Quick validation before submit
    if (activeTab === 'password') {
      if (!formData.username || !formData.password) return;
    } else {
      if (!formData.phone || errors.phone) return;
      // Note: In real app, this would trigger an OTP SMS, then show OTP input field.
      // We simulate successful OTP request here.
      alert('OTP sent to ' + formData.phone + '! (Simulation)');
      return;
    }

    setLoading(true);
    try {
      await authService.login({
        username: formData.username,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your Smart E-Commerce account"
    >
      {/* Login Method Tabs */}
      <div className="auth-tabs">
        <button 
          className={`auth-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button 
          className={`auth-tab ${activeTab === 'otp' ? 'active' : ''}`}
          onClick={() => setActiveTab('otp')}
        >
          OTP (Passwordless)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Form Fields based on Tab */}
        {activeTab === 'password' ? (
          <>
            <Input 
              id="username"
              label="Username or Email"
              type="text"
              icon={Mail}
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.username}
              required
            />
            
            <Input 
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              required
            />
            
            <div className="forgot-password-container">
              <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>Forgot password?</Link>
            </div>
          </>
        ) : (
          <>
            <Input 
              id="phone"
              label="Phone Number"
              type="tel"
              icon={Phone}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              placeholder="0912345678"
              required
            />
            <p className="otp-hint">We'll send you a one-time password via SMS or Zalo ZNS.</p>
          </>
        )}

        <Button type="submit" loading={loading} style={{ marginBottom: '1rem' }}>
          {activeTab === 'password' ? 'Sign In' : 'Get OTP'}
        </Button>
        
        {/* Social Logins */}
        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setLoading(true);
                try {
                  await authService.loginWithGoogle(credentialResponse.credential);
                  navigate('/dashboard');
                } catch (err) {
                  alert(err.response?.data?.message || 'Google Login failed!');
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                alert('Google Login Failed');
              }}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>
          <Button variant="secondary" icon={Apple} type="button" style={{ width: '100%' }}>
            <Apple size={18} style={{ marginRight: '0.5rem' }}/>
            Continue with Apple
          </Button>
        </div>
        
        {/* Guest Checkout & Registration Links */}
        <div className="auth-footer-links">
          <div>
            <span style={{ color: 'var(--color-text-secondary)' }}>Don't have an account? </span>
            <Link to="/register">Create one</Link>
          </div>
          
          <button 
            type="button" 
            className="guest-checkout-btn"
            onClick={() => navigate('/dashboard')}
          >
            Continue as Guest <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
