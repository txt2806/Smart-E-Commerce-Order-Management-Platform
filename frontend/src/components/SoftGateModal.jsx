import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import './SoftGateModal.css';

const SoftGateModal = ({ isOpen, onClose, onSuccess, cartTotal = 0 }) => {
  const [authMode, setAuthMode] = useState('guest'); // 'guest' | 'login'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  if (!isOpen) return null;

  const handleContinue = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthenticated(true);
      setTimeout(() => {
        onSuccess({ email: email || 'guest@smartecom.io', name: name || 'Valued Customer' });
        onClose();
      }, 900);
    }, 800);
  };

  const handleOneTap = (provider) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAuthenticated(true);
      setTimeout(() => {
        onSuccess({ email: `customer.${provider.toLowerCase()}@example.com`, name: `${provider} Verified User` });
        onClose();
      }, 800);
    }, 600);
  };

  return (
    <div className="softgate-backdrop" onClick={onClose}>
      <div className="softgate-dialog surface-elevate-2" onClick={e => e.stopPropagation()}>
        <button className="softgate-close" onClick={onClose}>
          <X size={18} />
        </button>

        {authenticated ? (
          <div className="softgate-success">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} color="var(--success-status)" />
            </div>
            <h2>Xác Thực Thành Công!</h2>
            <p>Toàn bộ giỏ hàng đã được đồng bộ an toàn. Đang chuyển sang cổng thanh toán...</p>
          </div>
        ) : (
          <div className="softgate-content">
            <div className="softgate-header">
              <div className="softgate-badge">
                <Lock size={13} />
                <span>Bảo Mật 256-Bit SSL</span>
              </div>
              <h2>Hoàn Tất Đơn Hàng</h2>
              <p>Chỉ một bước xác nhận thông tin nhận hàng và thanh toán <strong className="mono-num">${cartTotal.toFixed(2)}</strong></p>
            </div>

            <div className="one-tap-group">
              <button 
                type="button" 
                className="one-tap-btn google-btn" 
                onClick={() => handleOneTap('Google')}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.9.2-1.7.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                </svg>
                <span>Xác nhận nhanh với Google</span>
              </button>

              <button 
                type="button" 
                className="one-tap-btn apple-btn" 
                onClick={() => handleOneTap('Apple')}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.21-10.27-1.9-14.77-6.35-3.37-3.16-7.3-8.07-11.78-14.74-7.44-11.08-13.1-23.75-16.98-38.01-3.88-14.26-5.83-27.4-5.83-39.42 0-16.03 4.22-29.47 12.65-40.32 8.44-10.85 18.9-16.39 31.4-16.6 4.79 0 10.37 1.26 16.74 3.78 6.36 2.52 10.59 3.84 12.68 3.96 1.7.11 6.16-1.32 13.37-4.29 7.21-2.97 13.26-4.23 18.15-3.78 14.15 1.06 25.43 6.64 33.84 16.74-12.35 7.45-18.39 17.65-18.12 30.61.27 10.53 4.3 19.34 12.1 26.43 7.8 7.09 17.2 11.13 28.2 12.12-2.34 7.44-5.25 14.76-8.71 21.95zM119.22 33.02c0-7.85 2.76-15.35 8.28-22.5 5.52-7.15 12.44-11.45 20.76-12.9-1.28 8.18-4.4 15.63-9.36 22.35-4.96 6.72-11.17 10.99-18.63 12.82-.32-.63-.67-1.42-1.05-2.37z"/>
                </svg>
                <span>Tiếp tục với Apple ID</span>
              </button>
            </div>

            <div className="softgate-divider">
              <span>hoặc hoàn tất với tư cách Khách</span>
            </div>

            <form onSubmit={handleContinue} className="softgate-form">
              <div className="form-group">
                <label className="micro-label">Họ & Tên người nhận</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Nguyễn Văn A" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="micro-label">Email nhận biên nhận & Mã vận đơn</label>
                <input 
                  type="email" 
                  className="input-control" 
                  placeholder="email@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="softgate-guarantee">
                <ShieldCheck size={16} color="var(--success-status)" />
                <span>Giỏ hàng và thông tin mã giảm giá sẽ được lưu trữ tự động.</span>
              </div>

              <button 
                type="submit" 
                className="btn-primary softgate-submit"
                disabled={loading}
              >
                {loading ? 'Đang mã hóa an toàn...' : 'Tiến Hành Thanh Toán Ngay'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoftGateModal;
