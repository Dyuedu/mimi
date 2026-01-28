import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  const goToLogin = () => navigate('/login');
  const goToRegister = () => navigate('/register');

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="landing-logo">
            <span className="landing-logo-icon">✨</span>
            <span className="landing-logo-text">MiMi</span>
          </div>
          <nav className="landing-nav-menu">
            <button className="landing-nav-link">Trang Chủ</button>
            <button className="landing-nav-link">Giới Thiệu</button>
            <button className="landing-nav-link">Liên Hệ</button>
          </nav>
          <div className="landing-auth-buttons">
            <button className="landing-login-btn" onClick={goToLogin}>
              Đăng Nhập
            </button>
            <button className="landing-register-btn" onClick={goToRegister}>
              Đăng Ký
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-text">
            <h1 className="landing-hero-title">
              Chào Mừng đến MiMi:
              <br />
              Chăm Sóc Toàn Diện Cho Bé Yêu!
            </h1>
            <p className="landing-hero-description">
              Khám phá hàng ngàn sản phẩm chất lượng cho bé, từ máy tiệt trùng bình
              sữa hiện đại đến máy hút sữa thông minh, đồ dùng thiết yếu và đồ chơi
              sáng tạo. Mua sắm hoặc thuê, MiMi luôn có những lựa chọn hoàn hảo cho
              gia đình bạn.
            </p>
            <button className="landing-hero-button" onClick={goToLogin}>
              Khám Phá Ngay
            </button>
          </div>
          <div className="landing-hero-image">
            <div className="landing-hero-image-card">
              {/* Placeholder image area – bạn có thể thay bằng ảnh thật */}
              <div className="landing-hero-image-placeholder" />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="landing-search-section">
        <div className="landing-search-content">
          <h2 className="landing-search-title">Tìm Kiếm Sản Phẩm MiMi</h2>
          <div className="landing-search-bar-container">
            <Search className="landing-search-icon" size={20} />
            <input
              type="text"
              className="landing-search-input"
              placeholder="Tìm kiếm sản phẩm..."
            />
          </div>
          <div className="landing-filter-buttons">
            <button className="landing-filter-btn active">Tất cả</button>
            <button className="landing-filter-btn">Sản phẩm Bán</button>
            <button className="landing-filter-btn">Sản phẩm Thuê</button>
          </div>
        </div>
      </section>
    </div>
  );
}

