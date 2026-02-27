import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getAllProducts } from '../api/product';
import { API_BASE_URL } from '../api/config';
import '../styles/HomePage.css';

const PLACEHOLDER_IMG = 'https://via.placeholder.com/120x120/f0f0f0/666?text=SP';

function buildProductImageSrc(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.includes('src/assets')) return null;
  const raw = imageUrl.trim();
  if (raw.startsWith('http')) return raw;
  const base = API_BASE_URL.replace(/\/$/, '');
  if (raw.startsWith('/')) return base.replace(/\/api\/?$/, '') + raw;
  return `${base}/products/images/${raw}`;
}

export default function RentProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const all = await getAllProducts();
      const forRent = (all || []).filter(
        (p) =>
          (p.tradeType === 'RENT_ONLY' || p.tradeType === 'BOTH') &&
          p.rentPrice != null &&
          Number(p.rentPrice) > 0
      );
      setProducts(forRent);
    } catch (err) {
      console.error('Error loading rent products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);

  const getProductImageSrc = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      const img = product.images[0];
      const url = typeof img === 'string' ? img : img?.imageUrl;
      const src = buildProductImageSrc(url);
      if (src) return src;
    }
    return PLACEHOLDER_IMG;
  };

  const getRentUnitText = (unit) => {
    const map = { DAY: 'ngày', WEEK: 'tuần', MONTH: 'tháng', YEAR: 'năm' };
    return map[unit] || 'tháng';
  };

  return (
    <Layout>
      <div className="home-container">
        <section className="home-search-section">
          <div className="home-search-content">
            <h2 className="home-search-title">Sản phẩm cho thuê</h2>
            <p className="home-search-description" style={{ marginTop: 8, color: '#64748b' }}>
              Tất cả sản phẩm có thể thuê theo ngày / tuần / tháng
            </p>
          </div>
        </section>

        <section className="home-products-section">
          <div className="home-products-content">
            {loading ? (
              <div className="loading-message">Đang tải sản phẩm...</div>
            ) : products.length === 0 ? (
              <div className="loading-message">Chưa có sản phẩm cho thuê.</div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-card-inner">
                      <div className="product-thumb">
                        <img
                          src={getProductImageSrc(product)}
                          alt={product.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER_IMG;
                          }}
                        />
                      </div>
                      <div className="product-info">
                        <div className="product-meta-row">
                          <span className="product-category-pill">
                            {product.categoryName || product.category?.name || 'Khác'}
                          </span>
                        </div>
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-prices">
                          <div className="price-rent-group">
                            <div className="price-rent">
                              {formatPrice(product.rentPrice)}/{getRentUnitText(product.rentUnit)}
                            </div>
                            {product.deposit && (
                              <div className="price-deposit">+ Cọc: {formatPrice(product.deposit)}</div>
                            )}
                          </div>
                          {product.buyPrice > 0 && (
                            <div className="price-main" style={{ fontSize: '0.9em', color: '#64748b' }}>
                              Hoặc mua: {formatPrice(product.buyPrice)}
                            </div>
                          )}
                        </div>
                        <button
                          className="btn-details"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          Xem Chi Tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
