import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(formData);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join Smart E-Commerce today"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input 
            id="firstName" label="First Name" type="text"
            value={formData.firstName} onChange={handleChange} required
          />
          <Input 
            id="lastName" label="Last Name" type="text"
            value={formData.lastName} onChange={handleChange} required
          />
        </div>

        <Input 
          id="username" label="Username" type="text" icon={User}
          value={formData.username} onChange={handleChange} required
        />

        <Input 
          id="phone" label="Phone Number" type="tel" icon={Phone}
          value={formData.phone} onChange={handleChange} required
        />
        
        <Input 
          id="password" label="Password" type="password" icon={Lock}
          value={formData.password} onChange={handleChange} required
        />

        <Button type="submit" loading={loading} style={{ marginTop: '1rem' }}>
          Sign Up
        </Button>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Already have an account? </span>
          <Link to="/login">Sign In</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
