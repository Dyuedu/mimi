import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, ShoppingBag, TrendingUp } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { getAllUsers, getSystemStats } from '../api/user';
import { API_ORIGIN } from '../api/config';
import '../styles/UserManagementPage.css';

function getRoleLabel(role) {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'USER') return 'User';
  return role || '—';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
}

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      if ((parsed?.role ?? parsed?.roles?.[0]) !== 'ADMIN') {
        navigate('/home', { replace: true });
        return;
      }
    } catch {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    Promise.all([
      getAllUsers(),
      getSystemStats().catch(() => null) // Nếu API chưa có thì trả null
    ])
      .then(([usersData, statsData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);
        setStats(statsData);
      })
      .catch((err) => {
        setError(err?.message || 'Không thể tải danh sách user');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  return (
    <Layout>
      <div className="user-management-page">
        <div className="user-management-header">
          <h1>Quản lý người dùng</h1>
          <p className="user-management-subtitle">Tổng quan hệ thống và danh sách người dùng</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <Users size={24} color="#2563eb" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Tổng người dùng</div>
                <div className="stat-value">{formatNumber(stats.totalUsers || users.length)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>
                <Eye size={24} color="#f59e0b" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Lượt truy cập</div>
                <div className="stat-value">{formatNumber(stats.totalPageViews || 0)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5' }}>
                <ShoppingBag size={24} color="#059669" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Tổng đơn hàng</div>
                <div className="stat-value">{formatNumber(stats.totalOrders || 0)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fce7f3' }}>
                <TrendingUp size={24} color="#be185d" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Người dùng hoạt động</div>
                <div className="stat-value">{formatNumber(stats.activeUsers || 0)}</div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="user-management-loading">Đang tải...</div>
        ) : error ? (
          <div className="user-management-error">{error}</div>
        ) : (
          <div className="user-management-table-wrap">
            <div className="table-header">
              <h2>Danh sách người dùng ({users.length})</h2>
            </div>
            <table className="user-management-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Họ tên</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Lượt truy cập</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="col-id">{u.id}</td>
                    <td className="col-avatar">
                      {u.avatarUrl ? (
                        <img
                          src={`${API_ORIGIN}/uploads/avatars/${u.avatarUrl}`}
                          alt=""
                          className="user-avatar-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling?.classList?.add('visible');
                          }}
                        />
                      ) : null}
                      <span className="user-avatar-initial" style={{ display: u.avatarUrl ? 'none' : 'flex' }}>
                        {(u.fullName || u.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </td>
                    <td>{u.username || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td>{u.fullName || '—'}</td>
                    <td>{u.phoneNumber || '—'}</td>
                    <td>
                      <span className={`user-role-badge role-${(u.role || '').toLowerCase()}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="col-views">
                      <span className="view-count">{formatNumber(u.pageViews || 0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="user-management-empty">Chưa có người dùng nào.</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserManagementPage;
