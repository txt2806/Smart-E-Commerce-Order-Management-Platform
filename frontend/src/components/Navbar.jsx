import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  User, 
  LogOut, 
  Package, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Command,
  ExternalLink
} from 'lucide-react';
import { authService } from '../services/auth';
import './Navbar.css';

const Navbar = ({ 
  cartCount = 0, 
  onOpenCart, 
  onOpenCommand, 
  cartBouncing = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userRole = (user?.role || '').toUpperCase().replace('ROLE_', '');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Cửa Hàng', path: '/' },
    { label: 'Không Gian Số', path: '/#spatial' },
    { label: 'Máy Tính Pro', path: '/#compute' },
    { label: 'Âm Thanh Hi-Res', path: '/#audio' },
    { label: 'Đơn Hàng Của Tôi', path: '/orders' }
  ];

  return (
    <header className="apple-navbar">
      <div className="apple-navbar-inner">
        {/* Left: Apple / Shopify style Clean Logo */}
        <NavLink to="/" className="apple-brand-link">
          <div className="apple-logo-badge">
            <Sparkles size={15} />
          </div>
          <span className="brand-text">Smart Store</span>
        </NavLink>

        {/* Center: Apple-style Minimalist Navigation Links */}
        <nav className="apple-nav-links">
          {navLinks.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => 
                `apple-nav-item ${isActive && item.path === location.pathname ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Search, Cart & Account Profile */}
        <div className="apple-nav-actions">
          {/* Quick Search trigger (⌘K) */}
          <button 
            className="action-icon-btn search-trigger" 
            onClick={onOpenCommand}
            title="Tìm kiếm (Ctrl+K)"
          >
            <Search size={16} />
          </button>

          {/* Cart Bag Icon with Apple aesthetic */}
          <button 
            className={`action-icon-btn cart-trigger ${cartBouncing ? 'cart-bounce-active' : ''}`}
            onClick={onOpenCart}
            title="Giỏ hàng"
          >
            <ShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="apple-cart-badge mono-num">{cartCount}</span>
            )}
          </button>

          {/* Account Profile / Dropdown */}
          <div className="account-dropdown-wrapper" ref={dropdownRef}>
            {user ? (
              <>
                <button 
                  className="user-profile-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="avatar-letter">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-firstname">{user.username.split('@')[0]}</span>
                  <ChevronDown size={13} className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="apple-dropdown-menu surface-elevate-2">
                    <div className="dropdown-user-header">
                      <strong>{user.username}</strong>
                      <span className="user-role-badge micro-label">{userRole || 'CUSTOMER'}</span>
                    </div>

                    <div className="dropdown-divider" />

                    <button 
                      className="dropdown-item" 
                      onClick={() => { navigate('/orders'); setDropdownOpen(false); }}
                    >
                      <Package size={15} />
                      <span>Đơn hàng của tôi</span>
                    </button>

                    {/* Role-specific dashboards */}
                    {(userRole === 'SELLER' || userRole === 'ADMIN') && (
                      <button 
                        className="dropdown-item seller-highlight" 
                        onClick={() => { navigate('/seller'); setDropdownOpen(false); }}
                      >
                        <Package size={15} color="var(--primary-glow)" />
                        <span>Kênh Quản Lý Bán Hàng (Seller)</span>
                      </button>
                    )}

                    {userRole === 'ADMIN' && (
                      <button 
                        className="dropdown-item admin-highlight" 
                        onClick={() => { navigate('/admin'); setDropdownOpen(false); }}
                      >
                        <ShieldCheck size={15} color="var(--success-status)" />
                        <span>Bàn Điều Hành Sàn (Super-Admin)</span>
                      </button>
                    )}

                    <div className="dropdown-divider" />

                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button 
                className="apple-login-btn"
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
