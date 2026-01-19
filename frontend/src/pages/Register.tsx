import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import PhoneLogin from '../components/auth/PhoneLogin';
import DownloadAppSection from '../components/DownloadAppSection';
import BackgroundCars from '../components/animations/BackgroundCars';
import FloatingElements from '../components/animations/FloatingElements';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './Register.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'client' | 'driver' | 'carwash'>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    nrc: '',
    businessName: '',
    isBusiness: false,
    licenseNo: '',
    licenseType: '',
    licenseExpiry: '',
    address: '',
    maritalStatus: '',
    carWashName: '',
    location: '',
    washingBays: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        nrc: formData.nrc,
        role,
      };

      if (role === 'client') {
        payload.businessName = formData.businessName;
        payload.isBusiness = formData.isBusiness;
      } else if (role === 'driver') {
        payload.licenseNo = formData.licenseNo;
        payload.licenseType = formData.licenseType;
        payload.licenseExpiry = formData.licenseExpiry;
        payload.address = formData.address;
        payload.maritalStatus = formData.maritalStatus;
      } else if (role === 'carwash') {
        payload.carWashName = formData.carWashName;
        payload.location = formData.location;
        payload.washingBays = parseInt(formData.washingBays) || 0;
      }

      const response = await axios.post(`${API_URL}/auth/register`, payload);
      if (response.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.errors?.[0]?.msg 
        || err.message 
        || 'Registration failed. Please check your connection and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const RegisterContent = () => (
    <div className="register-container">
      <BackgroundCars count={5} speed="slow" />
      <FloatingElements type="sparkles" count={10} intensity="low" />
      <FloatingElements type="bubbles" count={7} intensity="low" />
      <FloatingElements type="cars" count={4} intensity="low" />
      <div className="register-box">
        <h1>Register - SuCAR</h1>
        
        {/* Role Selector */}
        <div className="role-selector">
          <button
            className={role === 'client' ? 'active' : ''}
            onClick={() => setRole('client')}
          >
            Client
          </button>
          <button
            className={role === 'driver' ? 'active' : ''}
            onClick={() => setRole('driver')}
          >
            Driver
          </button>
          <button
            className={role === 'carwash' ? 'active' : ''}
            onClick={() => setRole('carwash')}
          >
            Car Wash
          </button>
        </div>

        {/* Auth Method Selector */}
        <div className="auth-method-tabs">
          <button
            className={authMethod === 'email' ? 'active' : ''}
            onClick={() => setAuthMethod('email')}
          >
            Email
          </button>
          <button
            className={authMethod === 'google' ? 'active' : ''}
            onClick={() => setAuthMethod('google')}
          >
            Google
          </button>
          <button
            className={authMethod === 'phone' ? 'active' : ''}
            onClick={() => setAuthMethod('phone')}
          >
            Phone
          </button>
        </div>

        {/* Email/Password Registration */}
        {authMethod === 'email' && (
          <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>NRC *</label>
            <input
              type="text"
              value={formData.nrc}
              onChange={(e) => setFormData({ ...formData, nrc: e.target.value })}
              required
            />
          </div>

          {role === 'client' && (
            <>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isBusiness}
                    onChange={(e) => setFormData({ ...formData, isBusiness: e.target.checked })}
                  />
                  Business Account
                </label>
              </div>
              {formData.isBusiness && (
                <div className="form-group">
                  <label>Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
              )}
            </>
          )}

          {role === 'driver' && (
            <>
              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  value={formData.licenseNo}
                  onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>License Type *</label>
                <input
                  type="text"
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>License Expiry *</label>
                <input
                  type="date"
                  value={formData.licenseExpiry}
                  onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Marital Status *</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                  required
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            </>
          )}

          {role === 'carwash' && (
            <>
              <div className="form-group">
                <label>Car Wash Name *</label>
                <input
                  type="text"
                  value={formData.carWashName}
                  onChange={(e) => setFormData({ ...formData, carWashName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Washing Bays *</label>
                <input
                  type="number"
                  value={formData.washingBays}
                  onChange={(e) => setFormData({ ...formData, washingBays: e.target.value })}
                  required
                  min="1"
                />
              </div>
            </>
          )}

            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {/* Google Registration */}
        {authMethod === 'google' && (
          <div className="google-login-section">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLoginButton
                role={role}
                onSuccess={() => {
                  // Navigation handled in GoogleLoginButton
                }}
                onError={(err) => setError(err)}
              />
            ) : (
              <div className="error-message">
                Google registration is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.
              </div>
            )}
          </div>
        )}

        {/* Phone Registration */}
        {authMethod === 'phone' && (
          <PhoneLogin
            mode="register"
            role={role}
            onSuccess={() => {
              // Navigation handled in PhoneLogin
            }}
            onError={(err) => setError(err)}
          />
        )}

        <p className="register-note">
          Already have an account? <a href="/login">Login</a>
        </p>

        {/* Download App Section */}
        <div className="register-download-section">
          <DownloadAppSection variant="compact" />
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <RegisterContent />
        </GoogleOAuthProvider>
      ) : (
        <RegisterContent />
      )}
    </PageLayout>
  );
};

export default Register;
