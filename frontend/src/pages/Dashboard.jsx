import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import CustomerDashboard from './dashboards/CustomerDashboard';

export default function Dashboard() {
  const { isAdmin } = useAuth();

  return (
    <main className="main-content">
      {isAdmin ? <AdminDashboard /> : <CustomerDashboard />}
    </main>
  );
}
