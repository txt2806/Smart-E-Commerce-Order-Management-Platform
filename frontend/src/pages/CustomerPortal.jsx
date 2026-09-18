import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Tag, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  UploadCloud, 
  X,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { orderService } from '../services/order';
import { voucherService } from '../services/voucher';
import { authService } from '../services/auth';
import './CustomerPortal.css';

const CustomerPortal = ({ onAddToCart }) => {
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Hàng không đúng mô tả');
  const [disputeEvidence, setDisputeEvidence] = useState(null);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [repurchaseSuccess, setRepurchaseSuccess] = useState(null);

  const currentUser = authService.getCurrentUser();

  const fetchOrdersAndVouchers = async () => {
    setLoading(true);
    try {
      const [orderData, voucherData] = await Promise.all([
        orderService.getMyOrders().catch(() => []),
        voucherService.getAllVouchers().catch(() => [])
      ]);
      setOrders(orderData || []);
      setVouchers(voucherData || []);
    } catch (err) {
      console.error('Failed to load customer orders/vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndVouchers();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleRepurchase = (order) => {
    if (order.items && onAddToCart) {
      order.items.forEach(item => {
        onAddToCart({
          id: item.productId,
          name: item.productName,
          price: Number(item.priceAtBuy),
          quantity: item.quantity,
          image: item.imageUrl
        });
      });
    }
    setRepurchaseSuccess(order.id);
    setTimeout(() => setRepurchaseSuccess(null), 2000);
  };

  const handleSubmitDispute = (e) => {
    e.preventDefault();
    setDisputeSubmitted(true);
    setTimeout(() => {
      setDisputeSubmitted(false);
      setDisputeOrder(null);
      alert('Yêu cầu khiếu nại đã được gửi tới Bàn Phân Xử Sàn (Split-View Arbitration Center). Admin sẽ xử lý trong 2h.');
    }, 1200);
  };

  return (
    <div className="customer-portal-page">
      <div className="portal-container">
        {/* TOP: MEMBER LOYALTY TIER HEADER */}
        <section className="member-hero-card surface-card">
          <div className="member-tier-info">
            <div className="tier-badge-pill">
              <Award size={16} />
              <span>HẠNG THÀNH VIÊN TITANIUM VIP</span>
            </div>
            <h2>Chào Mừng Trở Lại, Alex Turner</h2>
            <p>Tích lũy chi tiêu: <strong className="mono-num">$8,498 / $10,000</strong> để nâng hạng Black Diamond vĩnh viễn.</p>
            
            <div className="loyalty-progress-box">
              <div className="loyalty-bar-track">
                <div className="loyalty-bar-fill" style={{ width: '85%' }} />
              </div>
              <div className="loyalty-levels mono-num">
                <span>Gold Tier ($5K)</span>
                <span className="current-level">Titanium VIP (Hiện tại)</span>
                <span>Black Diamond ($10K)</span>
              </div>
            </div>
          </div>

          <div className="member-perks-box">
            <div className="perk-item">
              <Sparkles size={16} color="var(--primary-glow)" />
              <div>
                <strong>Hoàn tiền 3.5%</strong>
                <p>Cộng trực tiếp vào ví xu</p>
              </div>
            </div>
            <div className="perk-item">
              <Truck size={16} color="var(--success-status)" />
              <div>
                <strong>Hỏa tốc ưu tiên</strong>
                <p>Đóng hàng trong 15 phút</p>
              </div>
            </div>
            <div className="perk-item">
              <ShieldAlert size={16} color="var(--warning-status)" />
              <div>
                <strong>Bảo hiểm 1 đổi 1</strong>
                <p>Xử lý khiếu nại nhanh 2H</p>
              </div>
            </div>
          </div>
        </section>

        {/* SAVED VOUCHERS SECTION */}
        <section className="vouchers-strip">
          <div className="strip-title">
            <Tag size={16} color="var(--primary-brand)" />
            <h4>Kho Voucher & Mã Ưu Đãi Đã Lưu</h4>
          </div>
          <div className="vouchers-grid">
            {vouchers.map(v => (
              <div key={v.code} className="voucher-ticket surface-card">
                <div className="ticket-left">
                  <span className="ticket-code mono-num">{v.code}</span>
                  <span className="ticket-title">{v.title}</span>
                  <span className="ticket-disc">{v.discount}</span>
                  <span className="ticket-exp micro-label">{v.validUntil ? `Hạn dùng: ${new Date(v.validUntil).toLocaleDateString('vi-VN')}` : 'Vĩnh viễn'}</span>
                </div>
                <button 
                  className="copy-voucher-btn"
                  onClick={() => handleCopyCode(v.code)}
                >
                  {copiedCode === v.code ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode === v.code ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ORDERS & 4-STEP METALLIC TRACKING */}
        <section className="my-orders-section">
          <div className="orders-header-row">
            <h3>Đơn Hàng Của Tôi & Tiến Độ Vận Đơn</h3>
            <span className="mono-num micro-label">{orders.length} Đơn hàng</span>
          </div>

          {loading ? (
            <div className="orders-loading-box" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span>Đang tải danh sách đơn hàng...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-card surface-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <Package size={48} color="var(--primary-glow)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Chưa có đơn hàng nào</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Bạn chưa thực hiện đơn đặt hàng nào. Hãy khám phá ngay các sản phẩm công nghệ tuyệt tác tại Cửa hàng Smart Store!
              </p>
              <a href="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
                Khám Phá Cửa Hàng <ChevronRight size={16} />
              </a>
            </div>
          ) : (
            <div className="orders-timeline-stack">
              {orders.map(order => {
                const orderCode = order.orderCode || ('ORD-' + order.id);
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới đặt';
                const totalVal = Number(order.totalAmount || 0);
                const isStep2 = ['PROCESSING', 'COMPLETED', 'SHIPPING', 'DELIVERED'].includes(order.status);
                const isStep3Active = ['PROCESSING', 'SHIPPING'].includes(order.status);
                const isStep3Done = ['COMPLETED', 'DELIVERED'].includes(order.status);
                const isStep4Done = ['COMPLETED', 'DELIVERED'].includes(order.status);

                return (
                  <div key={order.id} className="order-item-card surface-card">
                    <div className="order-card-top">
                      <div className="order-id-group">
                        <Package size={18} color="var(--primary-brand)" />
                        <span className="order-code mono-num">{orderCode}</span>
                        <span className="order-date micro-label">{orderDate}</span>
                        <span className={`status-pill ${order.status?.toLowerCase() || 'pending'}`} style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background: isStep4Done ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: isStep4Done ? 'var(--success-status)' : 'var(--primary-glow)',
                          fontWeight: '600'
                        }}>
                          {order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'ĐÃ GIAO THÀNH CÔNG' :
                           order.status === 'PROCESSING' || order.status === 'SHIPPING' ? 'ĐANG VẬN CHUYỂN' :
                           order.status === 'CANCELLED' ? 'ĐÃ HỦY' : 'CHỜ XÁC NHẬN'}
                        </span>
                      </div>
                      <div className="order-amount-group">
                        <span className="micro-label">Tổng thanh toán:</span>
                        <strong className="mono-num order-price">${totalVal.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* 4-STEP METALLIC TIMELINE TRACKER */}
                    <div className="metallic-timeline-container">
                      <div className="timeline-steps">
                        {/* Step 1: Placed */}
                        <div className="timeline-step completed">
                          <div className="step-metal-node">
                            <Check size={12} />
                          </div>
                          <div className="step-meta">
                            <span className="step-title">Đặt Hàng</span>
                            <span className="step-time micro-label mono-num">Đã xác nhận</span>
                          </div>
                        </div>

                        {/* Step 2: Packed */}
                        <div className={`timeline-step ${isStep2 ? 'completed' : 'active-pulse'}`}>
                          <div className="step-metal-node">
                            {isStep2 ? <Check size={12} /> : <Package size={12} />}
                          </div>
                          <div className="step-meta">
                            <span className="step-title">Đã Đóng Gói</span>
                            <span className="step-time micro-label mono-num">Kho Smart Store</span>
                          </div>
                        </div>

                        {/* Step 3: In Transit */}
                        <div className={`timeline-step ${isStep3Active ? 'active-pulse' : isStep3Done ? 'completed' : ''}`}>
                          <div className="step-metal-node">
                            {isStep3Done ? <Check size={12} /> : <Truck size={13} />}
                          </div>
                          <div className="step-meta">
                            <span className="step-title">Đang Vận Chuyển</span>
                            <span className="step-time micro-label mono-num">Giao Hỏa Tốc</span>
                          </div>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className={`timeline-step ${isStep4Done ? 'completed' : ''}`}>
                          <div className="step-metal-node">
                            <CheckCircle2 size={13} />
                          </div>
                          <div className="step-meta">
                            <span className="step-title">Giao Thành Công</span>
                            <span className="step-time micro-label mono-num">
                              {isStep4Done ? 'Đã hoàn tất' : 'Dự kiến 2h'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recipient info & Shipping line */}
                    {order.recipientName && (
                      <div className="order-shipping-meta-bar" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.6rem 1rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        margin: '1rem 0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={13} color="var(--primary-glow)" />
                          <span>Người nhận: <strong>{order.recipientName}</strong> ({order.phone || '09xx'})</span>
                        </div>
                        <div style={{ opacity: 0.6 }}>•</div>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span>{order.addressLine}, {order.city}</span>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="micro-label">PTTT:</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{order.paymentMethod === 'SEPAY_BANK_TRANSFER' ? 'VietQR SePay' : 'COD'}</strong>
                        </div>
                      </div>
                    )}

                    {/* Order Item List & Actions */}
                    <div className="order-items-sublist">
                      {order.items && order.items.map((item, idx) => (
                        <div key={item.id || idx} className="sub-item-row">
                          <img 
                            src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'} 
                            alt={item.productName || item.name} 
                            className="sub-item-thumb" 
                          />
                          <div className="sub-item-details">
                            <h5>{item.productName || item.name}</h5>
                            <div className="sub-item-tags">
                              {item.sku && <span className="mono-num micro-label">SKU: {item.sku}</span>}
                              {item.color && <span className="mono-num micro-label">Màu: {item.color}</span>}
                              <span className="mono-num micro-label">x{item.quantity}</span>
                              {item.storeName && <span className="mono-num micro-label" style={{ color: 'var(--primary-glow)' }}>{item.storeName}</span>}
                            </div>
                          </div>
                          <span className="sub-item-price mono-num">
                            ${(Number(item.priceAtBuy || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Buttons: One-click Repurchase & Dispute */}
                    <div className="order-actions-bar">
                      <button 
                        className="btn-primary repurchase-btn"
                        onClick={() => handleRepurchase(order)}
                      >
                        {repurchaseSuccess === order.id ? (
                          <>
                            <Check size={16} />
                            <span>Đã Thêm Lại Giỏ Hàng!</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={16} />
                            <span>Mua Lại Lần Nữa</span>
                          </>
                        )}
                      </button>

                      <button 
                        className="btn-secondary dispute-btn"
                        onClick={() => setDisputeOrder(order)}
                      >
                        <AlertCircle size={15} color="var(--warning-status)" />
                        <span>Yêu Cầu Hỗ Trợ / Khiếu Nại</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* DISPUTE MODAL (Drag & Drop Evidence) */}
      {disputeOrder && (
        <div className="dispute-modal-backdrop" onClick={() => setDisputeOrder(null)}>
          <div className="dispute-dialog surface-elevate-2" onClick={e => e.stopPropagation()}>
            <div className="dispute-header">
              <div className="dispute-title-wrap">
                <ShieldAlert size={20} color="var(--critical-status)" />
                <h3>Khiếu Nại Đơn Hàng #{disputeOrder.id}</h3>
              </div>
              <button className="dispute-close-btn" onClick={() => setDisputeOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="dispute-form">
              <div className="form-group">
                <label className="micro-label">Lý do khiếu nại</label>
                <select 
                  className="input-control"
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                >
                  <option>Hàng không đúng mô tả sản phẩm</option>
                  <option>Hàng hóa bị va đập / Móp hộp vận chuyển</option>
                  <option>Lỗi kỹ thuật không lên nguồn</option>
                  <option>Giao thiếu phụ kiện kèm theo</option>
                </select>
              </div>

              <div className="form-group">
                <label className="micro-label">Tải lên hình ảnh / video bằng chứng (Kéo - Thả)</label>
                <div className="dropzone-box">
                  <UploadCloud size={32} color="var(--primary-glow)" />
                  <p>Kéo thả ảnh chụp thực tế hoặc nhấp để chọn tệp</p>
                  <span>Hỗ trợ PNG, JPG, MP4 tối đa 50MB</span>
                  <input 
                    type="file" 
                    className="file-hidden-input"
                    onChange={e => setDisputeEvidence(e.target.files[0]?.name || 'evidence.jpg')} 
                  />
                  {disputeEvidence && (
                    <div className="uploaded-file-chip">
                      <Check size={12} /> {disputeEvidence}
                    </div>
                  )}
                </div>
              </div>

              <div className="dispute-submit-actions">
                <button type="button" className="btn-secondary" onClick={() => setDisputeOrder(null)}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-primary" disabled={disputeSubmitted}>
                  {disputeSubmitted ? 'Đang chuyển giao Bàn Phân Xử...' : 'Gửi Khiếu Nại Tới Sàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
