import { API_BASE_URL } from './config';

export async function getUserById(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || text || 'Không lấy được thông tin người dùng');
  return data;
}

export async function updateUser(id, payload) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || text || 'Cập nhật thất bại');
  return data;
}

export async function uploadAvatar(id, file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_BASE_URL}/users/${id}/avatar`, {
    method: 'POST',
    body: form,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || text || 'Upload avatar thất bại');
  return data;
}

