import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GoogleLoginButtonProps {
  role?: 'client' | 'driver' | 'carwash';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ role, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const { loginWithGoogle } = auth;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setLoading(true);
    try {
      if (loginWithGoogle) {
        const userData = await loginWithGoogle(credentialResponse.credential, role);
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
        // Fallback to direct API call
        const response = await axios.post(`${API_URL}/auth/google`, {
          token: credentialResponse.credential,
          role: role || 'client',
        });

        if (response.data.success) {
          const { token, ...userData } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
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
          throw new Error(response.data.message || 'Google login failed');
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    onError?.('Google login failed. Please try again.');
  };

  return (
    <div className="google-login-button">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
      />
      {loading && <p style={{ marginTop: '1rem', textAlign: 'center' }}>Signing in with Google...</p>}
    </div>
  );
};

export default GoogleLoginButton;
