import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import loginIllustration from '../assets/login-illustration.svg';
import { registerAccount } from '../api/auth';
import '../styles/RegisterPage.css';
import meVaBe from '../assets/me-va-be.jpeg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    birthday: '',
    address: '',
    phoneNumber: '',
    babyAgeGroup: 'under6',
  });

  const handleAccountSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      alert('Vui lòng nhập tên đăng nhập');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    setStep(2);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập Họ và Tên');
      return;
    }

    if (!formData.birthday.trim()) {
      alert('Vui lòng nhập Ngày sinh');
      return;
    }

    if (!formData.address.trim()) {
      alert('Vui lòng nhập Địa chỉ');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      alert('Vui lòng nhập Số điện thoại');
      return;
    }

    setIsLoading(true);

    try {
      await registerAccount({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        birthday: formData.birthday, // yyyy-MM-dd từ input type="date"
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      });

      alert('Đăng ký thành công! Hãy đăng nhập để tiếp tục.');
      navigate('/login');
    } catch (error) {
      alert(error.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleBackToAccount = () => {
    setStep(1);
  };

  return (
    <div className="register-container">
      <div className="register-main">
        {/* Left Side - Form */}
        <div className="register-form-section">
          <div className="register-form-card">
            {step === 1 ? (
              <>
                <div className="register-header">
                  <div className="register-logo-circle">Mi</div>
                  <h1 className="register-title">Tham gia gia đình MiMi!</h1>
                  <p className="register-subtitle">
                    Khám phá niềm vui làm cha mẹ cùng MiMi. Tạo tài khoản để bắt
                    đầu mua sắm!
                  </p>
                </div>

                <form onSubmit={handleAccountSubmit} className="register-form">
                  <div className="register-input-group">
                    <User className="register-input-icon" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Tên đăng nhập"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="register-form-input"
                      required
                    />
                  </div>

                  <div className="register-input-group">
                    <Mail className="register-input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Gmail"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="register-form-input"
                      required
                    />
                  </div>

                  <div className="register-input-group">
                    <Lock className="register-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="register-form-input register-password-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="register-password-toggle"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="register-input-group">
                    <Lock className="register-input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Xác nhận mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="register-form-input register-password-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="register-password-toggle"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <button type="submit" className="register-primary-button">
                    Tiếp tục
                  </button>
                </form>

                <div className="register-footer-link">
                  <span>Đã có tài khoản? </span>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="register-login-button"
                  >
                    Log in
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="register-back-button"
                  onClick={handleBackToAccount}
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại</span>
                </button>

                <div className="register-header">
                  <h1 className="register-title">Cập nhật thông tin cá nhân</h1>
                  <p className="register-subtitle">
                    Vui lòng cung cấp thêm thông tin để cá nhân hóa trải nghiệm
                    của bạn.
                  </p>
                </div>

                <form
                  onSubmit={handleProfileSubmit}
                  className="register-form register-form--profile"
                >
                  <label className="register-field-label" htmlFor="fullName">
                    Họ và Tên
                  </label>
                  <div className="register-input-group">
                    <User className="register-input-icon" />
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      placeholder="Họ và Tên của bạn"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="register-form-input"
                      required
                    />
                  </div>

                  <label className="register-field-label" htmlFor="birthday">
                    Ngày sinh
                  </label>
                  <div className="register-input-group">
                    <Calendar className="register-input-icon" />
                    <input
                      id="birthday"
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      className="register-form-input register-date-input"
                      required
                    />
                  </div>

                  <label className="register-field-label" htmlFor="address">
                    Địa chỉ
                  </label>
                  <div className="register-input-group">
                    <MapPin className="register-input-icon" />
                    <input
                      id="address"
                      type="text"
                      name="address"
                      placeholder="Nhập địa chỉ của bạn"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="register-form-input"
                      required
                    />
                  </div>

                  <label className="register-field-label" htmlFor="phoneNumber">
                    Số điện thoại
                  </label>
                  <div className="register-input-group">
                    <Phone className="register-input-icon" />
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      placeholder="090-123-4567"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="register-form-input"
                      required
                    />
                  </div>

                  <div className="register-field-group">
                    <span className="register-field-label">Tuổi của bé</span>
                    <div className="register-radio-group">
                      <label className="register-radio-option">
                        <input
                          type="radio"
                          name="babyAgeGroup"
                          value="newborn"
                          checked={formData.babyAgeGroup === 'newborn'}
                          onChange={handleInputChange}
                        />
                        <span>Sắp sinh</span>
                      </label>
                      <label className="register-radio-option">
                        <input
                          type="radio"
                          name="babyAgeGroup"
                          value="under6"
                          checked={formData.babyAgeGroup === 'under6'}
                          onChange={handleInputChange}
                        />
                        <span>Dưới 6 tháng</span>
                      </label>
                      <label className="register-radio-option">
                        <input
                          type="radio"
                          name="babyAgeGroup"
                          value="over6"
                          checked={formData.babyAgeGroup === 'over6'}
                          onChange={handleInputChange}
                        />
                        <span>Trên 6 tháng</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="register-primary-button"
                  >
                    {isLoading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="register-illustration-section">
          <div className="register-illustration-card">
            <img
              src={meVaBe} alt="Me và Bé" className="register-illustration-image" style={{objectFit: 'cover', width: '100%', height: '100%', objectPosition:'15%center'}} />
          </div>
        </div>
      </div>
    </div>
  );
}