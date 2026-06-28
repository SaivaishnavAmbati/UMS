import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectRole, restoreSession } from './store/slices/authSlice';
import { refreshToken } from './api/authApi';
import { decodeJWT } from './utils/jwtUtils';

import Layout from './components/layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import RoleGuard from './components/RoleGuard';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DashboardPage from './pages/admin/DashboardPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import SemestersPage from './pages/admin/SemestersPage';
import CoursesPage from './pages/admin/CoursesPage';
import FacultyPage from './pages/admin/FacultyPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AuditPage from './pages/admin/AuditPage';
import NotificationsPage from './pages/admin/NotificationsPage';

import PendingRegistrationsPage from './pages/faculty/PendingRegistrationsPage';
import FacultyProfilePage from './pages/faculty/FacultyProfilePage';

import StudentProfilePage from './pages/student/StudentProfilePage';
import CourseSearchPage from './pages/student/CourseSearchPage';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';

import MyNotificationsPage from './pages/shared/MyNotificationsPage';

// ─── Unauthorized Page ──────────────────────────────────────────────────────
const UnauthorizedPage = () => (
  <div
    className="d-flex flex-column align-items-center justify-content-center text-center"
    style={{ minHeight: '70vh' }}
  >
    <i className="bi bi-shield-exclamation" style={{ fontSize: '4rem', color: '#ef4444' }}></i>
    <h2 className="mt-3 fw-bold">Access Denied</h2>
    <p className="text-muted">You don&apos;t have permission to access this page.</p>
    <a href="/" className="btn ums-btn-primary mt-3 px-4">
      <i className="bi bi-house me-2"></i>Go to Home
    </a>
  </div>
);

// ─── Role-based Home Redirect ───────────────────────────────────────────────
const HomeRedirect = () => {
  const isAuth = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'FACULTY') return <Navigate to="/faculty/pending" replace />;
  if (role === 'STUDENT') return <Navigate to="/student/profile" replace />;
  return <Navigate to="/login" replace />;
};

// ─── App Root ───────────────────────────────────────────────────────────────
const App = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  // On app boot: silently try to restore session using refresh token
  useEffect(() => {
    const restore = async () => {
      const storedRefresh = sessionStorage.getItem('ums_refresh_token');
      const userMetaRaw = sessionStorage.getItem('ums_user_meta');

      if (storedRefresh && userMetaRaw) {
        try {
          const res = await refreshToken(storedRefresh);
          const { token, refreshToken: newRefresh, username, role } = res.data.data;

          // Decode new token to get userId (more reliable than stored meta)
          const decoded = decodeJWT(token);
          const parsedMeta = JSON.parse(userMetaRaw);
          const userId = decoded?.userId ?? parsedMeta?.userId ?? null;

          sessionStorage.setItem('ums_refresh_token', newRefresh);
          dispatch(restoreSession({ accessToken: token, username, role, userId }));
        } catch {
          // Refresh failed — clear session, user will be sent to login
          sessionStorage.removeItem('ums_refresh_token');
          sessionStorage.removeItem('ums_user_meta');
        }
      }
      setInitializing(false);
    };

    restore();
  }, [dispatch]);

  if (initializing) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: '3rem', height: '3rem' }}
          />
          <p className="text-muted">Loading University Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── Public routes ────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Protected routes (require login) ─────────────── */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin-only routes */}
          <Route path="/admin/dashboard"     element={<RoleGuard allowedRoles={['ADMIN']}><DashboardPage /></RoleGuard>} />
          <Route path="/admin/departments"   element={<RoleGuard allowedRoles={['ADMIN']}><DepartmentsPage /></RoleGuard>} />
          <Route path="/admin/semesters"     element={<RoleGuard allowedRoles={['ADMIN']}><SemestersPage /></RoleGuard>} />
          <Route path="/admin/courses"       element={<RoleGuard allowedRoles={['ADMIN']}><CoursesPage /></RoleGuard>} />
          <Route path="/admin/faculty"       element={<RoleGuard allowedRoles={['ADMIN']}><FacultyPage /></RoleGuard>} />
          <Route path="/admin/registrations" element={<RoleGuard allowedRoles={['ADMIN']}><AdminRegistrationsPage /></RoleGuard>} />
          <Route path="/admin/audit"         element={<RoleGuard allowedRoles={['ADMIN']}><AuditPage /></RoleGuard>} />
          <Route path="/admin/notifications" element={<RoleGuard allowedRoles={['ADMIN']}><NotificationsPage /></RoleGuard>} />

          {/* Faculty routes */}
          <Route path="/faculty/pending"       element={<RoleGuard allowedRoles={['FACULTY', 'ADMIN']}><PendingRegistrationsPage /></RoleGuard>} />
          <Route path="/faculty/profile"       element={<RoleGuard allowedRoles={['FACULTY']}><FacultyProfilePage /></RoleGuard>} />
          <Route path="/faculty/notifications" element={<RoleGuard allowedRoles={['FACULTY']}><MyNotificationsPage /></RoleGuard>} />

          {/* Student routes */}
          <Route path="/student/profile"        element={<RoleGuard allowedRoles={['STUDENT']}><StudentProfilePage /></RoleGuard>} />
          <Route path="/student/courses"        element={<RoleGuard allowedRoles={['STUDENT']}><CourseSearchPage /></RoleGuard>} />
          <Route path="/student/registrations"  element={<RoleGuard allowedRoles={['STUDENT']}><MyRegistrationsPage /></RoleGuard>} />
          <Route path="/student/notifications"  element={<RoleGuard allowedRoles={['STUDENT']}><MyNotificationsPage /></RoleGuard>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
