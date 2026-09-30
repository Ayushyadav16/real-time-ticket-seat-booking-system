import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const msg = err.response?.data?.message || err.message || 'Login failed';
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
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign In to TicketHub</h2>
        <p className="auth-subtitle">Access showtimes, real-time seat locking, and bookings</p>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="demo-title">⚡ Quick-Fill Demo Accounts:</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn admin"
              onClick={() => fillCredentials('admin@ticketbooking.com', 'Admin@123')}
            >
              👑 Fill Admin (admin@ticketbooking.com)
            </button>
            <button
              type="button"
              className="demo-btn customer"
              onClick={() => fillCredentials('alice@example.com', 'Password@123')}
            >
              👤 Fill Customer (alice@example.com)
            </button>
          </div>
        </div>

        <p className="switch-auth">
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
