import React, { useState, useEffect } from 'react';
import { theatreService } from '../services/theatreService';

export default function Theatres() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [error, setError] = useState('');
  const [expandedTheatre, setExpandedTheatre] = useState(null);
  const [screensMap, setScreensMap] = useState({});
  const [loadingScreens, setLoadingScreens] = useState(false);

  const fetchTheatres = async (city = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await theatreService.getAll(city);
      setTheatres(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres(cityFilter);
  }, [cityFilter]);

  const toggleScreens = async (theatreId) => {
    if (expandedTheatre === theatreId) {
      setExpandedTheatre(null);
      return;
    }
    setExpandedTheatre(theatreId);
    if (!screensMap[theatreId]) {
      try {
        setLoadingScreens(true);
        const screens = await theatreService.getScreens(theatreId);
        setScreensMap((prev) => ({ ...prev, [theatreId]: screens }));
      } catch (err) {
        console.error('Failed to load screens', err);
      } finally {
        setLoadingScreens(false);
      }
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Cinemas & Theatres</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Browse partnered theatres, view cinema halls and screening rooms</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['', 'Mumbai', 'Delhi'].map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: cityFilter === c ? '#2563eb' : '#cbd5e1',
                background: cityFilter === c ? '#2563eb' : 'white',
                color: cityFilter === c ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {c === '' ? 'All Cities' : c}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading theatres...
        </div>
      ) : theatres.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#475569', marginBottom: '8px' }}>No theatres found</h3>
          <p style={{ color: '#94a3b8' }}>Try choosing a different city.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {theatres.map((theatre) => (
            <div
              key={theatre.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{theatre.name}</h3>
                    <span style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {theatre.city}
                    </span>
                  </div>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                    📍 {theatre.location}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#475569', fontSize: '0.9rem' }}>
                    📺 <strong>{theatre.screenCount}</strong> Screens
                  </span>
                  <button
                    onClick={() => toggleScreens(theatre.id)}
                    style={{
                      padding: '8px 16px',
                      background: expandedTheatre === theatre.id ? '#f1f5f9' : '#2563eb',
                      color: expandedTheatre === theatre.id ? '#334155' : 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {expandedTheatre === theatre.id ? 'Hide Screens' : 'View Screens'}
                  </button>
                </div>
              </div>

              {/* Screens Sub-view */}
              {expandedTheatre === theatre.id && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#334155', fontSize: '0.95rem' }}>Available Screens</h4>
                  {loadingScreens ? (
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading screens...</div>
                  ) : screensMap[theatre.id]?.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No screens configured yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                      {screensMap[theatre.id]?.map((sc) => (
                        <div
                          key={sc.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '12px 16px'
                          }}
                        >
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{sc.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                            Capacity: {sc.capacity} seats
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
