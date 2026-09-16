import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  Check
} from 'lucide-react';
import './CartDrawer.css';

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckout 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = 200;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'VIP20' || couponCode.toUpperCase() === 'SMART50') {
      const disc = couponCode.toUpperCase() === 'VIP20' ? subtotal * 0.2 : 50;
      setDiscountAmount(disc);
      setDiscountApplied(true);
    } else {
      alert('Mã giảm giá không hợp lệ. Hãy thử: VIP20 hoặc SMART50');
    }
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer surface-elevate-2" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <div className="cart-title-group">
              <ShoppingBag size={20} color="var(--primary-brand)" />
              <h3>Giỏ Hàng Của Bạn</h3>
            </div>
            <span className="cart-badge micro-label mono-num">
              {cartItems.reduce((acc, it) => acc + it.quantity, 0)} sản phẩm
            </span>
          </div>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="shipping-progress-banner">
          <div className="progress-info">
            {subtotal >= freeShippingThreshold ? (
              <span className="free-shipping-active">
                <Sparkles size={14} /> Bạn đã đủ điều kiện <strong>Miễn Phí Vận Chuyển Hỏa Tốc</strong>!
              </span>
            ) : (
              <span>
                Mua thêm <strong className="mono-num">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> để được Miễn Phí Vận Chuyển
              </span>
            )}
          </div>
          <div className="progress-track">
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="cart-items-scroll">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} className="empty-cart-icon" />
              <h4>Giỏ hàng đang trống</h4>
              <p>Khám phá các tuyệt tác công nghệ hàng đầu tại trang chủ và thêm vào giỏ.</p>
              <button className="btn-secondary" onClick={onClose}>
                Tiếp Tục Khám Phá
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.color || 'def'}`} className="cart-item-card">
                  <div className="cart-item-img">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-header">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <button 
                        className="cart-item-delete"
                        onClick={() => onRemoveItem(item.id, item.color)}
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="cart-item-variant">
                      {item.color && (
                        <span className="variant-pill">Màu: {item.color}</span>
                      )}
                      <span className="item-sku mono-num">{item.sku || 'SKU-STD'}</span>
                    </div>

                    <div className="cart-item-footer">
                      <div className="qty-control">
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.color, item.quantity - 1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="qty-display mono-num">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.color, item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="cart-item-price mono-num">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="coupon-form">
              <div className="coupon-input-wrap">
                <Tag size={15} className="coupon-icon" />
                <input 
                  type="text" 
                  className="coupon-input" 
                  placeholder="Mã ưu đãi (thử: VIP20)"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                />
              </div>
              <button type="submit" className="coupon-btn">
                {discountApplied ? <Check size={16} /> : 'Áp Dụng'}
              </button>
            </form>

            <div className="cart-summary-lines">
              <div className="summary-line">
                <span>Tạm tính</span>
                <span className="mono-num">${subtotal.toFixed(2)}</span>
              </div>
              {discountApplied && (
                <div className="summary-line discount-line">
                  <span>Ưu đãi VIP</span>
                  <span className="mono-num">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line">
                <span>Vận chuyển dự kiến</span>
                <span className="mono-num">
                  {subtotal >= freeShippingThreshold ? (
                    <strong style={{ color: 'var(--success-status)' }}>MIỄN PHÍ</strong>
                  ) : (
                    '$15.00'
                  )}
                </span>
              </div>
              <div className="summary-line total-line">
                <span>Tổng cộng</span>
                <span className="mono-num total-amount">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button 
              className="btn-primary checkout-btn"
              onClick={() => onCheckout(finalTotal)}
            >
              <span>Thanh Toán An Toàn</span>
              <ArrowRight size={16} />
            </button>

            <div className="cart-trust-indicator">
              <ShieldCheck size={14} color="var(--success-status)" />
              <span>Apple Pay, Stripe & Visa 256-bit Encrypted</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
