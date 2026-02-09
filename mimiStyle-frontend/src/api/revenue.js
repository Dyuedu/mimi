const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getRevenueSummary(userId, startDate, endDate, category) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const response = await fetch(`${API_BASE_URL}/revenue/summary/${userId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin doanh thu');
  }

  return response.json();
}

export async function getSoldProducts(userId, startDate, endDate, category) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const response = await fetch(`${API_BASE_URL}/revenue/sold-products/${userId}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách sản phẩm đã bán');
  }

  return response.json();
}