import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getUserById, updateUser, uploadAvatar } from '../api/user';
import { API_ORIGIN } from '../api/config';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    birthday: '',
    phoneNumber: '',
    address: '',
  });

  const avatarSrc = useMemo(() => {
    if (!user?.avatarUrl) return null;
    // backend serves /uploads/** from local filesystem
    return `${API_ORIGIN}/uploads/avatars/${user.avatarUrl}`;
  }, [user]);

  useEffect(() => {
    const saved = sessionStorage.getItem('user');
    if (!saved) {
      navigate('/login', { replace: true });
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch {
      navigate('/login', { replace: true });
      return;
    }

    if (!parsed?.id) {
      // Without user id, we cannot load profile reliably
      navigate('/home', { replace: true });
      return;
    }

    (async () => {
      try {
        const fresh = await getUserById(parsed.id);
        setUser(fresh);
        setForm({
          fullName: fresh.fullName || '',
          birthday: fresh.birthday || '',
          phoneNumber: fresh.phoneNumber || '',
          address: fresh.address || '',
        });
      } catch (e) {
        alert(e.message || 'Không tải được thông tin cá nhân');
      }
    })();
  }, [navigate]);

  const persistUser = (nextUser) => {
    setUser(nextUser);
    sessionStorage.setItem('user', JSON.stringify(nextUser));
    window.dispatchEvent(new Event('mimi:user-updated'));
  };

  const onPickAvatar = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const updated = await uploadAvatar(user.id, file);
      persistUser(updated);
    } catch (err) {
      alert(err.message || 'Upload avatar thất bại');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const onSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const updated = await updateUser(user.id, {
        fullName: form.fullName,
        birthday: form.birthday || null,
        phoneNumber: form.phoneNumber,
        address: form.address,
      });
      persistUser(updated);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (err) {
      alert(err.message || 'Cập nhật thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar-wrap" onClick={onPickAvatar} role="button" tabIndex={0}>
              {avatarSrc ? (
                <img className="profile-avatar" src={avatarSrc} alt="Ảnh đại diện" />
              ) : (
                <div className="profile-avatar-fallback">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="profile-avatar-overlay">
                {isUploading ? 'Đang tải...' : 'Đổi ảnh'}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="profile-avatar-input"
              onChange={onAvatarFileChange}
            />

            <div className="profile-title">
              <h2>Thông tin cá nhân</h2>
              <p>{user?.email}</p>
            </div>

            <div className="profile-actions">
              {!isEditing ? (
                <button className="profile-btn" onClick={() => setIsEditing(true)} type="button">
                  Sửa thông tin cá nhân
                </button>
              ) : (
                <div className="profile-actions-row">
                  <button
                    className="profile-btn profile-btn--ghost"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        fullName: user?.fullName || '',
                        birthday: user?.birthday || '',
                        phoneNumber: user?.phoneNumber || '',
                        address: user?.address || '',
                      });
                    }}
                    disabled={isSaving}
                  >
                    Hủy
                  </button>
                  <button className="profile-btn" onClick={onSave} type="button" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-field">
              <label>Họ và tên</label>
              <input
                value={form.fullName}
                disabled={!isEditing}
                onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              />
            </div>

            <div className="profile-field">
              <label>Ngày sinh</label>
              <input
                type="date"
                value={form.birthday || ''}
                disabled={!isEditing}
                onChange={(e) => setForm((p) => ({ ...p, birthday: e.target.value }))}
              />
            </div>

            <div className="profile-field">
              <label>Số điện thoại</label>
              <input
                value={form.phoneNumber}
                disabled={!isEditing}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              />
            </div>

            <div className="profile-field">
              <label>Địa chỉ</label>
              <input
                value={form.address}
                disabled={!isEditing}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

