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
  ArrowUpRight,
  Ban,
  Star
} from 'lucide-react';
import { orderService } from '../services/order';
import { voucherService } from '../services/voucher';
import { authService } from '../services/auth';
import { customerService } from '../services/customer';
import { reviewService } from '../services/review';
import './CustomerPortal.css';

const CustomerPortal = ({ onAddToCart }) => {
  const [orders, setOrders] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loyaltyProfile, setLoyaltyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [disputeReason, setDisputeReason] = useState('Hàng không đúng mô tả');
  const [disputeEvidence, setDisputeEvidence] = useState(null);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [repurchaseSuccess, setRepurchaseSuccess] = useState(null);

  // Status Filter Tabs & Cancel Order states
  const [selectedTab, setSelectedTab] = useState('ALL');
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Đổi ý, không muốn mua nữa');
  const [cancelling, setCancelling] = useState(false);

  // Review Modal states
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [selectedProductToReview, setSelectedProductToReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const currentUser = authService.getCurrentUser();

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [orderData, voucherData, loyaltyData] = await Promise.all([
        orderService.getMyOrders().catch(() => []),
        voucherService.getAllVouchers().catch(() => []),
        customerService.getLoyaltyProfile().catch(() => null)
      ]);
      setOrders(orderData || []);
      setVouchers(voucherData || []);
      setLoyaltyProfile(loyaltyData);
    } catch (err) {
      console.error('Failed to load customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
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

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(cancelModalOrder.id, cancelReason);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      setCancelModalOrder(null);
      alert('Đã hủy đơn hàng thành công. Toàn bộ sản phẩm đã được tự động hoàn lại vào kho hàng!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể hủy đơn hàng này.');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReviewModal = (order) => {
    setReviewModalOrder(order);
    if (order.items && order.items.length > 0) {
      setSelectedProductToReview(order.items[0]);
    }
    setReviewRating(5);
    setHoverRating(0);
    setReviewComment('');
    setReviewSuccess(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedProductToReview) return;
    setReviewSubmitting(true);
    try {
      await reviewService.submitReview({
        productId: selectedProductToReview.productId || selectedProductToReview.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOrder(null);
        setReviewSuccess(false);
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể gửi đánh giá.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'PENDING') return order.status === 'PENDING';
    if (selectedTab === 'SHIPPING') return ['PROCESSING', 'SHIPPING'].includes(order.status);
    if (selectedTab === 'COMPLETED') return ['COMPLETED', 'DELIVERED'].includes(order.status);
    if (selectedTab === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="customer-portal-page">
      <div className="portal-container">
        {/* TOP: MEMBER LOYALTY TIER HEADER (Calculated by Backend) */}
        <section className="member-hero-card surface-card">
          <div className="member-tier-info">
            <div className="tier-badge-pill">
              <Award size={16} />
              <span>HẠNG THÀNH VIÊN {loyaltyProfile?.tierTitle || 'STANDARD MEMBER'}</span>
            </div>
            <h2>Chào Mừng Trở Lại, {loyaltyProfile?.fullName || loyaltyProfile?.username || currentUser?.username || 'Quý Khách'}</h2>
            <p>
              Tích lũy chi tiêu:{' '}
              <strong className="mono-num">
                ${(loyaltyProfile?.totalSpent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {loyaltyProfile?.nextTierName ? ` / $${(loyaltyProfile?.targetSpend ?? 0).toLocaleString('en-US')}` : ''}
              </strong>{' '}
              {loyaltyProfile?.nextTierName 
                ? `để nâng hạng ${loyaltyProfile.nextTierName} vĩnh viễn.` 
                : 'Bạn đang sở hữu hạng mức đặc quyền cao nhất sàn.'}
            </p>
            
            <div className="loyalty-progress-box">
              <div className="loyalty-bar-track">
                <div className="loyalty-bar-fill" style={{ width: `${loyaltyProfile?.progressPercentage ?? 0}%` }} />
              </div>
              <div className="loyalty-levels mono-num">
                {loyaltyProfile?.tierLevels ? (
                  loyaltyProfile.tierLevels.map((lvl, idx) => (
                    <span key={idx} className={lvl.includes('Hiện tại') ? 'current-level' : ''}>{lvl}</span>
                  ))
                ) : (
                  <>
                    <span>Khởi đầu</span>
                    <span className="current-level">Standard (Hiện tại)</span>
                    <span>Silver ($1K)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="member-perks-box">
            <div className="perk-item">
              <Sparkles size={16} color="var(--primary-glow)" />
              <div>
                <strong>Hoàn tiền {loyaltyProfile?.cashbackRate || '1.0%'}</strong>
                <p>Cộng trực tiếp vào ví xu</p>
              </div>
            </div>
            <div className="perk-item">
              <Truck size={16} color="var(--success-status)" />
              <div>
                <strong>{loyaltyProfile?.shippingPrivilege || 'Giao hàng tiêu chuẩn toàn quốc'}</strong>
                <p>Dịch vụ vận chuyển liên kết sàn</p>
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

          {/* STATUS FILTER TABS */}
          <div className="orders-status-tabs">
            {[
              { id: 'ALL', label: 'Tất Cả', count: orders.length },
              { id: 'PENDING', label: 'Chờ Xác Nhận', count: orders.filter(o => o.status === 'PENDING').length },
              { id: 'SHIPPING', label: 'Đang Vận Chuyển', count: orders.filter(o => ['PROCESSING', 'SHIPPING'].includes(o.status)).length },
              { id: 'COMPLETED', label: 'Đã Hoàn Tất', count: orders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status)).length },
              { id: 'CANCELLED', label: 'Đã Hủy', count: orders.filter(o => o.status === 'CANCELLED').length }
            ].map(tab => (
              <button
                key={tab.id}
                className={`status-tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && <span className="tab-counter-badge mono-num">{tab.count}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="orders-loading-box" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span>Đang tải danh sách đơn hàng...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty-card surface-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <Package size={48} color="var(--primary-glow)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Không có đơn hàng nào</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                {selectedTab === 'ALL' 
                  ? 'Bạn chưa thực hiện đơn đặt hàng nào. Hãy khám phá ngay các sản phẩm công nghệ tuyệt tác tại Cửa hàng Smart Store!' 
                  : `Không có đơn hàng nào ở trạng thái này.`}
              </p>
              <a href="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', padding: '0.75rem 1.5rem' }}>
                Khám Phá Cửa Hàng <ChevronRight size={16} />
              </a>
            </div>
          ) : (
            <div className="orders-timeline-stack">
              {filteredOrders.map(order => {
                const orderCode = order.orderCode || ('ORD-' + order.id);
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới đặt';
                const totalVal = Number(order.totalAmount || 0);
                const isStep2 = ['PROCESSING', 'COMPLETED', 'SHIPPING', 'DELIVERED'].includes(order.status);
                const isStep3Active = ['PROCESSING', 'SHIPPING'].includes(order.status);
                const isStep3Done = ['COMPLETED', 'DELIVERED'].includes(order.status);
                const isStep4Done = ['COMPLETED', 'DELIVERED'].includes(order.status);
                const isCancelled = order.status === 'CANCELLED';

                return (
                  <div key={order.id} className={`order-item-card surface-card ${isCancelled ? 'order-cancelled-card' : ''}`}>
                    <div className="order-card-top">
                      <div className="order-id-group">
                        <Package size={18} color="var(--primary-brand)" />
                        <span className="order-code mono-num">{orderCode}</span>
                        <span className="order-date micro-label">{orderDate}</span>
                        <span className={`status-pill ${order.status?.toLowerCase() || 'pending'}`} style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          background: isCancelled ? 'rgba(239, 68, 68, 0.15)' : isStep4Done ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: isCancelled ? 'var(--critical-status)' : isStep4Done ? 'var(--success-status)' : 'var(--primary-glow)',
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

                    {/* CANCELLED BANNER OR 4-STEP METALLIC TIMELINE TRACKER */}
                    {isCancelled ? (
                      <div className="order-cancelled-banner">
                        <div className="cancelled-banner-icon">
                          <Ban size={18} color="var(--critical-status)" />
                        </div>
                        <div className="cancelled-banner-text">
                          <strong>Đơn hàng đã được hủy</strong>
                          <span>Toàn bộ sản phẩm trong đơn đã được hoàn trả lại kho hàng. Bạn không bị tính bất kỳ chi phí nào.</span>
                        </div>
                      </div>
                    ) : (
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
                    )}

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
                          <span>Người nhận: <strong>{order.recipientName}</strong>{order.phone ? ` - ${order.phone}` : ''}</span>
                        </div>
                        <div style={{ opacity: 0.6 }}>•</div>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span>{order.addressLine}, {order.city}</span>
                        </div>
                        {order.trackingNumber && (
                          <>
                            <div style={{ opacity: 0.6 }}>•</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary-glow)' }}>
                              <Truck size={13} />
                              <span className="mono-num"><strong>{order.carrier || 'Viettel Post'}:</strong> {order.trackingNumber}</span>
                            </div>
                          </>
                        )}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {order.eta && (
                            <span className="micro-label" style={{ color: 'var(--text-secondary)' }}>
                              ETA: <strong className="mono-num">{order.eta}</strong>
                            </span>
                          )}
                          <span className={`status-pill ${order.paymentStatus === 'SUCCESS' ? 'completed' : 'pending'}`} style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            background: order.paymentStatus === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: order.paymentStatus === 'SUCCESS' ? 'var(--success-status)' : '#f59e0b',
                            fontWeight: '600'
                          }}>
                            {order.paymentStatus === 'SUCCESS' ? '✓ ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                          </span>
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

                      {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
                        <button 
                          className="btn-secondary review-order-action-btn"
                          onClick={() => handleOpenReviewModal(order)}
                          style={{
                            borderColor: '#f59e0b',
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'rgba(245, 158, 11, 0.08)'
                          }}
                        >
                          <Star size={15} fill="#f59e0b" color="#f59e0b" />
                          <span>Đánh Giá Sản Phẩm</span>
                        </button>
                      )}

                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && order.status !== 'DELIVERED' && (
                        <button 
                          className="btn-secondary cancel-order-action-btn"
                          onClick={() => setCancelModalOrder(order)}
                        >
                          <Ban size={15} color="var(--critical-status)" />
                          <span>Hủy Đơn Hàng</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* CANCEL ORDER MODAL */}
      {cancelModalOrder && (
        <div className="dispute-modal-backdrop" onClick={() => setCancelModalOrder(null)}>
          <div className="dispute-dialog surface-elevate-2 cancel-dialog" onClick={e => e.stopPropagation()}>
            <div className="dispute-header">
              <div className="dispute-title-wrap">
                <Ban size={20} color="var(--critical-status)" />
                <h3>Xác Nhận Hủy Đơn Hàng #{cancelModalOrder.id}</h3>
              </div>
              <button className="dispute-close-btn" onClick={() => setCancelModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="cancel-modal-body" style={{ padding: '1rem 0' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                Bạn có chắc chắn muốn hủy đơn hàng <strong className="mono-num" style={{ color: 'var(--text-primary)' }}>{cancelModalOrder.orderCode || ('ORD-' + cancelModalOrder.id)}</strong>? 
                Toàn bộ sản phẩm trong đơn sẽ được hoàn trả lại kho và đơn hàng sẽ kết thúc.
              </p>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="micro-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Vui lòng chọn lý do hủy đơn:
                </label>
                <select 
                  className="input-control"
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--surface-elevate-1)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '8px' }}
                >
                  <option value="Đổi ý, không muốn mua nữa">Đổi ý, không muốn mua nữa</option>
                  <option value="Muốn thay đổi địa chỉ nhận hàng / số điện thoại">Muốn thay đổi địa chỉ nhận hàng / số điện thoại</option>
                  <option value="Muốn thêm hoặc bớt sản phẩm khác">Muốn thêm hoặc bớt sản phẩm khác</option>
                  <option value="Thời gian giao hàng dự kiến quá lâu">Thời gian giao hàng dự kiến quá lâu</option>
                  <option value="Tìm thấy giá tốt hơn ở nơi khác">Tìm thấy giá tốt hơn ở nơi khác</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setCancelModalOrder(null)}
                  disabled={cancelling}
                >
                  Giữ Lại Đơn Hàng
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  style={{ background: 'var(--critical-status)', borderColor: 'var(--critical-status)' }}
                >
                  {cancelling ? 'Đang Hủy Đơn...' : 'Xác Nhận Hủy Đơn'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* REVIEW & RATING MODAL */}
      {reviewModalOrder && selectedProductToReview && (
        <div className="dispute-modal-backdrop" onClick={() => setReviewModalOrder(null)}>
          <div className="dispute-dialog surface-elevate-2 review-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="dispute-header">
              <div className="dispute-title-wrap">
                <Star size={20} fill="#f59e0b" color="#f59e0b" />
                <h3>Đánh Giá Sản Phẩm</h3>
              </div>
              <button className="dispute-close-btn" onClick={() => setReviewModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            {reviewSuccess ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                <CheckCircle2 size={48} color="var(--success-status)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Gửi Đánh Giá Thành Công!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Cảm ơn bạn đã phản hồi. Đánh giá của bạn giúp cộng đồng Smart Store mua sắm thông minh hơn!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} style={{ padding: '1rem 0' }}>
                {/* Product selector if order has multiple items */}
                {reviewModalOrder.items && reviewModalOrder.items.length > 1 && (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="micro-label" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                      Chọn sản phẩm muốn đánh giá:
                    </label>
                    <select
                      className="input-control"
                      value={selectedProductToReview.id || selectedProductToReview.productId}
                      onChange={e => {
                        const item = reviewModalOrder.items.find(it => (it.id || it.productId) == e.target.value);
                        if (item) setSelectedProductToReview(item);
                      }}
                    >
                      {reviewModalOrder.items.map(it => (
                        <option key={it.id || it.productId} value={it.id || it.productId}>
                          {it.productName || it.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected item card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem'
                }}>
                  <img
                    src={selectedProductToReview.imageUrl || selectedProductToReview.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=120&q=80'}
                    alt={selectedProductToReview.productName || selectedProductToReview.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {selectedProductToReview.productName || selectedProductToReview.name}
                    </h5>
                    <span className="micro-label mono-num" style={{ color: 'var(--text-muted)' }}>
                      Đơn hàng #{reviewModalOrder.id} • Mã: {reviewModalOrder.orderCode || ('ORD-' + reviewModalOrder.id)}
                    </span>
                  </div>
                </div>

                {/* Interactive Star Rating */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.04)', borderRadius: 'var(--radius-sm)' }}>
                  <label className="micro-label" style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                    Chất lượng sản phẩm tổng thể:
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => {
                      const isFilled = (hoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Star
                            size={28}
                            fill={isFilled ? '#f59e0b' : 'transparent'}
                            color={isFilled ? '#f59e0b' : 'var(--text-muted)'}
                            style={{ filter: isFilled ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))' : 'none' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ display: 'block', marginTop: '0.5rem', fontWeight: 600, color: '#f59e0b', fontSize: '0.9rem' }}>
                    {['', '1/5 Sao - Rất tệ', '2/5 Sao - Chưa hài lòng', '3/5 Sao - Bình thường', '4/5 Sao - Hài lòng', '5/5 Sao - Tuyệt vời'][hoverRating || reviewRating]}
                  </span>
                </div>

                {/* Quick praise tags */}
                <div style={{ marginBottom: '1rem' }}>
                  <label className="micro-label" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Điểm nổi bật (nhấp để thêm nhanh):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {['Chính hãng 100%', 'Giao hàng siêu tốc', 'Đóng gói cẩn thận', 'Chất lượng xuất sắc', 'Đáng giá tiền'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setReviewComment(prev => prev ? `${prev}, ${tag.toLowerCase()}` : tag)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '16px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="micro-label" style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Nhận xét chi tiết của bạn:
                  </label>
                  <textarea
                    className="input-control"
                    rows={4}
                    placeholder="Hãy chia sẻ trải nghiệm thực tế của bạn về chất lượng hoàn thiện, tính năng hoặc tốc độ giao hàng..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Submit buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setReviewModalOrder(null)}
                    disabled={reviewSubmitting}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={reviewSubmitting}
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff' }}
                  >
                    {reviewSubmitting ? 'Đang Gửi Đánh Giá...' : 'Gửi Đánh Giá Ngay'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
