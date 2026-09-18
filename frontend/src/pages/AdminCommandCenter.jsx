import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Scale, 
  Store, 
  Check, 
  X, 
  AlertCircle, 
  FileText, 
  Image, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Clock, 
  UserCheck 
} from 'lucide-react';
import { adminService } from '../services/admin';
import { orderService } from '../services/order';
import './AdminCommandCenter.css';

const AdminCommandCenter = () => {
  const [metrics, setMetrics] = useState({ gmv: 2489120, takeRate: 8.5 });
  const [vendors, setVendors] = useState([]);
  const [activeDispute, setActiveDispute] = useState({
    id: 'DSP-8821',
    orderId: 'ORD-1',
    amount: 3499.00,
    buyer: {
      name: 'Khách Hàng Hệ Thống',
      email: 'customer@smartecom.io',
      issue: 'Cần thẩm định biên bản bàn giao nhận hàng và xác thực tem niêm phong thiết bị trước khi giải ngân.',
      evidenceImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=600&q=80',
      timestamp: 'Hôm nay',
      claimType: 'Bảo Chứng Đơn Hàng'
    },
    seller: {
      storeName: 'Smart Store Official Flagship',
      storeOwner: 'Hệ Thống Phân Phối Chính Hãng',
      packingProofVideo: 'CAM-04-PACKING-SEALED.MP4',
      standardCheck: 'Đã qua máy quét quang học laser kiểm tra tem niêm phong 7 màu 100% nguyên bản.',
      invoiceNo: 'VAT-STORE-2026-98129',
      timestamp: 'Hôm nay'
    }
  });
  const [rulingState, setRulingState] = useState(null); // 'REFUNDED' | 'REJECTED' | 'RELEASED'

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [metricData, storeData, orderData] = await Promise.all([
          adminService.getMetrics().catch(() => null),
          adminService.getStores().catch(() => []),
          orderService.getSellerOrders().catch(() => [])
        ]);

        if (metricData) {
          setMetrics(metricData);
        }

        if (storeData && storeData.length > 0) {
          setVendors(storeData.map(s => ({
            id: 'VND-' + s.id,
            rawId: s.id,
            name: s.name,
            category: s.description || 'Chính Hãng Phân Phối',
            revenueEst: s.status === 'ACTIVE' ? '$350,000/tháng' : 'Chờ xét duyệt',
            documents: 'Giấy chứng nhận phân phối chính ngạch',
            status: s.status === 'ACTIVE' ? 'VERIFIED' : 'PENDING'
          })));
        }

        if (orderData && orderData.length > 0) {
          const firstOrd = orderData[0];
          setActiveDispute({
            id: 'DSP-' + firstOrd.id,
            orderId: firstOrd.orderCode || ('ORD-' + firstOrd.id),
            amount: Number(firstOrd.totalAmount || 3499),
            buyer: {
              name: firstOrd.receiverName || 'Khách Hàng Smart Store',
              email: firstOrd.customerEmail || 'customer@smartecom.io',
              issue: 'Kiểm định chất lượng bàn giao sản phẩm và xác nhận giải ngân ký quỹ.',
              evidenceImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=600&q=80',
              timestamp: firstOrd.createdAt ? new Date(firstOrd.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
              claimType: 'Bảo Chứng Đơn Hàng'
            },
            seller: {
              storeName: 'Smart Store Official Flagship',
              storeOwner: 'Hệ Thống Phân Phối Chính Hãng',
              packingProofVideo: 'CAM-04-PACKING-SEALED.MP4',
              standardCheck: 'Đã qua máy quét quang học laser kiểm tra tem niêm phong 7 màu 100% nguyên bản.',
              invoiceNo: 'VAT-STORE-' + firstOrd.id,
              timestamp: 'Hôm nay'
            }
          });
        }
      } catch (err) {
        console.error("Failed to load admin data from database:", err);
      }
    };

    loadAdminData();
  }, []);

  const handleArbitrate = (decision) => {
    setRulingState(decision);
    setTimeout(() => {
      alert(`Phán quyết thành công: ${decision === 'REFUND' ? `Đã hoàn tiền 100% về ví Người mua ($${activeDispute.amount.toFixed(2)})` : 'Bác bỏ khiếu nại & Giải ngân cho Nhà bán hàng'}`);
    }, 400);
  };

  const handleApproveVendor = async (vendorId, rawId) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: 'VERIFIED' } : v));
    if (rawId) {
      try {
        await adminService.updateStoreStatus(rawId, 'ACTIVE');
      } catch (err) {
        console.error("Failed to update store status in DB:", err);
      }
    }
  };

  const gmvValue = Number(metrics.gmv || 0);
  const takeRate = Number(metrics.takeRate || 8.5);
  const netRevenue = (gmvValue * (takeRate / 100)).toFixed(2);

  return (
    <div className="admin-command-page">
      <div className="admin-container">
        {/* TOP: MACRO GMV & TAKE RATE DASHBOARD */}
        <section className="macro-kpi-section">
          <div className="section-header">
            <div>
              <h1 className="page-title">Trung Tâm Điều Hành Sàn Toàn Cầu</h1>
              <p className="admin-subtext">Giám sát tổng dòng tiền GMV, tỷ lệ hoa hồng Take Rate và bàn phân xử tranh chấp</p>
            </div>
            <div className="live-status-pill">
              <div className="pulse-indicator">
                <div className="pulse-dot" />
                <span className="micro-label" style={{ color: 'var(--success-status)' }}>SYSTEM OPERATIONAL • TẤT CẢ CỔNG THANH TOÁN BÌNH THƯỜNG</span>
              </div>
            </div>
          </div>

          <div className="gmv-chart-container surface-card">
            <div className="gmv-card-header">
              <div className="gmv-left-stats">
                <span className="micro-label">DÒNG TIỀN GỘP HỆ THỐNG (GMV)</span>
                <div className="gmv-big-num mono-num">${gmvValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="gmv-sub-stats">
                  <span className="take-rate-pill">
                    <Percent size={12} /> Take Rate Sàn: <strong>{takeRate}%</strong>
                  </span>
                  <span className="net-revenue-text">
                    Doanh thu thuần sàn: <strong className="mono-num">${Number(netRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#6366F1' }} />
                  <span>Tổng GMV Giao Dịch</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#10B981' }} />
                  <span>Doanh Thu Hoa Hồng Thuần</span>
                </div>
              </div>
            </div>

            {/* CURVED AREA CHART (SVG Smooth Bezier) */}
            <div className="chart-wrapper">
              <svg viewBox="0 0 900 220" className="curved-area-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gmvAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="takeRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Background Grid Lines */}
                <line x1="0" y1="50" x2="900" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
                <line x1="0" y1="110" x2="900" y2="110" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
                <line x1="0" y1="170" x2="900" y2="170" stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />

                {/* GMV Area */}
                <path 
                  d="M0,180 C150,160 220,90 350,110 C480,130 550,50 700,70 C800,80 850,20 900,30 L900,220 L0,220 Z" 
                  fill="url(#gmvAreaGrad)" 
                />
                {/* GMV Stroke Line */}
                <path 
                  d="M0,180 C150,160 220,90 350,110 C480,130 550,50 700,70 C800,80 850,20 900,30" 
                  fill="none" 
                  stroke="var(--primary-brand)" 
                  strokeWidth="3.5" 
                />

                {/* Take Rate Area */}
                <path 
                  d="M0,205 C150,200 220,180 350,185 C480,190 550,160 700,165 C800,170 850,140 900,145 L900,220 L0,220 Z" 
                  fill="url(#takeRateGrad)" 
                />
                {/* Take Rate Stroke Line */}
                <path 
                  d="M0,205 C150,200 220,180 350,185 C480,190 550,160 700,165 C800,170 850,140 900,145" 
                  fill="none" 
                  stroke="var(--success-status)" 
                  strokeWidth="2.5" 
                />
              </svg>
            </div>
            
            <div className="chart-months-axis mono-num">
              <span>T3/2026</span>
              <span>T4/2026</span>
              <span>T5/2026</span>
              <span>T6/2026</span>
              <span>T7/2026</span>
              <span>T8/2026</span>
              <span>T9/2026 (Hiện tại)</span>
            </div>
          </div>
        </section>

        {/* 2. SPLIT-VIEW DISPUTE ARBITRATION CENTER */}
        <section className="dispute-split-section surface-card">
          <div className="dispute-section-top">
            <div className="dispute-title-wrap">
              <Scale size={20} color="var(--primary-glow)" />
              <div>
                <h3>Bàn Phân Xử Tranh Chấp Sàn (Split-View Dispute Center)</h3>
                <p className="table-hint">
                  Hồ sơ tranh chấp #{activeDispute.id} • Đơn hàng #{activeDispute.orderId} • Ký quỹ bảo chứng: <strong className="mono-num">${activeDispute.amount.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            {rulingState && (
              <div className={`ruling-final-badge ${rulingState.toLowerCase()}`}>
                {rulingState === 'REFUND' ? 'ĐÃ PHÁN QUYẾT: HOÀN TIỀN NGƯỜI MUA' : 'ĐÃ PHÁN QUYẾT: GIẢI NGÂN CHO SELLER'}
              </div>
            )}
          </div>

          <div className="split-view-arena">
            {/* Left Side: Buyer Evidence & Statements */}
            <div className="split-panel buyer-panel">
              <div className="panel-header">
                <span className="micro-label" style={{ color: 'var(--critical-status)' }}>BÊN KHIẾU NẠI (NGƯỜI MUA)</span>
                <strong>{activeDispute.buyer.name}</strong>
              </div>

              <div className="panel-body">
                <div className="evidence-quote-box">
                  <p>"{activeDispute.buyer.issue}"</p>
                  <span className="evidence-time micro-label">{activeDispute.buyer.timestamp}</span>
                </div>

                <div className="evidence-photo-card">
                  <span className="micro-label">Hình ảnh bằng chứng đính kèm:</span>
                  <div className="photo-preview-wrap">
                    <img src={activeDispute.buyer.evidenceImage} alt="Buyer Evidence" />
                    <div className="defect-highlight-box">Điểm kiểm tra kỹ thuật</div>
                  </div>
                </div>

                <div className="buyer-claim-tag">
                  Yêu cầu xử lý: <strong>{activeDispute.buyer.claimType}</strong>
                </div>
              </div>
            </div>

            {/* Center: One-touch Ruling Actions */}
            <div className="split-middle-arbiter">
              <div className="arbiter-badge">
                <Scale size={18} />
              </div>
              <span className="arbiter-title micro-label">HỘI ĐỒNG PHÁN QUYẾT</span>
              
              <div className="ruling-buttons-stack">
                <button 
                  className="btn-primary refund-ruling-btn"
                  onClick={() => handleArbitrate('REFUND')}
                  disabled={!!rulingState}
                >
                  <DollarSign size={16} />
                  <span>Hoàn Tiền Cho Người Mua</span>
                </button>

                <button 
                  className="btn-secondary reject-ruling-btn"
                  onClick={() => handleArbitrate('RELEASE')}
                  disabled={!!rulingState}
                >
                  <Check size={16} />
                  <span>Bác Bỏ & Giải Ngân Cho Seller</span>
                </button>
              </div>

              <span className="escrow-note micro-label">
                Tiền được ký quỹ bảo chứng tại Stripe Escrow Vault
              </span>
            </div>

            {/* Right Side: Seller Proof & Packaging Standards */}
            <div className="split-panel seller-panel">
              <div className="panel-header">
                <span className="micro-label" style={{ color: 'var(--success-status)' }}>BÊN BỊ KHIẾU NẠI (SELLER)</span>
                <strong>{activeDispute.seller.storeName}</strong>
              </div>

              <div className="panel-body">
                <div className="evidence-quote-box">
                  <p>{activeDispute.seller.standardCheck}</p>
                  <span className="evidence-time micro-label">{activeDispute.seller.timestamp}</span>
                </div>

                <div className="seller-proof-docs">
                  <div className="doc-item">
                    <FileText size={16} color="var(--primary-brand)" />
                    <div>
                      <strong>Hóa đơn tài chính VAT</strong>
                      <span className="mono-num micro-label">{activeDispute.seller.invoiceNo}</span>
                    </div>
                  </div>

                  <div className="doc-item">
                    <Image size={16} color="var(--primary-glow)" />
                    <div>
                      <strong>Video đóng gói chống tráo hàng</strong>
                      <span className="mono-num micro-label">{activeDispute.seller.packingProofVideo}</span>
                    </div>
                  </div>
                </div>

                <div className="seller-certified-badge">
                  <ShieldCheck size={14} color="var(--success-status)" />
                  <span>Gian hàng được Sàn chứng nhận Verified Store 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. VENDOR APPROVAL PIPELINE */}
        <section className="vendor-pipeline-section surface-card">
          <div className="vendor-pipeline-header">
            <div>
              <h3>Phê Duyệt Hồ Sơ Gian Hàng Mới (Vendor Approval Pipeline)</h3>
              <p className="table-hint">Xác minh giấy phép phân phối nhãn hàng trước khi cấp phép bán ra thị trường</p>
            </div>
            <span className="mono-num micro-label">{vendors.length} Hồ sơ chờ xét duyệt</span>
          </div>

          <div className="vendors-list-stack">
            {vendors.map(vendor => (
              <div key={vendor.id} className="vendor-review-card surface-elevate-2">
                <div className="vendor-left-info">
                  <div className="vendor-title-row">
                    <Store size={18} color="var(--primary-brand)" />
                    <h4>{vendor.name}</h4>
                    {vendor.status === 'VERIFIED' ? (
                      <span className="verified-badge">
                        <Check size={12} /> ĐÃ DUYỆT BÁN
                      </span>
                    ) : (
                      <span className="pending-badge">CHỜ XÉT DUYỆT</span>
                    )}
                  </div>
                  <div className="vendor-details-row">
                    <span>Mã đối tác: <strong className="mono-num">{vendor.id}</strong></span>
                    <span>•</span>
                    <span>Ngành hàng: <strong>{vendor.category}</strong></span>
                    <span>•</span>
                    <span>Dự báo GMV: <strong className="mono-num">{vendor.revenueEst}</strong></span>
                  </div>
                </div>

                <div className="vendor-doc-proof">
                  <FileText size={15} color="var(--primary-glow)" />
                  <span>{vendor.documents}</span>
                </div>

                <div className="vendor-actions">
                  {vendor.status !== 'VERIFIED' && (
                    <button 
                      className="btn-primary approve-btn"
                      onClick={() => handleApproveVendor(vendor.id, vendor.rawId)}
                    >
                      <UserCheck size={15} />
                      <span>Cấp Phép Verified</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
