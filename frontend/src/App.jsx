import React, { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="app-container">
      <header className="navbar">
        <div className="brand">
          <span className="logo-icon">🎟️</span>
          <h1>TicketHub Real-Time</h1>
        </div>
        <nav className="nav-links">
          <span className="badge-tag">Phase 1: Project Setup & Baseline</span>
        </nav>
      </header>

      <main className="main-content">
        <div className="hero-banner">
          <h2>Real-Time Ticket &amp; Seat Booking System</h2>
          <p className="subtitle">
            Production-grade distributed booking engine powered by React.js, Spring Boot, MySQL, Redis, Kafka &amp; WebSocket.
          </p>
        </div>

        <section className="card status-card">
          <div className="card-header">
            <h3>System Health &amp; Baseline Integration Check</h3>
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
              <span className="label">Integration Status</span>
              <span className={`value pill ${health ? 'success' : 'danger'}`}>
                {health ? '✅ React ↔ Spring Boot ↔ MySQL Connected' : '❌ Backend Connection Failed'}
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
            <div className="phase-card active">
              <div className="phase-number">Phase 1</div>
              <h4>Project Setup &amp; Baseline</h4>
              <p>Spring Boot ↔ MySQL ↔ React integration established. Database schema ready.</p>
              <span className="phase-status done">Completed</span>
            </div>

            <div className="phase-card">
              <div className="phase-number">Phase 2</div>
              <h4>Authentication &amp; Security</h4>
              <p>User registration, BCrypt password hashing, JWT authentication, and CUSTOMER / ADMIN roles.</p>
              <span className="phase-status">Next Up</span>
            </div>

            <div className="phase-card">
              <div className="phase-number">Phase 3 &amp; 4</div>
              <h4>Movies, Theatres &amp; Shows</h4>
              <p>Admin management of movies, screens, seat layouts, show schedules, and pricing.</p>
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

            <div className="phase-card">
              <div className="phase-number">Phase 9 &amp; 10</div>
              <h4>Real-Time &amp; Production</h4>
              <p>WebSocket real-time seat sync across concurrent users and Docker containerization.</p>
              <span className="phase-status">Upcoming</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Real-Time Ticket &amp; Seat Booking System &bull; Version 1.0 Specification Implementation</p>
      </footer>
    </div>
  );
}

export default App;
