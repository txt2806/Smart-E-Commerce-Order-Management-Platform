import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { productService } from '../services/product';
import { categoryService } from '../services/category';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getMyProducts(),
        categoryService.getAllCategories()
      ]);
      setProducts(productsRes || []);
      setCategories(categoriesRes || []);
      if (categoriesRes && categoriesRes.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesRes[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct({
        ...formData,
        categoryId: parseInt(formData.categoryId),
        basePrice: parseFloat(formData.basePrice)
      });
      alert('Product added successfully!');
      setShowForm(false);
      setFormData({ name: '', description: '', basePrice: '', categoryId: categories[0]?.id || '' });
      fetchData(); // Refresh list
    } catch (error) {
      alert('Failed to add product');
    }
  };

  if (loading) return <div className="page-content">Loading...</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>My Products</h1>
        <Button onClick={() => setShowForm(!showForm)} style={{ width: 'auto' }}>
          <Plus size={18} />
          {showForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {showForm && (
        <div className="dashboard-card form-card slide-down" style={{ marginBottom: '2rem' }}>
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <Input
                  id="name"
                  label="Product Name"
                  type="text"
                  icon={Package}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  id="basePrice"
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label" htmlFor="categoryId">Category</label>
                <select 
                  id="categoryId" 
                  className="input-field select-field"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="input-field textarea-field"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <Button type="submit">Save Product</Button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-state dashboard-card">
          <Package size={48} color="var(--color-text-secondary)" />
          <h3>No products yet</h3>
          <p>Click "Add Product" to start selling.</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="dashboard-card product-card">
              <div className="product-image-placeholder">
                <Package size={40} color="var(--color-primary)" />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <span className="product-category">
                  {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                </span>
                <p className="product-price">${parseFloat(product.basePrice).toFixed(2)}</p>
              </div>
              <div className="product-actions">
                <button className="icon-btn edit"><Edit2 size={16} /></button>
                <button className="icon-btn delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
