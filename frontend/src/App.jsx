import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Movies from './pages/Movies';
import Theatres from './pages/Theatres';
import AdminMovies from './pages/admin/AdminMovies';
import AdminTheatres from './pages/admin/AdminTheatres';
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
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/theatres" element={<AdminTheatres />} />
          </Routes>
          <footer className="footer">
            <p>Real-Time Ticket &amp; Seat Booking System &bull; Version 1.0 Specification Implementation</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
