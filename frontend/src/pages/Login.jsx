import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TicketIcon,
  LockClosedIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  ZapIcon,
  CheckCircleIcon
} from '../components/Icons';
import '../styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card">
        {/* Left: Brand Identity Panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-top">
            <div className="brand-badge">
              <TicketIcon size={16} /> Book My Seat
            </div>

            <h1 className="brand-hero-title">
              Instant Cinema Booking with Zero Conflicts.
            </h1>

            <p className="brand-hero-desc">
              Next-generation ticket reservation engine engineered with Redis atomic locking, real-time WebSocket state, and Kafka event streaming.
            </p>

            <ul className="brand-feature-list">
              <li className="brand-feature-item">
                <div className="brand-feature-icon">
                  <CheckCircleIcon size={14} />
                </div>
                <span><strong>Atomic 5-Min Hold:</strong> No race conditions while you choose seats</span>
              </li>
              <li className="brand-feature-item">
                <div className="brand-feature-icon">
                  <CheckCircleIcon size={14} />
                </div>
                <span><strong>Live WebSocket Sync:</strong> See seat status changes live across users</span>
              </li>
              <li className="brand-feature-item">
                <div className="brand-feature-icon">
                  <CheckCircleIcon size={14} />
                </div>
                <span><strong>Digital QR Passes:</strong> Instant confirmed e-tickets saved to your account</span>
              </li>
              <li className="brand-feature-item">
                <div className="brand-feature-icon">
                  <CheckCircleIcon size={14} />
                </div>
                <span><strong>Zero Double-Booking:</strong> Relational constraints guarantee single owner</span>
              </li>
            </ul>
          </div>

          <div className="auth-brand-bottom">
            <span>&copy; {new Date().getFullYear()} Book My Seat &bull; High-Concurrency Distributed Architecture</span>
          </div>
        </div>

        {/* Right: Authentication Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="auth-error-alert">
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-input-label">Email Address</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-meta-row">
              <label className="auth-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          {/* Quick-Fill Demo Credentials */}
          <div className="demo-fill-card">
            <div className="demo-fill-title">
              <ZapIcon size={14} /> Quick-Fill Demo Credentials (Click to Populate):
            </div>
            <div className="demo-fill-btns">
              <button
                type="button"
                className="demo-btn-chip admin-chip"
                onClick={() => fillCredentials('admin@ticketbooking.com', 'Admin@123')}
              >
                👑 Admin Account
              </button>
              <button
                type="button"
                className="demo-btn-chip customer-chip"
                onClick={() => fillCredentials('alice@example.com', 'Password@123')}
              >
                👤 Customer Account
              </button>
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create new account &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
