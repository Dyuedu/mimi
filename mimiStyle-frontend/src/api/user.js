import { API_BASE_URL } from './config';

async function parseResponse(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text; // backend có thể trả plain text như "User not found"
  }
  return { data, text };
}

/**
 * Lấy danh sách tất cả user (dành cho ADMIN).
 */
export async function getAllUsers() {
  const res = await fetch(`${API_BASE_URL}/users/list`);
  const { data } = await parseResponse(res);
  if (!res.ok) {
    throw new Error(typeof data === 'string' ? data : 'Không thể tải danh sách user');
  }
  return Array.isArray(data) ? data : [];
}

export async function getUserById(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  const { data, text } = await parseResponse(res);
  if (!res.ok) {
    const message = typeof data === 'string' ? data : 'Không lấy được thông tin người dùng';
    throw new Error(message);
  }
  return data;
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) {
    const message = typeof data === 'string' ? data : 'Cập nhật thất bại';
    throw new Error(message);
  }
  return data;
}

export async function uploadAvatar(id, file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE_URL}/users/${id}/avatar`, {
    method: 'POST',
    body: form,
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) {
    const message = typeof data === 'string' ? data : 'Upload avatar thất bại';
    throw new Error(message);
  }
  return data;
}

/**
 * Lấy thống kê tổng quan hệ thống (dành cho ADMIN).
 */
export async function getSystemStats() {
  const res = await fetch(`${API_BASE_URL}/users/stats`);
  const { data } = await parseResponse(res);
  if (!res.ok) {
    throw new Error(typeof data === 'string' ? data : 'Không thể tải thống kê');
  }
  return data;
}
