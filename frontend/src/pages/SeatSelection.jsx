import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { seatBookingService } from '../services/seatBookingService';
import { bookingService } from '../services/bookingService';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';
import { connectShowSeatSocket } from '../services/websocketService';

export default function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wsConnected, setWsConnected] = useState(false);

  // Local selection before locking
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  // Active lock state
  const [lockedSeatIds, setLockedSeatIds] = useState([]);
  const [secondsRemaining, setSecondsRemaining] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [showData, seatsData] = await Promise.all([
        showService.getById(showId),
        seatBookingService.getShowSeats(showId)
      ]);
      setShow(showData);
      setSeats(seatsData);

      // Check if current user already has locked seats
      const myLocked = seatsData.filter((s) => s.status === 'LOCKED' && s.lockedByCurrentUser);
      if (myLocked.length > 0) {
        setLockedSeatIds(myLocked.map((s) => s.seatId));
        // Take min remaining seconds
        const minTtl = Math.min(...myLocked.map((s) => s.lockExpiresInSeconds || 300));
        setSecondsRemaining(minTtl > 0 ? minTtl : 300);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load show seats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [showId]);

  // Real-Time WebSocket Seat Updates
  useEffect(() => {
    if (!showId) return;

    const socketHandle = connectShowSeatSocket(
      showId,
      (event) => {
        const affectedIds = new Set(event.seatIds || []);
        const myUserId = user?.userId;

        setSeats((prevSeats) =>
          prevSeats.map((seat) => {
            if (!affectedIds.has(seat.seatId)) return seat;

            if (event.action === 'LOCKED') {
              const isMine = myUserId && myUserId === event.userId;
              return {
                ...seat,
                status: 'LOCKED',
                lockedByCurrentUser: isMine,
                lockExpiresInSeconds: 300,
              };
            } else if (event.action === 'UNLOCKED' || event.action === 'RELEASED') {
              return {
                ...seat,
                status: 'AVAILABLE',
                lockedByCurrentUser: false,
                lockExpiresInSeconds: null,
              };
            } else if (event.action === 'BOOKED') {
              return {
                ...seat,
                status: 'BOOKED',
                lockedByCurrentUser: false,
                lockExpiresInSeconds: null,
              };
            }
            return seat;
          })
        );

        // If seats were locked or booked by someone else, deselect them from my local unheld selection
        if (event.action === 'LOCKED' || event.action === 'BOOKED') {
          const isMine = myUserId && myUserId === event.userId;
          if (!isMine) {
            setSelectedSeatIds((prevSelected) => {
              const remaining = prevSelected.filter((id) => !affectedIds.has(id));
              if (remaining.length !== prevSelected.length) {
                setError('A seat in your selection was just locked/booked by another customer.');
              }
              return remaining;
            });
          }
        }
      },
      (status) => {
        setWsConnected(status === 'CONNECTED');
      }
    );

    return () => {
      socketHandle.disconnect();
    };
  }, [showId, user]);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining === null || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setLockedSeatIds([]);
          setSuccess('');
          setError('Your seat hold has expired. Please select seats again.');
          loadData();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const toggleSelectSeat = (seat) => {
    if (seat.status !== 'AVAILABLE') return;
    if (lockedSeatIds.length > 0) {
      setError('You already have seats held. Please release them first if you wish to change selection.');
      return;
    }
    setError('');
    setSelectedSeatIds((prev) =>
      prev.includes(seat.seatId)
        ? prev.filter((id) => id !== seat.seatId)
        : [...prev, seat.seatId]
    );
  };

  const handleLockSeats = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (selectedSeatIds.length === 0) {
      setError('Please select at least one available seat to hold.');
      return;
    }

    setError('');
    setSuccess('');
    try {
      const resp = await seatBookingService.lockSeats(showId, selectedSeatIds);
      setLockedSeatIds(selectedSeatIds);
      setSelectedSeatIds([]);
      setSecondsRemaining(resp.ttlSeconds || 300);
      setSuccess(`Seats locked! You have 5 minutes to confirm your booking.`);
      // Refresh seat data
      const updatedSeats = await seatBookingService.getShowSeats(showId);
      setSeats(updatedSeats);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock seats. Some may have just been taken.');
      loadData();
    }
  };

  const handleUnlockSeats = async () => {
    if (lockedSeatIds.length === 0) return;
    try {
      await seatBookingService.unlockSeats(showId, lockedSeatIds);
      setLockedSeatIds([]);
      setSecondsRemaining(null);
      setSuccess('Seats released successfully.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock seats.');
    }
  };

  const handleConfirmBooking = async () => {
    if (lockedSeatIds.length === 0) return;
    try {
      setSubmittingBooking(true);
      setError('');
      const resp = await bookingService.createBooking(showId, lockedSeatIds);
      navigate('/my-bookings', {
        state: {
          message: `Booking Confirmed! Reference: ${resp.bookingReference}. A notification has been dispatched.`
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Group seats by Row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.rowLabel]) acc[seat.rowLabel] = [];
    acc[seat.rowLabel].push(seat);
    return acc;
  }, {});

  // Compute selected or locked total price
  const activeIds = lockedSeatIds.length > 0 ? lockedSeatIds : selectedSeatIds;
  const activeSeats = seats.filter((s) => activeIds.includes(s.seatId));
  const totalPrice = activeSeats.reduce((sum, s) => sum + (s.price || 12.0), 0);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Show header info */}
      {show && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px 24px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/shows" style={{ textDecoration: 'none', color: '#64748b', fontSize: '0.9rem' }}>&larr; Back to Shows</Link>
            </div>
            <h1 style={{ margin: '8px 0 4px', fontSize: '1.75rem', color: '#0f172a' }}>{show.movieTitle}</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
              📍 <strong>{show.theatreName}</strong> ({show.theatreCity}) &bull; {show.screenName} &bull; {show.movieLanguage}
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: wsConnected ? '#ecfdf5' : '#f8fafc',
              border: wsConnected ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: wsConnected ? '#059669' : '#64748b'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: wsConnected ? '#10b981' : '#94a3b8',
                boxShadow: wsConnected ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none',
                display: 'inline-block'
              }} />
              {wsConnected ? 'Live Seat Sync Active' : 'Connecting Sync...'}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {new Date(show.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Countdown Alert Banner */}
      {secondsRemaining !== null && secondsRemaining > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde047',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#854d0e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
            <div>
              <strong>Seats Temporarily Locked in Redis!</strong>
              <div style={{ fontSize: '0.85rem' }}>
                Your seats are reserved. Confirm before the 5-minute timer expires.
              </div>
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#b45309' }}>
            {formatTimer(secondsRemaining)}
          </div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {/* Seat layout and selection container */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px 20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {/* Cinema Screen Indicator */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            height: '8px',
            background: 'linear-gradient(to bottom, #94a3b8, #cbd5e1)',
            borderRadius: '50%',
            maxWidth: '500px',
            margin: '0 auto 8px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
          }} />
          <span style={{ color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
            All eyes this way &bull; Cinema Screen
          </span>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          fontSize: '0.825rem',
          color: '#475569'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #3b82f6', background: 'white' }}></span>
            Regular ($12)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #8b5cf6', background: 'white' }}></span>
            Premium ($18)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #f59e0b', background: 'white' }}></span>
            Recliner ($25)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#10b981' }}></span>
            Selected
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#eab308' }}></span>
            Your Lock 🔒
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#94a3b8' }}></span>
            Locked / Unavailable
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#ef4444' }}></span>
            Booked
          </div>
        </div>

        {/* Seat Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            Loading seat availability...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '16px' }}>
            {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
              <div key={rowLabel} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>
                  {rowLabel}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.seatId);
                    const isLockedByMe = lockedSeatIds.includes(seat.seatId) || (seat.status === 'LOCKED' && seat.lockedByCurrentUser);
                    const isLockedByOther = seat.status === 'LOCKED' && !seat.lockedByCurrentUser;
                    const isBooked = seat.status === 'BOOKED';

                    let bg = 'white';
                    let borderColor = '#cbd5e1';
                    let color = '#334155';
                    let cursor = 'pointer';

                    if (seat.seatType === 'PREMIUM') borderColor = '#8b5cf6';
                    if (seat.seatType === 'RECLINER') borderColor = '#f59e0b';
                    if (seat.seatType === 'REGULAR') borderColor = '#3b82f6';

                    if (isSelected) {
                      bg = '#10b981';
                      borderColor = '#10b981';
                      color = 'white';
                    } else if (isLockedByMe) {
                      bg = '#eab308';
                      borderColor = '#eab308';
                      color = 'white';
                    } else if (isLockedByOther) {
                      bg = '#94a3b8';
                      borderColor = '#94a3b8';
                      color = 'white';
                      cursor = 'not-allowed';
                    } else if (isBooked) {
                      bg = '#ef4444';
                      borderColor = '#ef4444';
                      color = 'white';
                      cursor = 'not-allowed';
                    }

                    return (
                      <button
                        key={seat.seatId}
                        disabled={isBooked || isLockedByOther || (lockedSeatIds.length > 0 && !isLockedByMe)}
                        onClick={() => toggleSelectSeat(seat)}
                        title={`${seat.rowLabel}${seat.seatNumber} - ${seat.seatType} ($${seat.price}) - ${seat.status}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          color: color,
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          cursor: cursor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}
                      >
                        {isBooked ? '✕' : isLockedByOther ? '🔒' : isLockedByMe ? '🔒' : seat.seatNumber}
                      </button>
                    );
                  })}
                </div>

                <span style={{ width: '24px', fontWeight: 'bold', color: '#64748b', textAlign: 'center' }}>
                  {rowLabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Checkout Sticky Bottom Bar */}
      {activeSeats.length > 0 && (
        <div style={{
          position: 'sticky',
          bottom: '20px',
          marginTop: '24px',
          background: '#0f172a',
          color: 'white',
          borderRadius: '12px',
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {lockedSeatIds.length > 0 ? 'Locked Seats (Holding for you)' : 'Selected Seats (Not locked yet)'}:
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
              {activeSeats.map((s) => (
                <span
                  key={s.seatId}
                  style={{
                    background: lockedSeatIds.length > 0 ? '#eab308' : '#2563eb',
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  {s.rowLabel}{s.seatNumber} (${s.price})
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Amount</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>
                ${totalPrice.toFixed(2)}
              </div>
            </div>

            {lockedSeatIds.length === 0 ? (
              <button
                onClick={handleLockSeats}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                🔒 Hold &amp; Lock Selected Seats
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleUnlockSeats}
                  style={{
                    background: '#475569',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Release Seats
                </button>
                <button
                  disabled={submittingBooking}
                  onClick={handleConfirmBooking}
                  style={{
                    background: submittingBooking ? '#6ee7b7' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: submittingBooking ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingBooking ? 'Confirming Booking...' : 'Proceed to Payment & Confirm \u2192'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
