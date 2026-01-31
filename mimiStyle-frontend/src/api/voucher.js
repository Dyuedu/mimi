import { API_BASE_URL } from './config';

/**
 * Lấy danh sách mã giảm giá đáp ứng điều kiện (chưa hết hạn, đơn hàng >= minOrderValue).
 * @param {number} subtotal - Tổng tạm tính (VND)
 */
export async function getApplicableVouchers(subtotal) {
  const url = new URL(`${API_BASE_URL}/vouchers/applicable`);
  url.searchParams.set('subtotal', String(subtotal));
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Không thể tải mã giảm giá');
  return res.json();
}
