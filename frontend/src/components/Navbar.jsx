import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="logo-icon">🎟️</span>
          <h1>TicketHub Real-Time</h1>
        </Link>
      </div>

      <nav className="nav-links">
        <Link to="/" className="nav-item">Dashboard</Link>

        {isAuthenticated ? (
          <div className="user-profile-menu">
            <span className={`role-badge ${isAdmin ? 'admin-badge' : 'customer-badge'}`}>
              {isAdmin ? '👑 ADMIN' : '👤 CUSTOMER'}
            </span>
            <span className="user-name">{user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
