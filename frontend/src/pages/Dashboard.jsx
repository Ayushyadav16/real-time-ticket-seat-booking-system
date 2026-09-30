import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, isAdmin } = useAuth();

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      setHealth(response.data);
    } catch (err) {
      console.error('Failed to connect to backend:', err);
      setError(err.message || 'Could not connect to Spring Boot backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <main className="main-content">
      <div className="hero-banner">
        <h2>Real-Time Ticket &amp; Seat Booking System</h2>
        <p className="subtitle">
          Production-grade distributed booking engine powered by React.js, Spring Boot, MySQL, Redis, Kafka &amp; WebSocket.
        </p>

        {isAuthenticated ? (
          <div className="welcome-banner">
            <h3>Welcome back, {user?.name}!</h3>
            <p>
              Logged in as <span className={`role-pill ${isAdmin ? 'admin' : 'customer'}`}>{user?.role}</span> (<code>{user?.email}</code>)
            </p>
          </div>
        ) : (
          <div className="guest-cta">
            <Link to="/login" className="btn btn-primary cta-btn">Sign In to Test Role-Based Flows</Link>
            <Link to="/register" className="btn btn-secondary cta-btn">Register New User</Link>
          </div>
        )}
      </div>

      <section className="card status-card">
        <div className="card-header">
          <h3>System Health &amp; Security Status</h3>
          <button className="refresh-btn" onClick={fetchHealth} disabled={loading}>
            {loading ? 'Checking...' : '🔄 Re-check Status'}
          </button>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <span className="label">Frontend Layer</span>
            <span className="value pill success">React 18 + Vite (Port 5173)</span>
          </div>

          <div className="status-item">
            <span className="label">Backend API</span>
            <span className={`value pill ${health && health.status === 'UP' ? 'success' : error ? 'danger' : 'warning'}`}>
              {health ? `${health.status} (Port 8080)` : loading ? 'Checking...' : 'OFFLINE'}
            </span>
          </div>

          <div className="status-item">
            <span className="label">MySQL Database</span>
            <span className={`value pill ${health && health.database === 'CONNECTED' ? 'success' : error ? 'danger' : 'warning'}`}>
              {health ? `${health.database} (${health.databaseCatalog})` : loading ? 'Checking...' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="status-item">
            <span className="label">Authentication (Phase 2)</span>
            <span className={`value pill ${isAuthenticated ? 'success' : 'info'}`}>
              {isAuthenticated ? `Authenticated (${user?.role})` : 'Guest / Ready to Login'}
            </span>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <strong>Connection Error:</strong> {error}. Ensure Spring Boot is running on port 8080.
          </div>
        )}

        {health && (
          <div className="health-details">
            <p><strong>Application:</strong> {health.application}</p>
            <p><strong>Catalog:</strong> <code>{health.databaseCatalog}</code></p>
            <p><strong>Timestamp:</strong> <code>{health.timestamp}</code></p>
          </div>
        )}
      </section>

      <section className="phases-overview">
        <h3>Architecture &amp; Roadmap</h3>
        <div className="phase-cards">
          <div className="phase-card done-card">
            <div className="phase-number">Phase 1</div>
            <h4>Project Setup &amp; Baseline</h4>
            <p>Spring Boot ↔ MySQL ↔ React integration established. Database schema ready.</p>
            <span className="phase-status done">Completed</span>
          </div>

          <div className="phase-card done-card">
            <div className="phase-number">Phase 2</div>
            <h4>Authentication &amp; Security</h4>
            <p>BCrypt password hashing, JWT stateless authentication, CUSTOMER and ADMIN roles, validation.</p>
            <span className="phase-status done">Completed</span>
          </div>

          <div className="phase-card active">
            <div className="phase-number">Phase 3</div>
            <h4>Movie &amp; Theatre Management</h4>
            <p>Admin management of movies, theatres, screens, and seat layouts.</p>
            <span className="phase-status next">Next Up</span>
          </div>

          <div className="phase-card">
            <div className="phase-number">Phase 4</div>
            <h4>Show Management</h4>
            <p>Scheduling shows, setting ticket prices, start/end times, and status tracking.</p>
            <span className="phase-status">Upcoming</span>
          </div>

          <div className="phase-card">
            <div className="phase-number">Phase 5 &amp; 6</div>
            <h4>Redis Seat Locking</h4>
            <p>High-concurrency atomic seat locking with 5-minute TTL to prevent race conditions.</p>
            <span className="phase-status">Upcoming</span>
          </div>

          <div className="phase-card">
            <div className="phase-number">Phase 7 &amp; 8</div>
            <h4>Bookings &amp; Kafka Events</h4>
            <p>ACID booking transactions in MySQL and asynchronous event stream with Apache Kafka.</p>
            <span className="phase-status">Upcoming</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
