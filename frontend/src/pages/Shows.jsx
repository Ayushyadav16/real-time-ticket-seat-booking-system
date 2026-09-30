import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { movieService } from '../services/movieService';
import { theatreService } from '../services/theatreService';

export default function Shows() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected filters
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterStr = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const [selectedMovieId, setSelectedMovieId] = useState(searchParams.get('movieId') || '');
  const [selectedTheatreId, setSelectedTheatreId] = useState(searchParams.get('theatreId') || '');
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [movieList, theatreList] = await Promise.all([
          movieService.getAll(),
          theatreService.getAll()
        ]);
        setMovies(movieList);
        setTheatres(theatreList);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    loadMetadata();
  }, []);

  const fetchShows = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedMovieId) params.movieId = selectedMovieId;
      if (selectedTheatreId) params.theatreId = selectedTheatreId;
      if (selectedDate) params.date = selectedDate;

      const data = await showService.getShows(params);
      setShows(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load showtimes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [selectedMovieId, selectedTheatreId, selectedDate]);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const tId = show.theatreId || 'unknown';
    if (!acc[tId]) {
      acc[tId] = {
        name: show.theatreName,
        city: show.theatreCity,
        location: show.theatreLocation,
        shows: []
      };
    }
    acc[tId].shows.push(show);
    return acc;
  }, {});

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Showtimes & Tickets</h1>
        <p style={{ color: '#64748b', marginTop: '4px' }}>Find available shows by movie, theatre, and date</p>
      </div>

      {/* Filter Controls Bar */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Date Selector Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginRight: '4px' }}>Date:</span>
          {[
            { label: 'Today', val: todayStr },
            { label: 'Tomorrow', val: tomorrowStr },
            { label: 'Day After', val: dayAfterStr }
          ].map((d) => (
            <button
              key={d.val}
              onClick={() => setSelectedDate(d.val)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: selectedDate === d.val ? '#2563eb' : '#cbd5e1',
                background: selectedDate === d.val ? '#2563eb' : '#f8fafc',
                color: selectedDate === d.val ? 'white' : '#334155',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {d.label} ({d.val.slice(5)})
            </button>
          ))}
        </div>

        {/* Dropdowns for Movie & Theatre */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <select
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#1e293b',
              minWidth: '200px'
            }}
          >
            <option value="">All Movies</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>

          <select
            value={selectedTheatreId}
            onChange={(e) => setSelectedTheatreId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#1e293b',
              minWidth: '200px'
            }}
          >
            <option value="">All Cinemas</option>
            {theatres.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
            ))}
          </select>

          {(selectedMovieId || selectedTheatreId) && (
            <button
              onClick={() => {
                setSelectedMovieId('');
                setSelectedTheatreId('');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#e2e8f0',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading showtimes...
        </div>
      ) : Object.keys(showsByTheatre).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#475569', marginBottom: '8px' }}>No shows found for selected filters</h3>
          <p style={{ color: '#94a3b8' }}>Try choosing another date or movie.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(showsByTheatre).map(([theatreId, group]) => (
            <div
              key={theatreId}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>{group.name}</h3>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                    {group.city}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  📍 {group.location}
                </div>
              </div>

              {/* Show cards within theatre */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {group.shows.map((show) => (
                  <div
                    key={show.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '16px',
                      background: show.status === 'CANCELLED' ? '#f8fafc' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: show.status === 'CANCELLED' ? 0.6 : 1
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{
                          fontWeight: 'bold',
                          color: '#2563eb',
                          fontSize: '1.1rem'
                        }}>
                          {formatTime(show.startTime)}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          background: show.status === 'SCHEDULED' ? '#dcfce7' : show.status === 'CANCELLED' ? '#fee2e2' : '#f1f5f9',
                          color: show.status === 'SCHEDULED' ? '#16a34a' : show.status === 'CANCELLED' ? '#dc2626' : '#475569'
                        }}>
                          {show.status}
                        </span>
                      </div>

                      <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                        {show.movieTitle}
                      </div>

                      <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <span>🎬 {show.screenName}</span>
                        <span>&bull;</span>
                        <span>{show.movieLanguage}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Ends at {formatTime(show.endTime)}
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                      <button
                        disabled={show.status === 'CANCELLED'}
                        onClick={() => {
                          // In Phase 5 this navigates to the seat selection view
                          alert(`Show selected: ${show.movieTitle} at ${show.theatreName} (${formatTime(show.startTime)}). Seat booking will be enabled in Phase 5!`);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 0',
                          background: show.status === 'CANCELLED' ? '#cbd5e1' : '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          cursor: show.status === 'CANCELLED' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {show.status === 'CANCELLED' ? 'Cancelled' : 'Select Seats'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
