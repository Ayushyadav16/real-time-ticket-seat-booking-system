import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

export default function BookingHistory() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to cancel booking "${ref}"? Refund will be processed.`)) return;
    try {
      await bookingService.cancelBooking(id);
      setSuccess(`Booking ${ref} was cancelled successfully.`);
      loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>My Bookings &amp; Digital Tickets</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>View your active movie tickets, booking references, and digital boarding passes</p>
      </div>

      {success && (
        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.25rem' }}>🎉</span>
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading tickets...</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#475569', marginBottom: '8px' }}>No bookings found</h3>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>You haven't booked any movie tickets yet.</p>
          <Link
            to="/shows"
            style={{
              display: 'inline-block',
              background: '#2563eb',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Explore Showtimes &rarr;
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                display: 'grid',
                gridTemplateColumns: '180px 1fr auto',
                opacity: b.status === 'CANCELLED' ? 0.7 : 1
              }}
            >
              {/* Poster section */}
              <div style={{ background: '#0f172a', position: 'relative' }}>
                <img
                  src={b.moviePosterUrl || 'https://via.placeholder.com/180x260'}
                  alt={b.movieTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Ticket Details */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{
                      background: '#f1f5f9',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: '#2563eb'
                    }}>
                      {b.bookingReference}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      background: b.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                      color: b.status === 'CONFIRMED' ? '#16a34a' : '#dc2626'
                    }}>
                      {b.status}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '1.35rem', color: '#0f172a' }}>{b.movieTitle}</h3>
                  <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '12px' }}>
                    📍 <strong>{b.theatreName}</strong> &bull; {b.screenName} ({b.theatreCity})
                  </div>

                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.875rem', color: '#64748b' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Showtime</div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {new Date(b.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Seats ({b.seats.length})</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                        {b.seats.map((s) => (
                          <span
                            key={s.seatId}
                            style={{
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: '600',
                              fontSize: '0.8rem'
                            }}
                          >
                            {s.rowLabel}{s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Booked on {new Date(b.createdAt).toLocaleDateString()}
                  </div>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(b.id, b.bookingReference)}
                      style={{
                        padding: '6px 14px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Stub / Price / QR side */}
              <div style={{
                background: '#f8fafc',
                borderLeft: '2px dashed #cbd5e1',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: '150px'
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '10px'
                }}>
                  🎟️
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Paid</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 'bold', color: '#16a34a' }}>
                  ${Number(b.totalAmount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
