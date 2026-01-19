import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import PageLayout from '../components/PageLayout';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import PhoneLogin from '../components/auth/PhoneLogin';
import DownloadAppSection from '../components/DownloadAppSection';
import BackgroundCars from '../components/animations/BackgroundCars';
import FloatingElements from '../components/animations/FloatingElements';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './Login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'phone'>('email');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'carwash') {
      navigate('/carwash');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const loggedInUser = user || (await new Promise((resolve) => {
        setTimeout(() => resolve(null), 100);
      }));
      
      // Navigate based on role - wait for user state to update
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role === 'admin') {
          navigate('/admin');
        } else if (currentUser.role === 'carwash') {
          navigate('/carwash');
        } else if (currentUser.role === 'driver') {
          navigate('/driver');
        } else if (currentUser.role === 'client') {
          navigate('/client');
        }
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const LoginContent = () => (
    <div className="login-container">
      <BackgroundCars count={5} speed="slow" />
      <FloatingElements type="bubbles" count={8} intensity="low" />
      <FloatingElements type="sparkles" count={6} intensity="low" />
      <div className="login-box">
        <div className="login-logo-container">
          <img 
            src="/images/Sucar.png" 
            alt="SuCAR Logo" 
            className="login-logo"
          />
        </div>
        <h1>SuCAR</h1>
        <h2>Car Wash Booking System</h2>

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

        {/* Email/Password Login */}
        {authMethod === 'email' && (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* Google Login */}
        {authMethod === 'google' && (
          <div className="google-login-section">
            {GOOGLE_CLIENT_ID ? (
              <GoogleLoginButton
                role="client"
                onSuccess={() => {
                  // Navigation handled in GoogleLoginButton
                }}
                onError={(err) => setError(err)}
              />
            ) : (
              <div className="error-message">
                Google login is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.
              </div>
            )}
          </div>
        )}

        {/* Phone Login */}
        {authMethod === 'phone' && (
          <PhoneLogin
            mode="login"
            onSuccess={() => {
              // Navigation handled in PhoneLogin
            }}
            onError={(err) => setError(err)}
          />
        )}

        <p className="login-note">
          <a href="/register">Don't have an account? Register</a>
        </p>

        {/* Download App Section */}
        <div className="login-download-section">
          <DownloadAppSection variant="compact" />
        </div>
      </div>
    </div>
  );

  return (
    <PageLayout>
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <LoginContent />
        </GoogleOAuthProvider>
      ) : (
        <LoginContent />
      )}
    </PageLayout>
  );
};

export default Login;
