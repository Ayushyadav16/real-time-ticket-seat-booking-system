import React, { useState, useEffect } from 'react';
import { theatreService } from '../../services/theatreService';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminTheatres() {
  const { user } = useAuth();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected theatre & screens
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [screens, setScreens] = useState([]);
  const [loadingScreens, setLoadingScreens] = useState(false);

  // Modals
  const [isAddTheatreModal, setIsAddTheatreModal] = useState(false);
  const [theatreForm, setTheatreForm] = useState({ name: '', location: '', city: '' });

  const [isAddScreenModal, setIsAddScreenModal] = useState(false);
  const [screenForm, setScreenForm] = useState({ name: '', capacity: 50 });

  const [selectedScreenForSeats, setSelectedScreenForSeats] = useState(null);
  const [screenSeats, setScreenSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/theatres" replace />;
  }

  const loadTheatres = async () => {
    try {
      setLoading(true);
      const data = await theatreService.getAll();
      setTheatres(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load theatres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTheatres();
  }, []);

  const selectTheatre = async (theatre) => {
    setSelectedTheatre(theatre);
    try {
      setLoadingScreens(true);
      const data = await theatreService.getScreens(theatre.id);
      setScreens(data);
    } catch (err) {
      setError('Failed to load screens for theatre');
    } finally {
      setLoadingScreens(false);
    }
  };

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      await theatreService.create(theatreForm);
      setSuccess('Theatre created successfully!');
      setIsAddTheatreModal(false);
      setTheatreForm({ name: '', location: '', city: '' });
      loadTheatres();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create theatre');
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheatre) return;
    try {
      await theatreService.createScreen(selectedTheatre.id, screenForm);
      setSuccess('Screen added successfully!');
      setIsAddScreenModal(false);
      setScreenForm({ name: '', capacity: 50 });
      selectTheatre(selectedTheatre);
      loadTheatres();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add screen');
    }
  };

  const openSeatsView = async (screen) => {
    setSelectedScreenForSeats(screen);
    setIsSeatModalOpen(true);
    try {
      setLoadingSeats(true);
      const seats = await theatreService.getSeats(screen.id);
      setScreenSeats(seats);
    } catch (err) {
      setError('Failed to fetch seats');
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleGenerateDefaultLayout = async () => {
    if (!selectedScreenForSeats) return;
    try {
      setLoadingSeats(true);
      const defaultLayout = {
        rows: ['A', 'B', 'C', 'D', 'E'],
        seatsPerRow: 10,
        premiumRows: ['D'],
        reclinerRows: ['E']
      };
      const generated = await theatreService.generateSeats(selectedScreenForSeats.id, defaultLayout);
      setScreenSeats(generated);
      setSuccess('Standard 50-seat layout generated successfully!');
      selectTheatre(selectedTheatre);
    } catch (err) {
      setError('Failed to generate seats');
    } finally {
      setLoadingSeats(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Theatres & Screen Management</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Configure theatre locations, screens, and seat layouts</p>
        </div>
        <button
          onClick={() => setIsAddTheatreModal(true)}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Add New Theatre
        </button>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Theatres List */}
        <div>
          <h3 style={{ color: '#1e293b', marginBottom: '12px' }}>Theatres ({theatres.length})</h3>
          {loading ? (
            <div style={{ color: '#64748b' }}>Loading theatres...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {theatres.map((t) => (
                <div
                  key={t.id}
                  onClick={() => selectTheatre(t)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    background: selectedTheatre?.id === t.id ? '#eff6ff' : 'white',
                    border: '1px solid',
                    borderColor: selectedTheatre?.id === t.id ? '#3b82f6' : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, color: '#0f172a' }}>{t.name}</h4>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                      {t.city}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.85rem' }}>📍 {t.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Screens Panel for Selected Theatre */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {selectedTheatre ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>Screens at {selectedTheatre.name}</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>{selectedTheatre.city} &bull; {selectedTheatre.location}</p>
                </div>
                <button
                  onClick={() => setIsAddScreenModal(true)}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  + Add Screen
                </button>
              </div>

              {loadingScreens ? (
                <div style={{ color: '#64748b' }}>Loading screens...</div>
              ) : screens.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '8px' }}>
                  No screens yet. Click "+ Add Screen" to configure one.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {screens.map((sc) => (
                    <div
                      key={sc.id}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{sc.name}</div>
                        <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>
                          Configured Seats: <strong>{sc.seatCount}</strong> / Capacity: <strong>{sc.capacity}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => openSeatsView(sc)}
                        style={{
                          padding: '6px 12px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.825rem',
                          fontWeight: '500'
                        }}
                      >
                        Manage Seats Layout
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              &larr; Select a theatre from the left to view and configure screens & seat layouts.
            </div>
          )}
        </div>
      </div>

      {/* Add Theatre Modal */}
      {isAddTheatreModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '450px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Add New Theatre</h3>
            <form onSubmit={handleCreateTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Theatre Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinepolis Seasons Mall"
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Location / Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Magarpatta City"
                  value={theatreForm.location}
                  onChange={(e) => setTheatreForm({ ...theatreForm, location: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune"
                  value={theatreForm.city}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddTheatreModal(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {isAddScreenModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '420px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Add Screen to {selectedTheatre?.name}</h3>
            <form onSubmit={handleCreateScreen} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Screen Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Screen 1 (IMAX)"
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Initial Capacity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={screenForm.capacity}
                  onChange={(e) => setScreenForm({ ...screenForm, capacity: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddScreenModal(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600' }}
                >
                  Add Screen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Layout Modal */}
      {isSeatModalOpen && selectedScreenForSeats && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '700px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>{selectedScreenForSeats.name} - Seat Layout</h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Total Configured: {screenSeats.length} seats
                </p>
              </div>
              <button
                onClick={handleGenerateDefaultLayout}
                style={{
                  padding: '6px 14px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.85rem'
                }}
              >
                ⚡ Generate Default Layout (50 Seats)
              </button>
            </div>

            {/* Screen indicator */}
            <div style={{
              background: '#e2e8f0',
              textAlign: 'center',
              padding: '6px',
              borderRadius: '4px',
              margin: '20px auto 30px',
              maxWidth: '400px',
              color: '#475569',
              fontSize: '0.75rem',
              letterSpacing: '2px',
              fontWeight: '600'
            }}>
              CINEMA SCREEN THIS WAY
            </div>

            {/* Visual seat layout */}
            {loadingSeats ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading seat layout...</div>
            ) : screenSeats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                No seats configured for this screen. Click "Generate Default Layout" above to generate Rows A-E (10 seats/row).
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '14px', height: '14px', background: '#3b82f6', borderRadius: '3px' }}></span> Regular
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '14px', height: '14px', background: '#8b5cf6', borderRadius: '3px' }}></span> Premium
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '14px', height: '14px', background: '#f59e0b', borderRadius: '3px' }}></span> Recliner
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                  {Object.entries(
                    screenSeats.reduce((acc, seat) => {
                      if (!acc[seat.rowLabel]) acc[seat.rowLabel] = [];
                      acc[seat.rowLabel].push(seat);
                      return acc;
                    }, {})
                  ).map(([rowLabel, seatsInRow]) => (
                    <div key={rowLabel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '20px', fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem' }}>{rowLabel}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {seatsInRow.map((seat) => {
                          const bg = seat.seatType === 'RECLINER' ? '#f59e0b' : seat.seatType === 'PREMIUM' ? '#8b5cf6' : '#3b82f6';
                          return (
                            <div
                              key={seat.id}
                              title={`${seat.rowLabel}${seat.seatNumber} (${seat.seatType})`}
                              style={{
                                width: '28px',
                                height: '28px',
                                background: bg,
                                color: 'white',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {seat.seatNumber}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setIsSeatModalOpen(false)}
                style={{
                  padding: '8px 18px',
                  background: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
