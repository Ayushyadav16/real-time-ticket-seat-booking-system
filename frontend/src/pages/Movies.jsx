import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = async (query = '') => {
    try {
      setLoading(true);
      setError('');
      const data = await movieService.getAll(query);
      setMovies(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMovies(search);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Now Showing & Upcoming</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Discover the latest blockbuster movies and select your preferred cinema</p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search movie by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.95rem',
              minWidth: '260px'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); fetchMovies(''); }}
              style={{
                background: '#e2e8f0',
                color: '#334155',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          Loading movies...
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ color: '#475569', marginBottom: '8px' }}>No movies found</h3>
          <p style={{ color: '#94a3b8' }}>Try searching for a different title or check back later.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ height: '360px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
                <img
                  src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=' + encodeURIComponent(movie.title); }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  fontSize: '0.8rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  {movie.language}
                </div>
              </div>

              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>
                  {movie.title}
                </h3>
                
                <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '0.875rem', marginBottom: '12px' }}>
                  <span>⏱ {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                  {movie.releaseDate && <span>📅 {movie.releaseDate}</span>}
                </div>

                <p style={{
                  color: '#475569',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  margin: '0 0 16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {movie.description || 'No description provided.'}
                </p>

                <div style={{
                  padding: '10px 0 0',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: '600' }}>View Details & Shows &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Movie Details */}
      {selectedMovie && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}
        onClick={() => setSelectedMovie(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', gap: '20px', padding: '24px' }}>
              <img
                src={selectedMovie.posterUrl || 'https://via.placeholder.com/300x450'}
                alt={selectedMovie.title}
                style={{ width: '180px', height: '260px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>{selectedMovie.title}</h2>
                <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '0.9rem', marginBottom: '14px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{selectedMovie.language}</span>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{selectedMovie.durationMinutes} mins</span>
                  {selectedMovie.releaseDate && (
                    <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{selectedMovie.releaseDate}</span>
                  )}
                </div>
                <h4 style={{ margin: '12px 0 6px', color: '#334155' }}>Synopsis</h4>
                <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: '1.6', margin: 0 }}>
                  {selectedMovie.description || 'No description available.'}
                </p>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setSelectedMovie(null)}
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
