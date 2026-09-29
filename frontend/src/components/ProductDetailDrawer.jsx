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
  Layers
} from 'lucide-react';
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

            {/* Product Tech Highlights / Story */}
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
          </div>

          {/* Right Column: Sticky Spec & Actions (40%) */}
          <div className="pdp-details-col">
            <div className="pdp-brand-row">
              <span className="pdp-brand-name micro-label">{product.brand || 'SMART ARCHITECTURE'}</span>
              <div className="pdp-rating">
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span className="rating-score mono-num">4.9</span>
                <span className="rating-count">(382 đánh giá xác thực)</span>
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
