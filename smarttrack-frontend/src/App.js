// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

import RegisterStudent from './components/RegisterStudent';
import MarkAttendance from './components/MarkAttendance';
import StudentList from './components/StudentList';
import StudentProfile from './components/StudentProfile';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AttendanceDashboard from './components/AttendanceDashboard';
import DashboardOverview from './components/DashboardOverview';

const AppRoutes = () => {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated === null) return <div>Loading...</div>;

  return (
    <Router>
      {isAuthenticated && (
        <nav className="navbar">
          <Link to="/register" className="nav-link">Register</Link>
          <Link to="/mark" className="nav-link">Mark</Link>
          <Link to="/students" className="nav-link">Students</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <button
            className="logout-button"
            onClick={async () => {
              await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include',
              });
              logout();
            }}
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <RegisterStudent /> : <Navigate to="/login" />} />
        <Route path="/mark" element={isAuthenticated ? <MarkAttendance /> : <Navigate to="/login" />} />
        <Route path="/students" element={isAuthenticated ? <StudentList /> : <Navigate to="/login" />} />
        <Route path="/student/:id" element={isAuthenticated ? <StudentProfile /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardOverview /> : <Navigate to="/login" />} />
        <Route path="/admin-dashboard" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/attendance-dashboard" element={isAuthenticated ? <AttendanceDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CssBaseline />
        <div className="app-background stylish-background">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}