import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import CommandPalette from './CommandPalette';
import CartDrawer from './CartDrawer';
import ProductDetailDrawer from './ProductDetailDrawer';
import CheckoutModal from './CheckoutModal';
import './MainLayout.css';

const MainLayout = () => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('smart_store_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [cartBouncing, setCartBouncing] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPDPProduct, setSelectedPDPProduct] = useState(null);
  const [checkoutAmount, setCheckoutAmount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  // Listen for global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => 
        item.id === product.id && (item.color || 'def') === (product.color || 'def')
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += (product.quantity || 1);
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          sku: product.sku || 'SKU-STD',
          color: product.color || (product.colors?.[0]?.name) || 'Default',
          price: product.price,
          quantity: product.quantity || 1,
          image: product.image
        }
      ];
    });

    // Trigger subtle cart bounce
    setCartBouncing(true);
    setTimeout(() => setCartBouncing(false), 500);
  };

  const handleUpdateQty = (id, color, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, color);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === id && (item.color || 'def') === (color || 'def')) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id, color) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === id && (item.color || 'def') === (color || 'def'))
    ));
  };

  const handleTriggerCheckout = (total) => {
    setCheckoutAmount(total);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = (order) => {
    setCartItems([]);
  };

  const totalItemCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="main-editorial-layout">
      {/* Sticky Top Navbar */}
      <Navbar 
        cartCount={totalItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCommand={() => setIsCommandOpen(true)}
        cartBouncing={cartBouncing}
      />

      {/* Main View Area */}
      <main className="main-viewport">
        <Outlet context={{ 
          onAddToCart: handleAddToCart, 
          onOpenPDP: (prod) => setSelectedPDPProduct(prod) 
        }} />
      </main>

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette 
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectRole={(role) => {
          if (role === 'guest') navigate('/');
          if (role === 'customer') navigate('/orders');
          if (role === 'seller') navigate('/seller');
          if (role === 'admin') navigate('/admin');
        }}
      />

      {/* Slide-over Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleTriggerCheckout}
      />

      {/* Product Detail Modal / Drawer (60/40 Split) */}
      <ProductDetailDrawer 
        isOpen={!!selectedPDPProduct}
        product={selectedPDPProduct}
        onClose={() => setSelectedPDPProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Apple / Shopify Style Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        cartTotal={checkoutAmount}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};

export default MainLayout;
