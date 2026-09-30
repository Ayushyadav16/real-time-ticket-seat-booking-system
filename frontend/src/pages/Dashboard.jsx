import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import CustomerDashboard from './dashboards/CustomerDashboard';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Dashboard() {
  const { isAdmin } = useAuth();

  return (
    <main className="main-content">
      <ErrorBoundary>
        {isAdmin ? <AdminDashboard /> : <CustomerDashboard />}
      </ErrorBoundary>
    </main>
  );
}
