import React, { useState, useEffect } from 'react';
import { Store, Image, CheckCircle, Clock } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { storeService } from '../services/store';
import './MyStore.css';

const MyStore = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', logoUrl: '' });
  
  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const data = await storeService.getMyStore();
      if (data) {
        setStore(data);
        setFormData({ name: data.name, description: data.description || '', logoUrl: data.logoUrl || '' });
      }
    } catch (error) {
      console.log('No store yet or error fetching store');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedStore = await storeService.createOrUpdateStore(formData);
      setStore(savedStore);
      setIsEditing(false);
      alert('Store saved successfully!');
    } catch (error) {
      alert('Failed to save store');
    }
  };

  if (loading) return <div className="page-content">Loading...</div>;

  return (
    <div className="my-store-page">
      <h1 className="page-title">My Store</h1>

      {(!store || isEditing) ? (
        <div className="dashboard-card form-card">
          <h2>{store ? 'Edit Store Details' : 'Create Your Store'}</h2>
          <p className="subtitle">Set up your brand to start selling on Smart E-Commerce.</p>
          
          <form onSubmit={handleSubmit} className="store-form">
            <Input
              id="name"
              label="Store Name"
              type="text"
              icon={Store}
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <div className="input-group">
              <label htmlFor="description" className="input-label">Store Description</label>
              <textarea
                id="description"
                className="input-field textarea-field"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your brand..."
                rows={4}
              />
            </div>

            <Input
              id="logoUrl"
              label="Logo URL"
              type="url"
              icon={Image}
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
            />

            <div className="form-actions">
              {store && (
                <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {store ? 'Save Changes' : 'Create Store'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="dashboard-card store-details-card">
          <div className="store-header">
            <div className="store-logo">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} />
              ) : (
                <Store size={48} color="var(--color-primary)" />
              )}
            </div>
            <div className="store-title">
              <h2>{store.name}</h2>
              <div className={`store-status ${store.status.toLowerCase()}`}>
                {store.status === 'ACTIVE' ? <CheckCircle size={16} /> : <Clock size={16} />}
                <span>{store.status}</span>
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)} style={{ marginLeft: 'auto', width: 'auto' }}>
              Edit Profile
            </Button>
          </div>
          
          <div className="store-info">
            <h3>About Store</h3>
            <p>{store.description || 'No description provided.'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStore;
