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

      <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link to="/" className="nav-item">Dashboard</Link>
        <Link to="/movies" className="nav-item">Movies</Link>
        <Link to="/theatres" className="nav-item">Cinemas</Link>
        <Link to="/shows" className="nav-item">Showtimes</Link>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid #cbd5e1', paddingLeft: '12px' }}>
            <Link to="/admin/movies" className="nav-item" style={{ color: '#2563eb', fontWeight: '600' }}>Admin: Movies</Link>
            <Link to="/admin/theatres" className="nav-item" style={{ color: '#2563eb', fontWeight: '600' }}>Admin: Theatres</Link>
            <Link to="/admin/shows" className="nav-item" style={{ color: '#2563eb', fontWeight: '600' }}>Admin: Shows</Link>
          </div>
        )}

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
