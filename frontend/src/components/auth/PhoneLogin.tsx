import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PhoneLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'register';
  role?: 'client' | 'driver' | 'carwash';
}

const PhoneLogin: React.FC<PhoneLoginProps> = ({ 
  onSuccess, 
  onError, 
  mode = 'login',
  role = 'client' 
}) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const formatPhone = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add + if not present
    return digits ? `+${digits}` : '';
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);
      const response = await axios.post(`${API_URL}/auth/phone/send-code`, {
        phone: formattedPhone,
      });

      if (response.data.success) {
        setOtpSent(true);
        setStep('verify');
        
        // In development, show the code
        if (response.data.code) {
          console.log('📱 OTP Code (dev only):', response.data.code);
        }
      } else {
        throw new Error(response.data.message || 'Failed to send code');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send verification code';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);
      const response = await axios.post(`${API_URL}/auth/phone/verify`, {
        phone: formattedPhone,
        code,
        role: mode === 'register' ? role : undefined,
        name: mode === 'register' ? name : undefined,
      });

      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Set auth state
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update auth context
        if (setAuthUser) {
          await setAuthUser(userData.email || phone, '');
        }

        onSuccess?.();

        // Navigate based on role
        setTimeout(() => {
          if (userData.role === 'admin') {
            navigate('/admin');
          } else if (userData.role === 'carwash') {
            navigate('/carwash');
          } else if (userData.role === 'driver') {
            navigate('/driver');
          } else {
            navigate('/client');
          }
        }, 100);
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Verification failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setCode('');
    setOtpSent(false);
    setError('');
  };

  return (
    <div className="phone-login">
      {step === 'phone' ? (
        <form onSubmit={handleSendCode}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              required
              disabled={loading}
            />
            <small>Enter your phone number with country code (e.g., +260971234567)</small>
          </div>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Sending code...</span>
              </>
            ) : (
              'Send Verification Code'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              disabled={loading}
              className="otp-input"
            />
            <small>
              Enter the 6-digit code sent to {phone}
              {process.env.NODE_ENV === 'development' && (
                <span className="dev-hint"> (Check console for mock code)</span>
              )}
            </small>
          </div>
          <div className="phone-verify-actions">
            <button type="button" onClick={handleBack} className="btn btn-secondary" disabled={loading}>
              Change Number
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Verifying...</span>
                </>
              ) : (
                mode === 'register' ? 'Register' : 'Login'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PhoneLogin;
