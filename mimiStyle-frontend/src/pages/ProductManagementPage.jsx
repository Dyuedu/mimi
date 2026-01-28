import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getUserProducts, deleteProduct } from '../api/product';
import '../styles/ProductManagementPage.css';

const ProductManagementPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tạm thời mock user ID - sau này sẽ lấy từ user trong session
  const userId = 1;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getUserProducts(userId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      // Mock data for demo
      setProducts([
        {
          id: 1,
          name: 'Nôi em bé đa năng',
          buyPrice: 3500000,
          rentPrice: null,
          status: 'ACTIVE',
          tradeType: 'BUY_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 2,
          name: 'Xe đẩy em bé cao cấp',
          buyPrice: null,
          rentPrice: 1800000,
          rentUnit: 'MONTH',
          status: 'ACTIVE',
          tradeType: 'RENT_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 3,
          name: 'Bộ bình sữa tiện lợi',
          buyPrice: 450000,
          rentPrice: null,
          status: 'ACTIVE',
          tradeType: 'BUY_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 4,
          name: 'Ghế ăn dặm cho bé',
          buyPrice: null,
          rentPrice: 700000,
          rentUnit: 'MONTH',
          status: 'ACTIVE',
          tradeType: 'RENT_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 5,
          name: 'Set quần áo sơ sinh',
          buyPrice: 250000,
          rentPrice: null,
          status: 'ACTIVE',
          tradeType: 'BUY_ONLY',
          images: ['/api/placeholder/300/200']
        },
        {
          id: 6,
          name: 'Bồn tắm cho bé',
          buyPrice: 300000,
          rentPrice: 50000,
          rentUnit: 'MONTH',
          status: 'ACTIVE',
          tradeType: 'BOTH',
          images: ['/api/placeholder/300/200']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Không thể xóa sản phẩm');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { text: 'Đang bán', class: 'status-available' },
      'HIDDEN': { text: 'Ẩn', class: 'status-hidden' },
      'SOLD_OUT': { text: 'Hết hàng', class: 'status-sold' }
    };
    const statusInfo = statusMap[status] || { text: 'Không xác định', class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getRentUnitText = (unit) => {
    const unitMap = {
      'DAY': 'ngày',
      'WEEK': 'tuần', 
      'MONTH': 'tháng',
      'YEAR': 'năm'
    };
    return unitMap[unit] || 'tháng';
  };

  const content = loading ? (
    <div className="loading">Đang tải...</div>
  ) : (
    <>
      <main className="main-content">
        <div className="page-header">
          <h1>Quản lý sản phẩm</h1>
          <p className="subtitle">Sản phẩm đang bán/cho thuê</p>
        </div>

        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.images?.[0] || '/api/placeholder/300/200'} alt={product.name} />
                {getStatusBadge(product.status)}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-price">
                  {product.tradeType === 'BUY_ONLY' && product.buyPrice && (
                    <span className="sell-price">{formatPrice(product.buyPrice)}</span>
                  )}
                  {product.tradeType === 'RENT_ONLY' && product.rentPrice && (
                    <span className="rent-price">
                      {formatPrice(product.rentPrice)}/{getRentUnitText(product.rentUnit)}
                    </span>
                  )}
                  {product.tradeType === 'BOTH' && (
                    <>
                      {product.buyPrice && <span className="sell-price">{formatPrice(product.buyPrice)}</span>}
                      {product.rentPrice && (
                        <span className="rent-price">
                          {formatPrice(product.rentPrice)}/{getRentUnitText(product.rentUnit)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="product-actions">
                  <button className="btn-edit">
                    ✏️ Chỉnh sửa
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(product.id)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="add-product-section">
          <button 
            className="btn-add-product"
            onClick={() => navigate('/add')}
          >
            + Tải thêm sản phẩm
          </button>
        </div>
      </main>

      <nav className="bottom-nav">
        <a href="/revenue" className="nav-item">
          <span className="nav-icon">💰</span>
          <span className="nav-text">Doanh thu</span>
        </a>
        <a href="/products" className="nav-item active">
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Đang bán</span>
        </a>
        <a href="/add" className="nav-item">
          <span className="nav-icon">➕</span>
          <span className="nav-text">Thêm mới</span>
        </a>
      </nav>
    </>
  );

  return (
    <Layout>
      <div className="product-management">
        {content}
      </div>
    </Layout>
  );
};

export default ProductManagementPage;