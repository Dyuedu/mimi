import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import '../styles/HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'sale', 'rent'

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (!savedUser) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="home-container">

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Chào Mừng đến MiMi: Chăm Sóc Toàn Diện Cho Bé Yêu!
          </h1>
          <p className="home-hero-description">
            Khám phá hàng ngàn sản phẩm chất lượng cho bé, từ máy tiệt trùng bình sữa hiện đại đến máy hút sữa thông minh, đồ dùng thiết yếu và đồ chơi sáng tạo. Mua sắm hoặc thuê, MiMi luôn có những lựa chọn hoàn hảo cho gia đình bạn.
          </p>
          <button className="home-hero-button">Khám Phá Ngay</button>
        </div>
      </section>

      {/* Search Section */}
      <section className="home-search-section">
        <div className="home-search-content">
          <h2 className="home-search-title">Tìm Kiếm Sản Phẩm MiMi</h2>
          <div className="home-search-bar-container">
            <Search className="home-search-icon" size={20} />
            <input
              type="text"
              className="home-search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="home-filter-buttons">
            <button
              className={`home-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Tất cả
            </button>
            <button
              className={`home-filter-btn ${filterType === 'sale' ? 'active' : ''}`}
              onClick={() => setFilterType('sale')}
            >
              Sản phẩm Bán
            </button>
            <button
              className={`home-filter-btn ${filterType === 'rent' ? 'active' : ''}`}
              onClick={() => setFilterType('rent')}
            >
              Sản phẩm Thuê
            </button>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
}
