import React, { useState } from 'react';
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
import './CustomerPortal.css';

const MOCK_ORDERS = [
  {
    id: 'ORD-9824',
    date: '13/09/2026 14:15',
    total: 3499.00,
    status: 'IN_TRANSIT', // 'PLACED' | 'PACKED' | 'IN_TRANSIT' | 'DELIVERED'
    eta: 'Hôm nay lúc 16:45',
    shipper: {
      name: 'Trần Văn Hoàng (Giao Hỏa Tốc)',
      phone: '0982-***-889',
      vehicle: 'Honda SH - Biển số: 29A1-982.14',
      currentLocation: 'Cách bạn 2.4 km • Đang di chuyển trên đường Lê Văn Lương'
    },
    items: [
      {
        id: 1,
        name: 'Apple Vision Pro Spatial Computer',
        sku: 'AP-VISPRO-M2',
        color: 'Space Gray',
        price: 3499.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=400&q=80'
      }
    ]
  },
  {
    id: 'ORD-8921',
    date: '02/09/2026 10:30',
    total: 999.00,
    status: 'DELIVERED',
    eta: 'Đã nhận lúc 15:20 ngày 02/09/2026',
    items: [
      {
        id: 3,
        name: 'Bang & Olufsen Beoplay H95 Hi-Res',
        sku: 'BO-H95-INDIGO',
        color: 'Midnight Navy',
        price: 999.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80'
      }
    ]
  }
];

const SAVED_VOUCHERS = [
  {
    code: 'VIP20',
    title: 'Đặc Quyền Titanium',
    discount: 'Giảm 20% đơn từ $1,000',
    expiry: 'Hạn dùng: 30/09/2026'
  },
  {
    code: 'SMART50',
    title: 'Khách Hàng Thân Thiết',
    discount: 'Giảm $50 toàn sàn',
    expiry: 'Hạn dùng: 15/10/2026'
  },
  {
    code: 'FREESHIP',
    title: 'Vận Chuyển Hỏa Tốc',
    discount: 'Miễn 100% phí giao siêu tốc',
    expiry: 'Vĩnh viễn'
  }
];

const CustomerPortal = ({ onAddToCart }) => {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [copiedCode, setCopiedCode] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Hàng không đúng mô tả');
  const [disputeEvidence, setDisputeEvidence] = useState(null);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [repurchaseSuccess, setRepurchaseSuccess] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleRepurchase = (order) => {
    order.items.forEach(item => {
      onAddToCart(item);
    });
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
            {SAVED_VOUCHERS.map(v => (
              <div key={v.code} className="voucher-ticket surface-card">
                <div className="ticket-left">
                  <span className="ticket-code mono-num">{v.code}</span>
                  <span className="ticket-title">{v.title}</span>
                  <span className="ticket-disc">{v.discount}</span>
                  <span className="ticket-exp micro-label">{v.expiry}</span>
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
            <span className="mono-num micro-label">{orders.length} Đơn gần nhất</span>
          </div>

          <div className="orders-timeline-stack">
            {orders.map(order => (
              <div key={order.id} className="order-item-card surface-card">
                <div className="order-card-top">
                  <div className="order-id-group">
                    <Package size={18} color="var(--primary-brand)" />
                    <span className="order-code mono-num">#{order.id}</span>
                    <span className="order-date micro-label">{order.date}</span>
                  </div>
                  <div className="order-amount-group">
                    <span className="micro-label">Tổng thanh toán:</span>
                    <strong className="mono-num order-price">${order.total.toFixed(2)}</strong>
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
                        <span className="step-time micro-label mono-num">14:15</span>
                      </div>
                    </div>

                    {/* Step 2: Packed */}
                    <div className="timeline-step completed">
                      <div className="step-metal-node">
                        <Check size={12} />
                      </div>
                      <div className="step-meta">
                        <span className="step-title">Đã Đóng Gói</span>
                        <span className="step-time micro-label mono-num">14:40</span>
                      </div>
                    </div>

                    {/* Step 3: In Transit */}
                    <div className={`timeline-step ${order.status === 'IN_TRANSIT' ? 'active-pulse' : order.status === 'DELIVERED' ? 'completed' : ''}`}>
                      <div className="step-metal-node">
                        {order.status === 'DELIVERED' ? <Check size={12} /> : <Truck size={13} />}
                      </div>
                      <div className="step-meta">
                        <span className="step-title">Đang Vận Chuyển</span>
                        <span className="step-time micro-label mono-num">15:10</span>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className={`timeline-step ${order.status === 'DELIVERED' ? 'completed' : ''}`}>
                      <div className="step-metal-node">
                        <CheckCircle2 size={13} />
                      </div>
                      <div className="step-meta">
                        <span className="step-title">Giao Thành Công</span>
                        <span className="step-time micro-label mono-num">
                          {order.status === 'DELIVERED' ? 'Hoàn tất' : 'Dự kiến 16:45'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPS MOCK STATUS (When IN_TRANSIT) */}
                {order.shipper && order.status === 'IN_TRANSIT' && (
                  <div className="shipper-live-box">
                    <div className="shipper-info-left">
                      <div className="pulse-indicator">
                        <div className="pulse-dot" />
                        <span className="micro-label" style={{ color: 'var(--success-status)' }}>GPS LIVE TRACKING</span>
                      </div>
                      <p className="shipper-name">{order.shipper.name}</p>
                      <div className="shipper-loc-text">
                        <MapPin size={14} color="var(--primary-glow)" />
                        <span>{order.shipper.currentLocation}</span>
                      </div>
                      <div className="shipper-phone-text">
                        <Phone size={13} />
                        <span>{order.shipper.phone} • {order.shipper.vehicle}</span>
                      </div>
                    </div>

                    <div className="eta-badge-card">
                      <Clock size={16} color="var(--warning-status)" />
                      <div>
                        <span className="micro-label">Dự kiến giao hàng</span>
                        <strong>{order.eta}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Item List & Actions */}
                <div className="order-items-sublist">
                  {order.items.map(item => (
                    <div key={item.id} className="sub-item-row">
                      <img src={item.image} alt={item.name} className="sub-item-thumb" />
                      <div className="sub-item-details">
                        <h5>{item.name}</h5>
                        <div className="sub-item-tags">
                          <span className="mono-num micro-label">SKU: {item.sku}</span>
                          <span className="mono-num micro-label">Màu: {item.color}</span>
                          <span className="mono-num micro-label">x{item.quantity}</span>
                        </div>
                      </div>
                      <span className="sub-item-price mono-num">${item.price.toFixed(2)}</span>
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
            ))}
          </div>
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
