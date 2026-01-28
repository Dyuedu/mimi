import React, { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getRevenueSummary, getSoldProducts } from '../api/revenue';
import '../styles/RevenuePage.css';

const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [soldProducts, setSoldProducts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '2024-07-15',
    endDate: '2025-10-17',
    category: 'all'
  });

  // Mock user ID - trong thực tế sẽ lấy từ authentication context
  const userId = 1;

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load revenue summary and sold products
      const [summaryData, productsData] = await Promise.all([
        getRevenueSummary(userId, filters.startDate, filters.endDate, filters.category === 'all' ? null : filters.category),
        getSoldProducts(userId, filters.startDate, filters.endDate, filters.category === 'all' ? null : filters.category)
      ]);
      
      setRevenueSummary(summaryData);
      setSoldProducts(productsData);
    } catch (error) {
      console.error('Error loading revenue data:', error);
      
      // Set empty data if no products sold yet
      setRevenueSummary({
        totalRevenue: 0,
        totalProductsSold: 0,
        period: formatPeriod(filters.startDate, filters.endDate)
      });
      
      setSoldProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (startDate, endDate) => {
    if (!startDate && !endDate) {
      return "Tất cả thời gian";
    }
    
    const start = startDate ? new Date(startDate).toLocaleDateString('vi-VN') : "Bắt đầu";
    const end = endDate ? new Date(endDate).toLocaleDateString('vi-VN') : "Hiện tại";
    
    return `${start} - ${end}`;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const content = loading ? (
    <div className="loading">Đang tải...</div>
  ) : (
    <>
      <main className="main-content">
        <div className="revenue-container">
          {/* Left Panel - Filters & Summary */}
          <div className="left-panel">
            <div className="filter-section">
              <h2 className="section-title">Bộ lọc & Tóm tắt</h2>
              
              {/* Date Range Filter */}
              <div className="filter-group">
                <label className="filter-label">Chọn khoảng ngày</label>
                <div className="date-range">
                  <div className="date-input-group">
                    <Calendar className="date-icon" size={16} />
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <span className="date-separator">-</span>
                  <div className="date-input-group">
                    <Calendar className="date-icon" size={16} />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              <button className="apply-filter-btn">
                Áp dụng bộ lọc
              </button>

              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-label">Lọc theo danh mục</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="category-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="binh-sua">Bình sữa</option>
                  <option value="ta-bim">Tã bỉm</option>
                  <option value="do-choi">Đồ chơi</option>
                  <option value="sua-bot">Sữa bột</option>
                  <option value="xe-day">Xe đẩy</option>
                </select>
              </div>
            </div>

            {/* Revenue Summary */}
            <div className="summary-section">
              <h3 className="summary-title">Tổng quan doanh thu</h3>
              <div className="summary-card">
                <div className="summary-item">
                  <div className="summary-label">Tổng doanh thu:</div>
                  <div className="summary-value revenue-value">
                    {formatPrice(revenueSummary?.totalRevenue || 0)}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Số lượng đã bán:</div>
                  <div className="summary-value products-value">
                    {revenueSummary?.totalProductsSold || 0} sản phẩm
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Sold Products */}
          <div className="right-panel">
            <div className="products-section">
              <div className="products-header">
                <h2 className="section-title">Sản phẩm đã bán</h2>
                <p className="section-subtitle">
                  Tổng quan chi tiết về các sản phẩm đã bán gần đây của bạn.
                </p>
              </div>

              <div className="products-table">
                <div className="table-header">
                  <div className="header-cell product-col">Hình ảnh</div>
                  <div className="header-cell name-col">Tên sản phẩm</div>
                  <div className="header-cell quantity-col">Số lượng</div>
                  <div className="header-cell amount-col">Tổng thu nhập</div>
                  <div className="header-cell date-col">Ngày bán</div>
                </div>

                <div className="table-body">
                  {soldProducts.length > 0 ? (
                    soldProducts.map(product => (
                      <div key={product.id} className="table-row">
                        <div className="table-cell product-col">
                          <img 
                            src={product.imageUrl || '/api/placeholder/60/60'} 
                            alt={product.name}
                            className="product-image"
                          />
                        </div>
                        <div className="table-cell name-col">
                          <span className="product-name">{product.name}</span>
                        </div>
                        <div className="table-cell quantity-col">
                          <span className="quantity">{product.quantity}</span>
                        </div>
                        <div className="table-cell amount-col">
                          <span className="amount">{formatPrice(product.totalAmount)}</span>
                        </div>
                        <div className="table-cell date-col">
                          <span className="date">{formatDate(product.soldDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <div className="empty-title">Chưa có sản phẩm nào được bán</div>
                      <div className="empty-subtitle">
                        Khi bạn bán sản phẩm thành công, chúng sẽ hiển thị ở đây
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <a href="/revenue" className="nav-item active">
          <span className="nav-icon">💰</span>
          <span className="nav-text">Doanh thu</span>
        </a>
        <a href="/products" className="nav-item">
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
      <div className="revenue-page">
        {content}
      </div>
    </Layout>
  );
};

export default RevenuePage;