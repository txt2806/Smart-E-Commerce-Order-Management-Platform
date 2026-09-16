import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Store, 
  User, 
  Package, 
  ShieldCheck, 
  ShoppingCart, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  X,
  CreditCard,
  Settings
} from 'lucide-react';
import './CommandPalette.css';

const CommandPalette = ({ isOpen, onClose, onSelectRole }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open from parent if listener is attached
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allActions = [
    {
      category: 'Vai trò & Phân hệ (Role Switcher)',
      items: [
        {
          id: 'role-guest',
          title: 'Storefront Homepage (Guest View)',
          subtitle: 'Trải nghiệm mua sắm không ma sát, Bento Grid Hero & Catalog',
          icon: Store,
          action: () => {
            onSelectRole('guest');
            navigate('/');
            onClose();
          }
        },
        {
          id: 'role-customer',
          title: 'Customer Portal (Member Experience)',
          subtitle: 'Theo dõi đơn hàng GPS kim loại, Loyalty Tier, Điểm tích lũy & Khiếu nại',
          icon: User,
          action: () => {
            onSelectRole('customer');
            navigate('/customer');
            onClose();
          }
        },
        {
          id: 'role-seller',
          title: 'Seller Central (Console)',
          subtitle: 'KPI Sparklines, bảng tồn kho chỉnh sửa trực tiếp (Inline Edit) & Đóng gói',
          icon: Package,
          action: () => {
            onSelectRole('seller');
            navigate('/seller');
            onClose();
          }
        },
        {
          id: 'role-admin',
          title: 'Platform Super-Admin (Command Center)',
          subtitle: 'Biểu đồ GMV & Take Rate cong mượt, bàn phân xử tranh chấp Split-View',
          icon: ShieldCheck,
          action: () => {
            onSelectRole('admin');
            navigate('/admin');
            onClose();
          }
        }
      ]
    },
    {
      category: 'Tra cứu nhanh (Quick Lookups & SKUs)',
      items: [
        {
          id: 'sku-vision',
          title: 'Tra cứu SKU: AP-VISPRO-M2',
          subtitle: 'Apple Vision Pro Spatial 512GB - Tồn kho: 8 - Trạng thái: Sẵn sàng',
          icon: Sparkles,
          action: () => {
            navigate('/seller');
            onClose();
          }
        },
        {
          id: 'sku-mbp',
          title: 'Tra cứu SKU: MB-M3MAX-64',
          subtitle: 'MacBook Pro 16" Space Black M3 Max - Tồn kho: 3 (Nguy cấp)',
          icon: Sparkles,
          action: () => {
            navigate('/seller');
            onClose();
          }
        },
        {
          id: 'order-sample',
          title: 'Đơn hàng #ORD-9824 (Đang giao hàng GPS)',
          subtitle: 'Khách: Alex Turner - 1x Studio Display XDR - Dự kiến 14:30',
          icon: ShoppingCart,
          action: () => {
            onSelectRole('customer');
            navigate('/customer');
            onClose();
          }
        }
      ]
    }
  ];

  const filtered = allActions.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-dialog surface-elevate-2" onClick={e => e.stopPropagation()}>
        <div className="cmd-header">
          <Search size={18} className="cmd-search-icon" />
          <input
            autoFocus
            type="text"
            className="cmd-input"
            placeholder="Gõ lệnh tìm kiếm sản phẩm, SKU, mã đơn hoặc đổi vai trò..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="cmd-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="cmd-body">
          {filtered.length === 0 ? (
            <div className="cmd-empty">Không tìm thấy kết quả phù hợp với "{query}"</div>
          ) : (
            filtered.map((group, gIdx) => (
              <div key={gIdx} className="cmd-group">
                <div className="cmd-group-title micro-label">{group.category}</div>
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.id} 
                      className="cmd-item"
                      onClick={item.action}
                    >
                      <div className="cmd-item-icon">
                        <Icon size={18} />
                      </div>
                      <div className="cmd-item-info">
                        <div className="cmd-item-title">{item.title}</div>
                        <div className="cmd-item-sub">{item.subtitle}</div>
                      </div>
                      <ArrowRight size={14} className="cmd-item-arrow" />
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="cmd-footer">
          <span>Dùng phím <kbd>↑</kbd> <kbd>↓</kbd> để di chuyển</span>
          <span><kbd>Enter</kbd> để chọn</span>
          <span><kbd>Esc</kbd> để đóng</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
