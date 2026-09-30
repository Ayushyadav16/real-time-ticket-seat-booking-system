import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  SearchIcon,
  TicketIcon,
  SparklesIcon,
  ArrowRightIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ClockIcon,
  ZapIcon,
  FilmIcon,
  CalendarIcon,
  MapPinIcon
} from '../../components/Icons';
import '../../styles/dashboard.css';

// Resilient fallback movies in case backend is offline or empty
const FALLBACK_MOVIES = [
  {
    id: 1,
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given an inverse task of planting an idea.',
    durationMinutes: 148,
    language: 'English',
    releaseDate: '2010-07-16',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'
  },
  {
    id: 2,
    title: 'Interstellar',
    description: 'A team of explorers travels through a wormhole in space in an attempt to ensure humanity\'s survival.',
    durationMinutes: 169,
    language: 'English',
    releaseDate: '2014-11-07',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
  },
  {
    id: 3,
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.',
    durationMinutes: 152,
    language: 'English',
    releaseDate: '2008-07-18',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800'
  }
];

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Thriller', 'Adventure'];

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [nextBooking, setNextBooking] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      // 1. Safely load movies
      try {
        const res = await api.get('/movies');
        if (isMounted) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setMovies(res.data);
          } else {
            setMovies(FALLBACK_MOVIES);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback movies:', err?.message || err);
        if (isMounted) setMovies(FALLBACK_MOVIES);
      }

      // 2. Safely load user's next upcoming booking if authenticated
      if (isAuthenticated) {
        try {
          const bookingsRes = await api.get('/bookings');
          if (isMounted && Array.isArray(bookingsRes.data)) {
            const now = new Date();
            const futureConfirmed = bookingsRes.data
              .filter((b) => b.status === 'CONFIRMED' && b.startTime && new Date(b.startTime) > now)
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            if (futureConfirmed.length > 0) {
              setNextBooking(futureConfirmed[0]);
            }
          }
        } catch (err) {
          console.warn('Could not load next booking for customer:', err?.message);
        }
      }

      if (isMounted) setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Client-side search and genre filtering
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.language && m.language.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGenre =
        selectedGenre === 'All' ||
        (m.title && m.title.toLowerCase().includes(selectedGenre.toLowerCase())) ||
        (m.description && m.description.toLowerCase().includes(selectedGenre.toLowerCase()));

      return matchesSearch && matchesGenre;
    });
  }, [movies, searchTerm, selectedGenre]);

  return (
    <div className="dashboard-container">
      {/* Customer Greeting Hero with Live Search */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <SparklesIcon size={14} /> Real-Time Seat Selection &bull; Book My Seat
          </div>
          <h1 className="hero-title">
            {isAuthenticated
              ? `Hey ${user?.name || 'Moviegoer'}, ready for cinema night?`
              : 'Book your cinema tickets with zero double-booking'}
          </h1>
          <p className="hero-subtitle">
            Experience atomic 5-minute seat locking, live WebSocket availability sync, and instant digital tickets across your favorite screens.
          </p>

          {/* Live Search Bar */}
          <div className="search-bar-wrap">
            <input
              type="text"
              placeholder="Search movies, languages, or genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon-pos">
              <SearchIcon size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Optional "Your Next Show" Banner */}
      {nextBooking && (
        <section className="boarding-pass-banner">
          <div className="boarding-pass-left">
            <div className="boarding-pass-icon">
              <TicketIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Next Screening
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bms-text-main)', margin: '2px 0' }}>
                {nextBooking.movieTitle}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--bms-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>📍 {nextBooking.theatreName} ({nextBooking.screenName})</span>
                <span>&bull;</span>
                <span>📅 {new Date(nextBooking.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(nextBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {nextBooking.seats && nextBooking.seats.length > 0 && (
                  <>
                    <span>&bull;</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      Seats: {nextBooking.seats.map((s) => `${s.rowLabel}${s.seatNumber}`).join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Link
            to="/my-bookings"
            className="btn btn-primary"
            style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none' }}
          >
            View Digital Ticket &rarr;
          </Link>
        </section>
      )}

      {/* Genre Filter Chips */}
      <section>
        <div className="genre-strip">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`genre-chip ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Movies Poster Grid */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <FilmIcon size={22} /> Now Showing in Cinemas
            </h2>
            <p className="section-subtitle">
              Browse current blockbuster releases and reserve live seats
            </p>
          </div>
          <Link to="/shows" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--bms-primary)', textDecoration: 'none' }}>
            View All Showtimes &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="movie-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="shimmer" style={{ width: '100%', aspectRatio: '2/3' }} />
                <div style={{ padding: '16px' }}>
                  <div className="shimmer" style={{ height: '20px', width: '70%', marginBottom: '10px' }} />
                  <div className="shimmer" style={{ height: '14px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="dashboard-card empty-state">
            <div className="empty-state-icon">
              <SearchIcon size={26} />
            </div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--bms-text-main)' }}>No movies match your search</p>
            <p style={{ margin: '4px 0 16px', fontSize: '0.85rem' }}>Try clearing your search query or selecting "All" genres.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedGenre('All'); }}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="movie-poster-card">
                <div className="poster-wrap">
                  <img
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'}
                    alt={movie.title}
                    className="poster-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
                    }}
                  />
                  <div className="poster-overlay-pill">
                    <ClockIcon size={12} />
                    <span>{movie.durationMinutes} min</span>
                  </div>
                </div>

                <div className="movie-details">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <span style={{ fontWeight: 600 }}>{movie.language}</span>
                    <span>&bull;</span>
                    <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--bms-text-muted)', margin: '0 0 16px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {movie.description}
                  </p>
                  <Link to={`/shows?movieId=${movie.id}`} className="movie-btn">
                    <span>Select Showtimes</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Perks Strip */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <ZapIcon size={20} /> Why Book with Book My Seat?
            </h2>
            <p className="section-subtitle">Architected for guaranteed seat locking and zero race conditions</p>
          </div>
        </div>

        <div className="perks-grid">
          <div className="perk-card">
            <div className="perk-icon-wrap" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <LockClosedIcon size={20} />
            </div>
            <div>
              <h4 className="perk-title">5-Min Atomic Seat Hold</h4>
              <p className="perk-desc">
                When you click a seat, Redis locks it atomically with a 5-minute countdown so nobody else can take it.
              </p>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-icon-wrap" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <SparklesIcon size={20} />
            </div>
            <div>
              <h4 className="perk-title">Live WebSocket Sync</h4>
              <p className="perk-desc">
                Seat statuses update in real time on your screen. Watch seats lock and unlock without refreshing.
              </p>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-icon-wrap" style={{ background: '#ecfdf5', color: '#059669' }}>
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <h4 className="perk-title">Zero Double-Booking</h4>
              <p className="perk-desc">
                Multi-layer concurrency: Redis temporary locks backed by permanent MySQL database constraints.
              </p>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>
              <TicketIcon size={20} />
            </div>
            <div>
              <h4 className="perk-title">Digital E-Ticket Passes</h4>
              <p className="perk-desc">
                Instant confirmation QR passes delivered to your account and dispatched asynchronously via Kafka.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
