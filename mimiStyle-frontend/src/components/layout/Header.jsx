import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, Package, Settings, LogOut, ChevronRight } from 'lucide-react';
import '../../styles/Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Invalid user data
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberMe');
    navigate('/login', { replace: true });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-logo">
          <span className="app-logo-icon">✨</span>
          <span className="app-logo-text">MiMi</span>
        </div>
        <nav className="app-nav-menu">
          <button className="app-nav-link" type="button" onClick={() => navigate('/home')}>
            Trang Chủ
          </button>
          <button className="app-nav-link" type="button">
            Sản Phẩm Bán
          </button>
          <button className="app-nav-link" type="button">
            Sản Phẩm Thuê
          </button>
          <button className="app-nav-link" type="button">
            Giới Thiệu
          </button>
          <button className="app-nav-link" type="button">
            Liên Hệ
          </button>
        </nav>
        <div className="app-user-profile-wrapper" ref={dropdownRef}>
          <div className="app-user-profile" onClick={toggleDropdown}>
            <div className="app-user-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="app-user-name">{user?.fullName || 'Người dùng'}</span>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="app-user-dropdown">
              <div className="app-dropdown-header">
                <div className="app-dropdown-avatar">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="app-dropdown-name">{user?.fullName || 'Người dùng'}</span>
              </div>
              <div className="app-dropdown-divider"></div>
              <div className="app-dropdown-menu">
                <button
                  className="app-dropdown-item"
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  <Users className="app-dropdown-icon" size={20} />
                  <span>Xem tất cả trang cá nhân</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button className="app-dropdown-item">
                  <ShoppingCart className="app-dropdown-icon" size={20} />
                  <span>Xem giỏ hàng</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button className="app-dropdown-item">
                  <Package className="app-dropdown-icon" size={20} />
                  <span>Sản phẩm đăng bán</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button className="app-dropdown-item">
                  <Settings className="app-dropdown-icon" size={20} />
                  <span>Cài đặt</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
                <button className="app-dropdown-item" onClick={handleLogout}>
                  <LogOut className="app-dropdown-icon" size={20} />
                  <span>Đăng Xuất</span>
                  <ChevronRight className="app-dropdown-chevron" size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
