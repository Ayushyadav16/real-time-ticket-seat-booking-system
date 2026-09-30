import React, { useState, useEffect } from 'react';
import { showService } from '../../services/showService';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminShows() {
  const { user } = useAuth();
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Scheduling modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [calculatedEndTime, setCalculatedEndTime] = useState('');

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/shows" replace />;
  }

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const [showsData, moviesData, theatresData] = await Promise.all([
        showService.getShows({}),
        movieService.getAll(),
        theatreService.getAll()
      ]);
      setShows(showsData);
      setMovies(moviesData);
      setTheatres(theatresData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shows data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // When theatre changes in form, fetch its screens
  const handleTheatreChange = async (tId) => {
    setSelectedTheatreId(tId);
    setSelectedScreenId('');
    if (!tId) {
      setScreens([]);
      return;
    }
    try {
      const scr = await theatreService.getScreens(tId);
      setScreens(scr);
      if (scr.length > 0) setSelectedScreenId(scr[0].id);
    } catch (err) {
      console.error('Failed to load screens', err);
    }
  };

  // Movie selection
  const handleMovieChange = (mId) => {
    const m = movies.find((item) => String(item.id) === String(mId)) || null;
    setSelectedMovie(m);
  };

  // Recalculate end time whenever movie, date or time changes
  useEffect(() => {
    if (selectedMovie && startDate && startTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      if (!isNaN(startDateTime.getTime())) {
        const endDateTime = new Date(startDateTime.getTime() + (selectedMovie.durationMinutes + 15) * 60000);
        setCalculatedEndTime(endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } else {
      setCalculatedEndTime('');
    }
  }, [selectedMovie, startDate, startTime]);

  const openCreateModal = () => {
    setError('');
    setSuccess('');
    setSelectedMovie(movies.length > 0 ? movies[0] : null);
    setSelectedTheatreId(theatres.length > 0 ? theatres[0].id : '');
    if (theatres.length > 0) {
      theatreService.getScreens(theatres[0].id).then((sc) => {
        setScreens(sc);
        if (sc.length > 0) setSelectedScreenId(sc[0].id);
      });
    }
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setStartTime('14:00');
    setIsModalOpen(true);
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedMovie || !selectedScreenId || !startDate || !startTime) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const startIso = `${startDate}T${startTime}:00`;
      await showService.create({
        movieId: selectedMovie.id,
        screenId: Number(selectedScreenId),
        startTime: startIso
      });
      setSuccess('Show scheduled successfully!');
      setIsModalOpen(false);
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule show. Check for conflict!');
    }
  };

  const handleCancelShow = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel the show for "${title}"?`)) return;
    try {
      await showService.cancel(id);
      setSuccess(`Show cancelled successfully.`);
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel show');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Show Scheduling & Management</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Assign movies to cinema screens with automated conflict detection</p>
        </div>
        <button
          onClick={openCreateModal}
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
          + Schedule New Show
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading scheduled shows...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.875rem' }}>
                <th style={{ padding: '14px 16px' }}>Movie</th>
                <th style={{ padding: '14px 16px' }}>Cinema & Screen</th>
                <th style={{ padding: '14px 16px' }}>Start Time</th>
                <th style={{ padding: '14px 16px' }}>End Time</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{s.movieTitle}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.movieDurationMinutes} mins &bull; {s.movieLanguage}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '500', color: '#0f172a' }}>{s.theatreName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.screenName} ({s.theatreCity})</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500' }}>
                    {new Date(s.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      background: s.status === 'SCHEDULED' ? '#dcfce7' : s.status === 'CANCELLED' ? '#fee2e2' : '#f1f5f9',
                      color: s.status === 'SCHEDULED' ? '#16a34a' : s.status === 'CANCELLED' ? '#dc2626' : '#475569'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {s.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelShow(s.id, s.movieTitle)}
                        style={{
                          padding: '6px 12px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Cancel Show
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Show Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '520px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Schedule New Movie Show</h3>
            <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Select Movie *</label>
                <select
                  required
                  value={selectedMovie?.id || ''}
                  onChange={(e) => handleMovieChange(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.durationMinutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Theatre *</label>
                  <select
                    required
                    value={selectedTheatreId}
                    onChange={(e) => handleTheatreChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Screen *</label>
                  <select
                    required
                    value={selectedScreenId}
                    onChange={(e) => setSelectedScreenId(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {screens.map((sc) => (
                      <option key={sc.id} value={sc.id}>{sc.name} ({sc.capacity} seats)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Show Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              {calculatedEndTime && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#166534' }}>
                  ⏳ Estimated End Time: <strong>{calculatedEndTime}</strong> (incl. 15 min buffer)
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600' }}
                >
                  Schedule Show
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
