import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Star, 
  Flame, 
  ShoppingCart,
  Layers,
  MessageSquare,
  Send,
  User
} from 'lucide-react';
import { reviewService } from '../services/review';
import './ProductDetailDrawer.css';

const ProductDetailDrawer = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart 
}) => {
  if (!isOpen || !product) return null;

  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default'
  );
  const [selectedCapacity, setSelectedCapacity] = useState(
    product.capacities && product.capacities.length > 0 ? product.capacities[0] : '512GB'
  );
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [addedState, setAddedState] = useState(false);

  const images = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image, product.hoverImage || product.image];

  const handleAdd = () => {
    setAddedState(true);
    onAddToCart({
      ...product,
      color: selectedColor,
      capacity: selectedCapacity
    });
    setTimeout(() => {
      setAddedState(false);
    }, 1200);
  };

  // Review states & fetching
  const [reviewSummary, setReviewSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewHover, setNewReviewHover] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (product && product.id) {
      setReviewsLoading(true);
      reviewService.getProductReviews(product.id)
        .then(data => setReviewSummary(data))
        .catch(() => setReviewSummary(null))
        .finally(() => setReviewsLoading(false));
    }
  }, [product?.id]);

  const handleDrawerReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      alert('Vui lòng nhập nhận xét của bạn.');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.submitReview({
        productId: product.id,
        rating: newReviewRating,
        comment: newReviewComment
      });
      setSubmitSuccess(true);
      const updated = await reviewService.getProductReviews(product.id);
      setReviewSummary(updated);
      setTimeout(() => {
        setSubmitSuccess(false);
        setNewReviewComment('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pdp-backdrop" onClick={onClose}>
      <div className="pdp-modal surface-elevate-2" onClick={e => e.stopPropagation()}>
        <button className="pdp-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* 60% Left Gallery & 40% Right Sticky Specs */}
        <div className="pdp-layout">
          {/* Left Column: Gallery */}
          <div className="pdp-gallery-col">
            <div className="pdp-main-viewport">
              <img 
                src={images[activeImgIndex] || product.image} 
                alt={product.name} 
                className="pdp-featured-img"
              />
              <div className="pdp-badge-overlay">
                <span className="pdp-tag-chip">
                  <Sparkles size={13} /> {product.badge || 'Flagship Grade'}
                </span>
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="pdp-thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb-btn ${activeImgIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImgIndex(idx)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </button>
              ))}
            </div>

            {/* Tab Selector: Specs vs Customer Reviews */}
            <div className="pdp-tab-headers" style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.5rem'
            }}>
              <button
                type="button"
                className={`pdp-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
                style={{
                  background: activeTab === 'specs' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: '1px solid',
                  borderColor: activeTab === 'specs' ? 'var(--primary-glow)' : 'transparent',
                  color: activeTab === 'specs' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'specs' ? 600 : 400
                }}
              >
                Kiến Trúc Kỹ Thuật
              </button>
              <button
                type="button"
                className={`pdp-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
                style={{
                  background: activeTab === 'reviews' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: activeTab === 'reviews' ? '#f59e0b' : 'transparent',
                  color: activeTab === 'reviews' ? '#f59e0b' : 'var(--text-secondary)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: activeTab === 'reviews' ? 600 : 400
                }}
              >
                <Star size={13} fill={activeTab === 'reviews' ? '#f59e0b' : 'none'} color="#f59e0b" />
                <span>Đánh Giá ({reviewSummary ? reviewSummary.totalReviews : (product.reviews || 0)})</span>
              </button>
            </div>

            {activeTab === 'specs' ? (
              /* Product Tech Highlights / Story */
              <div className="pdp-specs-accordion">
                <h4>Kiến Trúc & Điểm Nhấn Công Nghệ</h4>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label micro-label">Vật liệu hoàn thiện</span>
                    <span className="spec-val">Titanium Hàng Không Vũ Trụ Cấp 5</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label micro-label">Chuẩn kết nối</span>
                    <span className="spec-val">Thunderbolt 4 / Wi-Fi 7 Cực Tốc</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label micro-label">Chế độ hiển thị</span>
                    <span className="spec-val">Micro-OLED 23 triệu điểm ảnh</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label micro-label">Bảo hành chính hãng</span>
                    <span className="spec-val">24 Tháng Toàn Cầu (AppleCare+)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CUSTOMER REVIEWS TAB CONTENT */
              <div className="pdp-reviews-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Average Score & Star Breakdown */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-card)'
                }}>
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--border-subtle)', paddingRight: '1rem' }}>
                    <span className="mono-num" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
                      {reviewSummary ? reviewSummary.averageRating.toFixed(1) : (product.rating || 5.0).toFixed(1)}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '0.4rem 0' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={13}
                          fill={(reviewSummary ? reviewSummary.averageRating : (product.rating || 5.0)) >= s ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                    <span className="micro-label" style={{ color: 'var(--text-muted)' }}>
                      {reviewSummary ? reviewSummary.totalReviews : (product.reviews || 0)} lượt đánh giá
                    </span>
                  </div>

                  {/* Distribution Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = (reviewSummary && reviewSummary.distribution) ? (reviewSummary.distribution[stars] || 0) : (stars === 5 ? (product.reviews || 100) : 0);
                      const total = reviewSummary ? Math.max(1, reviewSummary.totalReviews) : Math.max(1, product.reviews || 100);
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                          <span style={{ width: '28px', color: 'var(--text-secondary)' }}>{stars} ★</span>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                          </div>
                          <span className="mono-num" style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write a review quick form */}
                <form onSubmit={handleDrawerReviewSubmit} style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.03)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Viết đánh giá của bạn</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => {
                        const isFilled = (newReviewHover || newReviewRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            onMouseEnter={() => setNewReviewHover(star)}
                            onMouseLeave={() => setNewReviewHover(0)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                          >
                            <Star size={16} fill={isFilled ? '#f59e0b' : 'none'} color="#f59e0b" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="Cảm nhận thực tế của bạn về sản phẩm này..."
                      value={newReviewComment}
                      onChange={e => setNewReviewComment(e.target.value)}
                      style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submittingReview}
                      style={{
                        padding: '0.5rem 0.9rem',
                        fontSize: '0.8rem',
                        background: '#f59e0b',
                        border: 'none',
                        color: '#000',
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {submitSuccess ? 'Đã Gửi!' : submittingReview ? '...' : 'Gửi'}
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {reviewsLoading ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Đang tải đánh giá...
                    </div>
                  ) : (!reviewSummary || !reviewSummary.reviews || reviewSummary.reviews.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ!
                    </div>
                  ) : (
                    reviewSummary.reviews.map(rev => (
                      <div key={rev.id} style={{
                        padding: '0.85rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--primary-glow)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 700
                            }}>
                              {(rev.authorName || 'K')[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {rev.authorName}
                            </span>
                            <span className="micro-label" style={{
                              background: 'rgba(245, 158, 11, 0.12)',
                              color: '#f59e0b',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontSize: '0.65rem'
                            }}>
                              {rev.authorTier || 'VERIFIED'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '1px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={11}
                                fill={rev.rating >= s ? '#f59e0b' : 'none'}
                                color="#f59e0b"
                              />
                            ))}
                          </div>
                        </div>

                        <p style={{ margin: '0.35rem 0 0.25rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {rev.comment}
                        </p>
                        <span className="micro-label mono-num" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'} • Đã mua hàng
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Spec & Actions (40%) */}
          <div className="pdp-details-col">
            <div className="pdp-brand-row">
              <span className="pdp-brand-name micro-label">{product.brand || 'SMART ARCHITECTURE'}</span>
              <div 
                className="pdp-rating" 
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span className="rating-score mono-num">
                  {reviewSummary ? reviewSummary.averageRating.toFixed(1) : (product.rating || 5.0).toFixed(1)}
                </span>
                <span className="rating-count">
                  ({reviewSummary ? reviewSummary.totalReviews : (product.reviews || 0)} đánh giá xác thực)
                </span>
              </div>
            </div>

            <h2 className="pdp-title">{product.name}</h2>
            <div className="pdp-sku-row">
              <span className="sku-tag micro-label">SKU:</span>
              <span className="mono-num sku-code">{product.sku || 'SKU-旗舰-889'}</span>
            </div>

            {/* Price & Urgency Bar */}
            <div className="pdp-pricing-box">
              <div className="price-row">
                <span className="pdp-price mono-num">${parseFloat(product.price).toFixed(2)}</span>
                {product.oldPrice && (
                  <span className="pdp-old-price mono-num">${parseFloat(product.oldPrice).toFixed(2)}</span>
                )}
                <span className="pdp-save-badge">Tiết kiệm 15%</span>
              </div>

              {/* Urgency Cue & Stock Meter */}
              <div className="stock-urgency-box">
                <div className="urgency-header">
                  <span className="urgency-text">
                    <Flame size={14} color="var(--warning-status)" />
                    Chỉ còn <strong>{product.stock || 3} sản phẩm</strong> tại kho trung tâm
                  </span>
                  <span className="micro-label mono-num" style={{ color: 'var(--warning-status)' }}>
                    Bán chạy
                  </span>
                </div>
                <div className="stock-meter-track">
                  <div 
                    className="stock-meter-fill" 
                    style={{ width: `${Math.min(100, ((product.stock || 3) / 10) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>

            {/* Color Swatch Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="variant-block">
                <label className="variant-label">
                  Màu sắc: <strong>{selectedColor}</strong>
                </label>
                <div className="color-swatches-row">
                  {product.colors.map(col => (
                    <button
                      key={col.name}
                      className={`color-pill-btn ${selectedColor === col.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(col.name)}
                    >
                      <span className="swatch-circle" style={{ backgroundColor: col.hex }} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity Selector */}
            {product.capacities && product.capacities.length > 0 && (
              <div className="variant-block">
                <label className="variant-label">
                  Dung lượng lưu trữ: <strong>{selectedCapacity}</strong>
                </label>
                <div className="capacity-pills-row">
                  {product.capacities.map(cap => (
                    <button
                      key={cap}
                      className={`capacity-pill ${selectedCapacity === cap ? 'active' : ''}`}
                      onClick={() => setSelectedCapacity(cap)}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Action Buttons */}
            <div className="pdp-cta-group">
              <button 
                className={`btn-primary pdp-add-cart-btn ${addedState ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {addedState ? (
                  <>
                    <Check size={18} />
                    <span>Đã Thêm Vào Giỏ Hàng!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Thêm Vào Giỏ Hàng • ${parseFloat(product.price).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Assurance Signals */}
            <div className="pdp-trust-grid">
              <div className="trust-item">
                <Truck size={16} color="var(--primary-brand)" />
                <div className="trust-text">
                  <strong>Vận chuyển hỏa tốc 2H</strong>
                  <p>Giao nguyên seal tận tay</p>
                </div>
              </div>
              <div className="trust-item">
                <ShieldCheck size={16} color="var(--success-status)" />
                <div className="trust-text">
                  <strong>Cam kết chính hãng 100%</strong>
                  <p>Đền gấp 10 lần nếu phát hiện hàng giả</p>
                </div>
              </div>
              <div className="trust-item">
                <RotateCcw size={16} color="var(--warning-status)" />
                <div className="trust-text">
                  <strong>Đổi mới 30 ngày</strong>
                  <p>1 đổi 1 nếu có lỗi từ nhà sản xuất</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailDrawer;
