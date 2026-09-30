import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminBookings() {
  const { isAdmin } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [dateFilter, setDateFilter] = useState(todayStr);
  const [filterAll, setFilterAll] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (!filterAll && dateFilter) {
        params.date = dateFilter;
      }
      const response = await api.get('/bookings/admin', { params });
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings. Ensure you are logged in as ADMIN.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadBookings();
    }
  }, [dateFilter, filterAll, isAdmin]);

  if (!isAdmin) {
    return (
      <main className="main-content" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Access Restricted</h2>
        <p>You must be signed in with an <strong>ADMIN</strong> account to view revenue and customer bookings.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
          Sign In as Admin
        </Link>
      </main>
    );
  }

  // Calculate live aggregates
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
  const totalSeats = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

  return (
    <main className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', color: '#0f172a' }}>📊 Customer Bookings &amp; Revenue</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
            Real-time breakdown of all customer ticket purchases, showtimes, and daily earnings.
          </p>
        </div>

        {/* Date Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>Show Date:</label>
          <input
            type="date"
            value={dateFilter}
            disabled={filterAll}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              color: filterAll ? '#94a3b8' : '#0f172a',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filterAll}
              onChange={(e) => setFilterAll(e.target.checked)}
            />
            All Dates
          </label>
          <button
            onClick={loadBookings}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div style={{ background: 'white', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {filterAll ? 'All-Time Revenue' : 'Revenue for ' + dateFilter}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a', marginTop: '6px' }}>
            ${totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            Confirmed sales
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Confirmed Bookings
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb', marginTop: '6px' }}>
            {confirmedBookings.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            {bookings.length - confirmedBookings.length} cancelled
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Seats Booked
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginTop: '6px' }}>
            {totalSeats}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            Physical tickets issued
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            Loading customer booking data...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <h3>No bookings found</h3>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem' }}>
              {filterAll
                ? 'No customer has booked any shows yet.'
                : `No shows booked for ${dateFilter}. Try unchecking "Show Date" to view all records.`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Reference</th>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Customer</th>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Movie &amp; Theatre</th>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Show Time</th>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Seats</th>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '14px 18px', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb' }}>
                      {b.bookingReference}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{b.userName || 'Customer #' + b.userId}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.userEmail}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{b.movieTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {b.theatreName} &bull; {b.screenName}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ color: '#0f172a' }}>
                        {b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {b.startTime ? new Date(b.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {b.seats && b.seats.length > 0 ? (
                          b.seats.map((s, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#334155'
                              }}
                            >
                              {s.rowLabel}{s.seatNumber}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 'bold', color: '#0f172a' }}>
                      ${parseFloat(b.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: b.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                          color: b.status === 'CONFIRMED' ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
