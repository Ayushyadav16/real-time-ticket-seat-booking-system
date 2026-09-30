import React, { useState, useEffect } from 'react';
import { movieService } from '../../services/movieService';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminMovies() {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 120,
    language: 'English',
    releaseDate: '',
    posterUrl: ''
  });

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/movies" replace />;
  }

  const loadMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getAll();
      setMovies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const openCreateModal = () => {
    setEditingMovieId(null);
    setFormData({
      title: '',
      description: '',
      durationMinutes: 120,
      language: 'English',
      releaseDate: '',
      posterUrl: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovieId(movie.id);
    setFormData({
      title: movie.title,
      description: movie.description || '',
      durationMinutes: movie.durationMinutes,
      language: movie.language,
      releaseDate: movie.releaseDate || '',
      posterUrl: movie.posterUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingMovieId) {
        await movieService.update(editingMovieId, formData);
        setSuccess('Movie updated successfully!');
      } else {
        await movieService.create(formData);
        setSuccess('Movie created successfully!');
      }
      setIsModalOpen(false);
      loadMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save movie.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await movieService.delete(id);
      setSuccess(`Deleted "${title}" successfully.`);
      loadMovies();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Movie Management</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Add, update, or remove movies in catalog</p>
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
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          + Add New Movie
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading movies...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.875rem' }}>
                <th style={{ padding: '14px 16px' }}>Poster</th>
                <th style={{ padding: '14px 16px' }}>Title</th>
                <th style={{ padding: '14px 16px' }}>Language</th>
                <th style={{ padding: '14px 16px' }}>Duration</th>
                <th style={{ padding: '14px 16px' }}>Release Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', width: '60px' }}>
                    <img
                      src={movie.posterUrl || 'https://via.placeholder.com/50x70'}
                      alt={movie.title}
                      style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{movie.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.description}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{movie.language}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{movie.durationMinutes} mins</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{movie.releaseDate || 'N/A'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => openEditModal(movie)}
                      style={{
                        padding: '6px 12px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: 'none',
                        borderRadius: '4px',
                        marginRight: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id, movie.title)}
                      style={{
                        padding: '6px 12px',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '550px', width: '100%', padding: '24px' }}>
            <h2 style={{ margin: '0 0 16px', color: '#0f172a' }}>
              {editingMovieId ? 'Edit Movie' : 'Add New Movie'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>Duration (mins) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>Language *</label>
                  <input
                    type="text"
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500' }}>Poster URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
