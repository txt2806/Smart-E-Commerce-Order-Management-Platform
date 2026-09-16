import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Star,
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  Glasses,
  Headphones,
  Keyboard,
  ChevronRight,
  MessageCircle,
  CreditCard,
  RefreshCw,
  Gift
} from 'lucide-react';
import { productService } from '../services/product';
import { categoryService } from '../services/category';
import './Storefront.css';

const CATEGORY_ICONS = {
  'Mac': Laptop,
  'iPhone': Smartphone,
  'iPad': Tablet,
  'Apple Watch': Watch,
  'Apple Vision Pro': Glasses,
  'AirPods & Âm Thanh': Headphones,
  'Màn Hình & Phụ Kiện': Keyboard
};

const Storefront = ({ onAddToCart, onOpenPDP }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [cardAddedMap, setCardAddedMap] = useState({});

  useEffect(() => {
    const loadStoreData = async () => {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories()
        ]);
        setProducts(prods || []);
        setCategories(cats || []);
      } catch (err) {
        console.error("Failed to load products from database:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStoreData();
  }, []);

  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    const pid = product.id;
    setCardAddedMap(prev => ({ ...prev, [pid]: 'loading' }));

    setTimeout(() => {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.basePrice),
        image: product.imageUrl,
        sku: product.sku,
        stock: product.stock
      });
      setCardAddedMap(prev => ({ ...prev, [pid]: 'success' }));
      setTimeout(() => {
        setCardAddedMap(prev => ({ ...prev, [pid]: null }));
      }, 1200);
    }, 380);
  };

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && String(p.categoryId) !== String(selectedCategory)) {
      return false;
    }
    if (searchFilter && !p.name.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Featured flagship spotlights (The Latest Carousel)
  const visionPro = products.find(p => p.sku === 'AP-VISPRO-M2') || products[0];
  const iphone16Pro = products.find(p => p.sku === 'IP-16PM-256') || products[1];
  const macbookPro = products.find(p => p.sku === 'MB-M3MAX-16') || products[2];
  const appleWatch = products.find(p => p.sku === 'AW-ULTRA2-BLK') || products[3];

  const featuredSpotlights = [visionPro, iphone16Pro, macbookPro, appleWatch].filter(Boolean);

  return (
    <div className="apple-store-container">
      {/* 1. STORE PROMO TOP RIBBON */}
      <div className="apple-promo-ribbon">
        <div className="promo-ribbon-content">
          <span>
            Ưu đãi thành viên Smart Store: Miễn phí vận chuyển toàn quốc và bảo hành chính hãng 12 tháng.
          </span>
          <a href="#collection" className="promo-link">Khám phá ngay <ChevronRight size={13} /></a>
        </div>
      </div>

      <div className="apple-store-main">
        {/* 2. SIGNATURE STORE HEADER */}
        <section className="apple-header-block">
          <div className="apple-headline-wrap">
            <h1 className="apple-store-title">
              <span className="title-bold">Smart Store.</span>
              <span className="title-sub">Cách tốt nhất để sở hữu những thiết bị công nghệ bạn yêu thích.</span>
            </h1>
          </div>

          <div className="apple-specialist-card">
            <div className="specialist-avatar">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                alt="Chuyên viên Smart Store" 
              />
            </div>
            <div className="specialist-text">
              <span className="specialist-label">Bạn cần trợ giúp mua sắm?</span>
              <a href="#chat" className="specialist-action" onClick={(e) => { e.preventDefault(); alert("Chuyên viên tư vấn Smart Store trực tuyến: 1900-8899 (Miễn phí tư vấn)."); }}>
                Hỏi Chuyên Viên Tư Vấn <ChevronRight size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* 3. APPLE PRODUCT FAMILY CAROUSEL (CATEGORIES) */}
        <nav className="apple-family-strip">
          <div className="family-strip-scroll">
            <button
              className={`family-item-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <div className="family-icon-box">
                <Sparkles size={26} />
              </div>
              <span className="family-name">Tất Cả Sản Phẩm</span>
            </button>

            {categories.map(cat => {
              const Icon = CATEGORY_ICONS[cat.name] || Sparkles;
              const isActive = String(selectedCategory) === String(cat.id);
              return (
                <button
                  key={cat.id}
                  className={`family-item-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(String(cat.id))}
                >
                  <div className="family-icon-box">
                    <Icon size={26} />
                  </div>
                  <span className="family-name">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* 4. THE LATEST. TAKE A LOOK AT WHAT'S NEW (CAROUSEL / BENTO) */}
        <section className="apple-section-spotlight">
          <div className="section-title-row">
            <h2>
              <span className="heading-bold">Thế hệ mới nhất.</span>
              <span className="heading-light">Khám phá các tuyệt tác vừa ra mắt.</span>
            </h2>
          </div>

          <div className="spotlight-cards-scroll">
            {featuredSpotlights.map((item, idx) => (
              <div 
                key={item.id} 
                className={`spotlight-card card-variant-${idx}`}
                onClick={() => onOpenPDP({
                  ...item,
                  price: parseFloat(item.basePrice),
                  image: item.imageUrl
                })}
              >
                <div className="spotlight-card-content">
                  <span className="spotlight-badge micro-label">{item.badge || 'MỚI'}</span>
                  <h3 className="spotlight-title">{item.name}</h3>
                  <p className="spotlight-sub">{item.subname}</p>
                  <span className="spotlight-price mono-num">
                    Từ ${parseFloat(item.basePrice).toFixed(2)} hoặc ${(parseFloat(item.basePrice)/12).toFixed(2)}/tháng
                  </span>
                </div>
                <div className="spotlight-card-image">
                  <img src={item.imageUrl} alt={item.name} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. ALL PRODUCTS SHOWCASE (APPLE STORE GRID - 29 DATABASE PRODUCTS) */}
        <section id="collection" className="apple-products-section">
          <div className="section-title-row">
            <div>
              <h2>
                <span className="heading-bold">Tất cả sản phẩm.</span>
                <span className="heading-light">Dữ liệu thực tế từ cơ sở dữ liệu ({filteredProducts.length} sản phẩm).</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="apple-product-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="apple-product-card skeleton-card">
                  <div className="skeleton" style={{ width: '100%', height: '260px' }} />
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="skeleton" style={{ width: '50%', height: '14px' }} />
                    <div className="skeleton" style={{ width: '80%', height: '22px' }} />
                    <div className="skeleton" style={{ width: '60%', height: '14px' }} />
                    <div className="skeleton" style={{ width: '40%', height: '26px', marginTop: '16px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="apple-product-grid">
              {filteredProducts.map(product => {
                const addedStatus = cardAddedMap[product.id];
                const price = parseFloat(product.basePrice);

                return (
                  <div 
                    key={product.id} 
                    className="apple-product-card"
                    onClick={() => onOpenPDP({
                      ...product,
                      price,
                      image: product.imageUrl,
                      hoverImage: product.hoverImageUrl
                    })}
                  >
                    {/* Visual box with smooth hover zoom */}
                    <div className="product-visual-container">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="product-main-render" 
                      />
                      {product.hoverImageUrl && (
                        <img 
                          src={product.hoverImageUrl} 
                          alt={`${product.name} view`} 
                          className="product-hover-render" 
                        />
                      )}

                      {product.badge && (
                        <span className="apple-badge-pill">{product.badge}</span>
                      )}
                    </div>

                    {/* Information */}
                    <div className="product-info-wrap">
                      <div className="product-meta-top">
                        <span className="category-micro-text micro-label">{product.categoryName}</span>
                        <div className="rating-pill">
                          <Star size={11} fill="#F59E0B" color="#F59E0B" />
                          <span className="mono-num">{product.rating}</span>
                        </div>
                      </div>

                      <h3 className="product-title-text">{product.name}</h3>
                      <p className="product-desc-text">{product.subname || product.description}</p>

                      <div className="product-free-shipping">
                        <Truck size={13} color="var(--success-status)" />
                        <span>Giao hàng miễn phí toàn quốc</span>
                      </div>

                      <div className="product-bottom-bar">
                        <div className="price-stack">
                          <span className="price-main mono-num">${price.toFixed(2)}</span>
                          <span className="stock-info micro-label mono-num">
                            Tồn kho: {product.stock}
                          </span>
                        </div>

                        <button 
                          className={`apple-buy-btn ${addedStatus === 'success' ? 'success' : ''}`}
                          onClick={(e) => handleQuickAdd(product, e)}
                          disabled={addedStatus === 'loading'}
                        >
                          {addedStatus === 'loading' ? (
                            <div className="apple-btn-spin" />
                          ) : addedStatus === 'success' ? (
                            <Check size={16} />
                          ) : (
                            <span>Mua Ngay</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. THE PLATFORM DIFFERENCE (DỊCH VỤ & TIỆN ÍCH ĐỘC QUYỀN) */}
        <section className="apple-difference-section">
          <div className="section-title-row">
            <h2>
              <span className="heading-bold">Trải nghiệm mua sắm độc quyền.</span>
              <span className="heading-light">Chỉ có tại Smart Store.</span>
            </h2>
          </div>

          <div className="difference-cards-grid">
            <div className="difference-card">
              <RefreshCw size={28} color="var(--primary-glow)" />
              <h3>Thu Cũ Đổi Mới</h3>
              <p>Nhận trợ giá lên đến $650 khi nâng cấp các thiết bị công nghệ hiện tại của bạn.</p>
            </div>

            <div className="difference-card">
              <CreditCard size={28} color="var(--success-status)" />
              <h3>Trả Góp 0% Lãi Suất</h3>
              <p>Kỳ hạn linh hoạt lên đến 24 tháng với đa dạng cổng thanh toán và thẻ tín dụng.</p>
            </div>

            <div className="difference-card">
              <Gift size={28} color="var(--warning-status)" />
              <h3>Khắc Tên Miễn Phí</h3>
              <p>Khắc ký tự biểu tượng cảm xúc hoặc tên bạn bằng tia laser tinh xảo theo yêu cầu.</p>
            </div>

            <div className="difference-card">
              <Truck size={28} color="var(--primary-brand)" />
              <h3>Giao Hỏa Tốc Miễn Phí</h3>
              <p>Đóng gói niêm phong chính hãng, giao hàng tận nơi trong 2 giờ tại các thành phố lớn.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Storefront;
