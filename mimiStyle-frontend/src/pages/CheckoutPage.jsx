import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { getApplicableVouchers } from '../api/voucher';
import '../styles/CheckoutPage.css';

// Phí vận chuyển để trống, chưa tính
const SHIPPING_FEE = 0;

// Placeholder options for location (có thể thay bằng API tỉnh/huyện/xã sau)
const PROVINCES = ['Chọn tỉnh / thành', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
const DISTRICTS = ['Chọn quận / huyện', 'Quận 1', 'Quận 3', 'Quận 5', 'Quận 7'];
const WARDS = ['Chọn phường / xã', 'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Nguyễn Thái Bình'];

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price ?? 0);
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQuantity } = useCart();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    ward: '',
  });
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [loadingVouchers, setLoadingVouchers] = useState(false);

  const subtotal = items.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0);
  const discount = selectedVoucher ? Number(selectedVoucher.discountValue) : 0;
  const total = Math.max(0, subtotal - discount + SHIPPING_FEE);

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const u = JSON.parse(saved);
      setUser(u);
      setForm((prev) => ({
        ...prev,
        fullName: u?.fullName ?? '',
        phone: u?.phoneNumber ?? '',
        email: u?.email ?? '',
        address: u?.address ?? '',
      }));
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    setLoadingVouchers(true);
    getApplicableVouchers(subtotal)
      .then((data) => {
        if (!cancelled) setVouchers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setVouchers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingVouchers(false);
      });
    return () => { cancelled = true; };
  }, [subtotal, items.length]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinueToPayment = () => {
    navigate('/checkout/payment', { state: { form, selectedVoucher } });
  };

  if (items.length === 0 && user) {
    return (
      <Layout>
        <div className="checkout-page">
          <div className="checkout-empty">
            <p>Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.</p>
            <button type="button" className="checkout-btn-back" onClick={() => navigate('/home')}>
              Về trang chủ
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-page">
        <div className="checkout-container">
          {/* Left: Thông tin giao hàng */}
          <section className="checkout-delivery">
            <h1 className="checkout-section-title">Thông tin giao hàng</h1>
            <div className="checkout-form">
              <label className="checkout-label">Họ và tên</label>
              <input
                type="text"
                className="checkout-input"
                value={form.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Họ và tên"
              />
              <label className="checkout-label">Số điện thoại</label>
              <input
                type="tel"
                className="checkout-input"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Số điện thoại"
              />
              <label className="checkout-label">Email</label>
              <input
                type="email"
                className="checkout-input"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email"
              />
              <label className="checkout-label">Địa chỉ</label>
              <input
                type="text"
                className="checkout-input"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Địa chỉ"
              />
              <label className="checkout-label">Tỉnh / thành</label>
              <select
                className="checkout-select"
                value={form.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <label className="checkout-label">Quận / huyện</label>
              <select
                className="checkout-select"
                value={form.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <label className="checkout-label">Phường / xã</label>
              <select
                className="checkout-select"
                value={form.ward}
                onChange={(e) => handleInputChange('ward', e.target.value)}
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Right: Giỏ hàng + Mã giảm giá + Tổng */}
          <section className="checkout-summary">
            <h2 className="checkout-cart-label">Giỏ hàng</h2>
            <div className="checkout-product-list">
              {items.map((item) => {
                const imgSrc = item.product?.imageSrc || 'https://via.placeholder.com/80x80/f0f0f0/666?text=SP';
                const variantText = [item.colorLabel, item.sizeLabel].filter(Boolean).join(' / ') || '';
                const lineTotal = (item.product?.price ?? 0) * item.quantity;
                return (
                  <div key={`${item.productId}-${item.colorIndex}-${item.sizeIndex}`} className="checkout-product-item">
                    <img className="checkout-product-img" src={imgSrc} alt={item.product?.name} />
                    <div className="checkout-product-info">
                      <div className="checkout-product-name">{item.product?.name}</div>
                      {variantText && <div className="checkout-product-variant">{variantText}</div>}
                      <div className="checkout-product-row">
                        <div className="checkout-product-qty">
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            onClick={() => updateQuantity(item.productId, item.colorIndex, item.sizeIndex, -1)}
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="checkout-qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="checkout-qty-btn"
                            onClick={() => updateQuantity(item.productId, item.colorIndex, item.sizeIndex, 1)}
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="checkout-product-price">{formatPrice(lineTotal)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="checkout-voucher-section">
              <label className="checkout-label">Mã giảm giá</label>
              {loadingVouchers ? (
                <p className="checkout-voucher-loading">Đang tải mã giảm giá...</p>
              ) : vouchers.length === 0 ? (
                <p className="checkout-voucher-empty">Không có mã giảm giá phù hợp với đơn hàng hiện tại.</p>
              ) : (
                <div className="checkout-voucher-list">
                  {vouchers.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`checkout-voucher-item ${selectedVoucher?.id === v.id ? 'selected' : ''}`}
                      onClick={() => setSelectedVoucher(selectedVoucher?.id === v.id ? null : v)}
                    >
                      <span className="checkout-voucher-code">{v.code}</span>
                      <span className="checkout-voucher-desc">
                        Giảm {formatPrice(v.discountValue)}
                        {v.minOrderValue ? ` cho đơn từ ${formatPrice(v.minOrderValue)}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="checkout-summary-rows">
              <div className="checkout-summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Phí vận chuyển</span>
                <span></span>
              </div>
              {discount > 0 && (
                <div className="checkout-summary-row checkout-discount">
                  <span>Giảm giá ({selectedVoucher?.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="checkout-summary-row checkout-total">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button type="button" className="checkout-continue-btn" onClick={handleContinueToPayment}>
              Tiếp tục đến phương thức thanh toán
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
}
