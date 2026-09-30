import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FilmIcon,
  BuildingIcon,
  ScreenIcon,
  CalendarIcon,
  TicketIcon,
  CurrencyDollarIcon,
  PlusIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  ZapIcon,
  SparklesIcon,
  ClockIcon,
  MapPinIcon,
  LockClosedIcon
} from '../../components/Icons';
import '../../styles/dashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    moviesCount: 0,
    theatresCount: 0,
    screensCount: 0,
    showsTodayCount: 0,
    bookingsCount: 0,
    totalRevenue: 0,
  });
  const [upcomingShows, setUpcomingShows] = useState([]);

  // Safe wrapper to prevent crashes when backend or individual endpoints are offline
  const safe = async (requestFn, fallback) => {
    try {
      const res = await requestFn();
      return Array.isArray(res.data) ? res.data : (res.data || fallback);
    } catch (err) {
      console.warn('Admin API query degraded safely:', err?.message || err);
      return fallback;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      setLoading(true);

      const todayStr = new Date().toISOString().split('T')[0];

      const [movies, theatres, shows, adminBookings] = await Promise.all([
        safe(() => api.get('/movies'), []),
        safe(() => api.get('/theatres'), []),
        safe(() => api.get('/shows'), []),
        safe(() => api.get('/bookings/admin'), [])
      ]);

      if (!isMounted) return;

      const showsList = Array.isArray(shows) ? shows : [];
      const bookingsList = Array.isArray(adminBookings) ? adminBookings : [];
      const theatresList = Array.isArray(theatres) ? theatres : [];
      const moviesList = Array.isArray(movies) ? movies : [];

      // Filter shows for today
      const showsToday = showsList.filter((s) => {
        if (!s || !s.startTime) return false;
        return s.startTime.startsWith(todayStr);
      });

      // Filter upcoming shows for table (sorted by startTime ascending)
      const sortedShows = [...showsList]
        .filter((s) => s && s.startTime)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 5);

      // Calculate confirmed revenue
      const confirmed = bookingsList.filter((b) => b && b.status === 'CONFIRMED');
      const revenue = confirmed.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);

      // Compute total screens across all theatres
      const totalScreens = theatresList.reduce((sum, t) => sum + (t.screenCount || 0), 0);

      setStats({
        moviesCount: moviesList.length,
        theatresCount: theatresList.length,
        screensCount: totalScreens,
        showsTodayCount: showsToday.length,
        bookingsCount: bookingsList.length,
        totalRevenue: revenue,
      });

      setUpcomingShows(sortedShows);
      setLoading(false);
    };

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="dashboard-container">
      {/* Admin Greeting Hero */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <ShieldCheckIcon size={14} /> Platform Control Center
          </div>
          <h1 className="hero-title">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="hero-subtitle">
            System overview for <strong>{todayFormatted}</strong> &bull; Monitor live seat locks, theatre screens, and ticket booking operations.
          </p>
        </div>
      </section>

      {/* 6 KPI Cards */}
      <section>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap indigo">
              <FilmIcon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Active Movies</span>
              <span className="kpi-value">{loading ? '—' : stats.moviesCount}</span>
              <span className="kpi-subtext">In catalog</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap violet">
              <BuildingIcon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Theatres</span>
              <span className="kpi-value">{loading ? '—' : stats.theatresCount}</span>
              <span className="kpi-subtext">Active locations</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap sky">
              <ScreenIcon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Screens</span>
              <span className="kpi-value">{loading ? '—' : stats.screensCount}</span>
              <span className="kpi-subtext">With seat layouts</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap amber">
              <CalendarIcon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Shows Today</span>
              <span className="kpi-value">{loading ? '—' : stats.showsTodayCount}</span>
              <span className="kpi-subtext">Scheduled showtimes</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap rose">
              <TicketIcon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">All Bookings</span>
              <span className="kpi-value">{loading ? '—' : stats.bookingsCount}</span>
              <span className="kpi-subtext">Tickets issued</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap emerald">
              <CurrencyDollarIcon size={24} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Revenue</span>
              <span className="kpi-value">${loading ? '0.00' : stats.totalRevenue.toFixed(2)}</span>
              <span className="kpi-subtext">Confirmed sales</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Quick Action Tiles */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <SparklesIcon size={20} /> Management Quick Actions
            </h2>
            <p className="section-subtitle">Direct shortcuts to admin configuration and reporting</p>
          </div>
        </div>

        <div className="action-grid">
          <Link to="/admin/shows" className="action-tile">
            <div className="action-tile-top">
              <div className="action-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <PlusIcon size={20} />
              </div>
              <ArrowRightIcon size={18} className="action-arrow" />
            </div>
            <div className="action-tile-bottom">
              <h3 className="action-name">Schedule Show</h3>
              <p className="action-desc">Add screen showtimes with overlap protection</p>
            </div>
          </Link>

          <Link to="/admin/movies" className="action-tile">
            <div className="action-tile-top">
              <div className="action-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <FilmIcon size={20} />
              </div>
              <ArrowRightIcon size={18} className="action-arrow" />
            </div>
            <div className="action-tile-bottom">
              <h3 className="action-name">Add Movie</h3>
              <p className="action-desc">Upload posters, descriptions, and durations</p>
            </div>
          </Link>

          <Link to="/admin/theatres" className="action-tile">
            <div className="action-tile-top">
              <div className="action-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <BuildingIcon size={20} />
              </div>
              <ArrowRightIcon size={18} className="action-arrow" />
            </div>
            <div className="action-tile-bottom">
              <h3 className="action-name">Theatres &amp; Screens</h3>
              <p className="action-desc">Configure venues and generate seat grids</p>
            </div>
          </Link>

          <Link to="/admin/bookings" className="action-tile">
            <div className="action-tile-top">
              <div className="action-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <TrendingUpIcon size={20} />
              </div>
              <ArrowRightIcon size={18} className="action-arrow" />
            </div>
            <div className="action-tile-bottom">
              <h3 className="action-name">Bookings &amp; Revenue</h3>
              <p className="action-desc">Inspect customer orders, filters, and reports</p>
            </div>
          </Link>

          <Link to="/shows" className="action-tile">
            <div className="action-tile-top">
              <div className="action-icon" style={{ background: '#f0f9ff', color: '#0284c7' }}>
                <ZapIcon size={20} />
              </div>
              <ArrowRightIcon size={18} className="action-arrow" />
            </div>
            <div className="action-tile-bottom">
              <h3 className="action-name">Live Seat Monitor</h3>
              <p className="action-desc">View real-time Redis seat holds on live shows</p>
            </div>
          </Link>

          <Link to="/movies" className="action-tile">
            <div className="action-tile-top">
              <div className="action-icon" style={{ background: '#fff1f2', color: '#e11d48' }}>
                <ScreenIcon size={20} />
              </div>
              <ArrowRightIcon size={18} className="action-arrow" />
            </div>
            <div className="action-tile-bottom">
              <h3 className="action-name">Catalog Discovery</h3>
              <p className="action-desc">Browse consumer-facing movie listings</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Upcoming Shows & Performance Snapshot (Two Columns) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
        {/* Upcoming Shows List */}
        <div className="dashboard-card">
          <div className="section-header" style={{ marginBottom: '14px' }}>
            <div>
              <h3 className="section-title">
                <CalendarIcon size={18} /> Upcoming Showtimes
              </h3>
              <p className="section-subtitle">Next scheduled screenings across your theatres</p>
            </div>
            <Link to="/admin/shows" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--bms-primary)', textDecoration: 'none' }}>
              Manage &rarr;
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' }}>
              <div className="shimmer" style={{ height: '40px', width: '100%' }} />
              <div className="shimmer" style={{ height: '40px', width: '100%' }} />
              <div className="shimmer" style={{ height: '40px', width: '100%' }} />
            </div>
          ) : upcomingShows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CalendarIcon size={26} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--bms-text-main)' }}>No shows scheduled yet</p>
              <p style={{ margin: '4px 0 16px', fontSize: '0.85rem' }}>Schedule your first movie screening to start accepting bookings.</p>
              <Link to="/admin/shows" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Schedule Show
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="shows-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Cinema</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingShows.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="show-movie-cell">
                          <img
                            src={s.moviePosterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'}
                            alt={s.movieTitle}
                            className="show-movie-thumb"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--bms-text-main)' }}>{s.movieTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--bms-text-subtle)' }}>{s.movieLanguage}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.theatreName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--bms-text-subtle)' }}>{s.screenName}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--bms-primary)' }}>
                          {s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--bms-text-subtle)' }}>
                          {s.startTime ? new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </div>
                      </td>
                      <td>
                        <Link
                          to={`/shows/${s.id}/seats`}
                          style={{
                            padding: '6px 10px',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          Seats &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Snapshot Panel */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 className="section-title">
                <ZapIcon size={18} /> Architecture &amp; Performance
              </h3>
              <p className="section-subtitle">Real-time state and distributed pipeline parameters</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'space-around' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LockClosedIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bms-text-main)' }}>Temporary Seat Lock Engine</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--bms-text-muted)' }}>Redis atomic SETNX with 5-minute (300s) TTL</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 8px', borderRadius: '9999px' }}>ACTIVE</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SparklesIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bms-text-main)' }}>Real-Time Live UI Sync</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--bms-text-muted)' }}>WebSocket &amp; STOMP broker on <code>/topic/shows/seats</code></div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '9999px' }}>STREAMING</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUpIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bms-text-main)' }}>Event-Driven Pipeline</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--bms-text-muted)' }}>Apache Kafka topic <code>booking-events</code> (Email &amp; Analytics)</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: '9999px' }}>READY</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheckIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--bms-text-main)' }}>Permanent Relational Store</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--bms-text-muted)' }}>MySQL 8.0 InnoDB with composite unique seat constraints</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '2px 8px', borderRadius: '9999px' }}>VERIFIED</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
