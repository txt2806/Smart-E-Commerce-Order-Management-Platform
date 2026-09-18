import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  QrCode, 
  PackageCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { orderService } from '../services/order';
import { authService } from '../services/auth';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems = [], cartTotal = 0, onSuccess }) => {
  const currentUser = authService.getCurrentUser();
  
  const [formData, setFormData] = useState({
    recipientName: currentUser?.username || '',
    phone: '',
    email: currentUser?.email || '',
    addressLine: '',
    city: 'Hồ Chí Minh',
    paymentMethod: 'COD', // COD | SEPAY_BANK_TRANSFER
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.recipientName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên người nhận.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Vui lòng nhập số điện thoại nhận hàng.');
      return;
    }
    if (!formData.addressLine.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        recipientName: formData.recipientName,
        phone: formData.phone,
        email: formData.email,
        addressLine: formData.addressLine,
        city: formData.city,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity || 1,
          color: item.color || 'Mặc định',
          price: item.price
        }))
      };

      const result = await orderService.createOrder(orderPayload);
      setOrderResult(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Order checkout error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-backdrop" onClick={onClose}>
      <div className="checkout-dialog surface-elevate-2" onClick={e => e.stopPropagation()}>
        <button className="checkout-close-btn" onClick={onClose} aria-label="Đóng">
          <X size={18} />
        </button>

        {orderResult ? (
          <div className="checkout-success-view">
            <div className="success-badge-glow">
              <CheckCircle2 size={48} color="var(--success-status)" />
            </div>
            <h2>Đặt Hàng Thành Công!</h2>
            <p className="success-sub">
              Cảm ơn bạn đã tin tưởng mua sắm tại <strong>Smart Store</strong>. Đơn hàng đã được lưu vào hệ thống và chuyển giao cho kho đóng gói.
            </p>

            <div className="order-receipt-card">
              <div className="receipt-row">
                <span className="receipt-label">Mã Đơn Hàng</span>
                <span className="receipt-val mono-num highlight-code">{orderResult.orderCode}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Người Nhận</span>
                <span className="receipt-val">{orderResult.recipientName} ({orderResult.phone})</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Địa Chỉ Giao</span>
                <span className="receipt-val">{orderResult.addressLine}, {orderResult.city}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Phương Thức Thanh Toán</span>
                <span className="receipt-val">
                  {orderResult.paymentMethod === 'SEPAY_BANK_TRANSFER' ? 'Chuyển Khoản QR Ngân Hàng' : 'Thanh Toán Khi Nhận Hàng (COD)'}
                </span>
              </div>
              <div className="receipt-row total-receipt">
                <span className="receipt-label">Tổng Thanh Toán</span>
                <span className="receipt-val mono-num total-price">${Number(orderResult.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {orderResult.paymentMethod === 'SEPAY_BANK_TRANSFER' && (
              <div className="qr-payment-box">
                <div className="qr-header">
                  <QrCode size={18} color="var(--primary-glow)" />
                  <span>Quét mã VietQR SePay để kích hoạt tức thì</span>
                </div>
                <div className="qr-mock-display">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=SMARTSTORE-${orderResult.orderCode}-${orderResult.totalAmount}`} 
                    alt="SePay VietQR" 
                    className="qr-image"
                  />
                  <span className="qr-caption">Nội dung chuyển khoản: <strong>{orderResult.orderCode}</strong></span>
                </div>
              </div>
            )}

            <div className="success-action-btns">
              <button 
                className="btn-primary success-track-btn" 
                onClick={() => {
                  onClose();
                  window.location.href = '/orders';
                }}
              >
                <span>Xem Đơn Hàng Của Tôi</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <form className="checkout-form-view" onSubmit={handleSubmit}>
            <div className="checkout-header">
              <div className="apple-badge-wrap">
                <Lock size={13} />
                <span>Bảo Mật 256-Bit SSL Smart Store</span>
              </div>
              <h2>Thanh Toán An Toàn</h2>
              <p className="checkout-sub">Điền thông tin nhận hàng để hoàn tất đặt các tuyệt tác công nghệ.</p>
            </div>

            {errorMsg && (
              <div className="checkout-error-banner">
                {errorMsg}
              </div>
            )}

            <div className="checkout-body-grid">
              {/* Left: Shipping Form */}
              <div className="shipping-form-fields">
                <h4 className="section-title">
                  <Truck size={16} /> Thông Tin Nhận Hàng
                </h4>

                <div className="form-group">
                  <label>Họ và Tên Người Nhận *</label>
                  <input 
                    type="text" 
                    name="recipientName" 
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Số Điện Thoại *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0988 123 456"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Nhận Hóa Đơn</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa Chỉ Nhận Hàng (Số nhà, đường, phường/xã) *</label>
                  <input 
                    type="text" 
                    name="addressLine" 
                    value={formData.addressLine}
                    onChange={handleChange}
                    placeholder="Ví dụ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tỉnh / Thành Phố</label>
                  <select name="city" value={formData.city} onChange={handleChange}>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="Tỉnh Thành Khác">Tỉnh Thành Khác</option>
                  </select>
                </div>

                <div className="payment-method-selector">
                  <h4 className="section-title">
                    <CreditCard size={16} /> Phương Thức Thanh Toán
                  </h4>
                  
                  <div className="payment-options">
                    <label className={`payment-option-card ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={handleChange}
                      />
                      <div className="option-info">
                        <span className="option-name">Thanh toán khi nhận hàng (COD)</span>
                        <span className="option-sub">Kiểm tra kiện hàng chính hãng trước khi thanh toán tiền mặt</span>
                      </div>
                    </label>

                    <label className={`payment-option-card ${formData.paymentMethod === 'SEPAY_BANK_TRANSFER' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="SEPAY_BANK_TRANSFER"
                        checked={formData.paymentMethod === 'SEPAY_BANK_TRANSFER'}
                        onChange={handleChange}
                      />
                      <div className="option-info">
                        <span className="option-name">Chuyển khoản QR Ngân hàng (SePay)</span>
                        <span className="option-sub">Quét mã VietQR tự động khớp đơn hàng 24/7 tức thì</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Order Mini Summary */}
              <div className="checkout-summary-pane">
                <h4 className="section-title">
                  <PackageCheck size={16} /> Kiện Hàng ({cartItems.length} sản phẩm)
                </h4>

                <div className="summary-items-list">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="summary-item-card">
                      <img src={item.image} alt={item.name} className="item-thumb" />
                      <div className="item-meta">
                        <span className="item-name">{item.name}</span>
                        <span className="item-variant">Số lượng: {item.quantity} {item.color ? `• ${item.color}` : ''}</span>
                      </div>
                      <span className="item-price mono-num">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary-pricing-lines">
                  <div className="price-row">
                    <span>Tạm tính</span>
                    <span className="mono-num">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Vận chuyển hỏa tốc</span>
                    <span className="free-shipping-tag">MIỄN PHÍ</span>
                  </div>
                  <div className="price-row total-row">
                    <span>Tổng Cộng</span>
                    <span className="mono-num final-val">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="security-guarantee">
                  <ShieldCheck size={16} color="var(--success-status)" />
                  <span>Đổi mới 30 ngày • Bảo hành 12 tháng chính hãng Smart Store</span>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary checkout-submit-btn"
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? (
                    <span>Đang xử lý đơn hàng...</span>
                  ) : (
                    <>
                      <span>Xác Nhận Đặt Hàng (${cartTotal.toFixed(2)})</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
