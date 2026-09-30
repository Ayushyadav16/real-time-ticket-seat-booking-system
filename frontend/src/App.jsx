import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Movies from './pages/Movies';
import Theatres from './pages/Theatres';
import Shows from './pages/Shows';
import SeatSelection from './pages/SeatSelection';
import BookingHistory from './pages/BookingHistory';
import AdminMovies from './pages/admin/AdminMovies';
import AdminTheatres from './pages/admin/AdminTheatres';
import AdminShows from './pages/admin/AdminShows';
import AdminBookings from './pages/admin/AdminBookings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/theatres" element={<Theatres />} />
            <Route path="/shows" element={<Shows />} />
            <Route path="/shows/:showId/seats" element={<SeatSelection />} />
            <Route path="/my-bookings" element={<BookingHistory />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/theatres" element={<AdminTheatres />} />
            <Route path="/admin/shows" element={<AdminShows />} />
          </Routes>
          <footer className="footer">
            <p>Book My Seat &bull; Real-Time Cinema &amp; Event Booking</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
