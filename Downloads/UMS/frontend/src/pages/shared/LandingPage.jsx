import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectIsAuthenticated, selectRole } from '../../store/slices/authSlice';
import { getSystemTheme, applyTheme } from '../../utils/theme';

const LandingPage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const [theme, setTheme] = useState(getSystemTheme());

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Determine user's dashboard redirection URL
  const getDashboardUrl = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'FACULTY') return '/faculty/pending';
    if (role === 'STUDENT') return '/student/profile';
    return '/login';
  };

  return (
    <div className="landing-page">
      <div className="auth-bg-overlay" />

      {/* ─── Navigation Header ────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="landing-logo">
            <i className="bi bi-mortarboard-fill me-2"></i>
            <span>UMS</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <a href="#features" className="text-secondary text-decoration-none d-none d-sm-inline hover-light me-2">Features</a>
            <a href="#portals" className="text-secondary text-decoration-none d-none d-sm-inline hover-light me-3">Portals</a>
            <button 
              className="btn btn-link p-0 text-secondary border-0 bg-transparent me-2"
              onClick={handleThemeToggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning fs-5' : 'bi-moon-stars-fill text-primary fs-5'}`}></i>
            </button>
            {isAuthenticated ? (
              <Link to={getDashboardUrl()} className="btn ums-btn-primary px-4 py-2">
                <i className="bi bi-grid-fill me-2"></i>Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn ums-btn-outline px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn ums-btn-primary px-4 py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <header className="landing-hero d-flex align-items-center justify-content-center">
        <div className="container position-relative z-2">
          <h1 className="landing-hero-title">
            Empowering Academic & Administrative Excellence
          </h1>
          <p className="landing-hero-subtitle">
            A secure, modern, and unified portal designed to streamline registrations, course management, departments, and compliance audits with real-time feedback.
          </p>
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
            {isAuthenticated ? (
              <Link to={getDashboardUrl()} className="btn ums-btn-primary px-5 py-3 fs-5">
                <i className="bi bi-arrow-right-circle me-2"></i>Access Your Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn ums-btn-primary px-5 py-3 fs-5">
                  <i className="bi bi-rocket-takeoff-fill me-2"></i>Start Registration
                </Link>
                <Link to="/login" className="btn ums-btn-outline px-5 py-3 fs-5">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Sign In Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Stats Grid ──────────────────────────────────────────────────── */}
      <section className="container mb-5 py-4">
        <div className="row g-4 justify-content-center">
          <div className="col-6 col-lg-3">
            <div className="landing-card text-center">
              <div className="stat-number">15,000+</div>
              <div className="stat-label text-light text-opacity-75">Active Students</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="landing-card text-center">
              <div className="stat-number">800+</div>
              <div className="stat-label text-light text-opacity-75">Certified Faculty</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="landing-card text-center">
              <div className="stat-number">120+</div>
              <div className="stat-label text-light text-opacity-75">Advanced Courses</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="landing-card text-center">
              <div className="stat-number">99.99%</div>
              <div className="stat-label text-light text-opacity-75">Platform Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Role Portals Section ────────────────────────────────────────── */}
      <section id="portals" className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Integrated Role Portals</h2>
          <p className="landing-section-subtitle">
            Tailored dashboards for students and faculty, working in perfect synchronization.
          </p>

          <div className="row g-4 justify-content-center">
            {/* Student Card */}
            <div className="col-md-6 col-lg-5">
              <div className="landing-card d-flex flex-column justify-content-between">
                <div>
                  <div className="landing-card-icon">
                    <i className="bi bi-mortarboard"></i>
                  </div>
                  <h3 className="h4 mb-3 fw-bold">Student Hub</h3>
                  <p className="text-muted mb-4" style={{ minHeight: '80px' }}>
                    Seamlessly search courses, build schedules, check prerequisites, register instantly, and manage your academic profile.
                  </p>
                </div>
                <Link to={isAuthenticated ? getDashboardUrl() : "/login"} className="btn ums-btn-outline w-100 py-2.5 mt-auto">
                  Access Student Portal
                </Link>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="col-md-6 col-lg-5">
              <div className="landing-card d-flex flex-column justify-content-between">
                <div>
                  <div className="landing-card-icon">
                    <i className="bi bi-person-badge"></i>
                  </div>
                  <h3 className="h4 mb-3 fw-bold">Faculty Portal</h3>
                  <p className="text-muted mb-4" style={{ minHeight: '80px' }}>
                    Review pending student registrations, approve or deny applications, update profiles, and manage notifications instantly.
                  </p>
                </div>
                <Link to={isAuthenticated ? getDashboardUrl() : "/login"} className="btn ums-btn-outline w-100 py-2.5 mt-auto">
                  Access Faculty Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── System Features Section ─────────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="container">
          <h2 className="landing-section-title">Sophisticated Features</h2>
          <p className="landing-section-subtitle">
            Engineered with modern technologies and rigorous system constraints to ensure security, safety, and reliability.
          </p>

          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="landing-card">
                <div className="landing-card-icon text-info">
                  <i className="bi bi-journal-bookmark-fill"></i>
                </div>
                <h4 className="h5 fw-bold mb-3">Smart Catalog</h4>
                <p className="text-muted small">
                  Explore the complete department hierarchy, active course catalogs, and view detailed prerequisite relationships seamlessly.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="landing-card">
                <div className="landing-card-icon text-success">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <h4 className="h5 fw-bold mb-3">Intelligent Auditing</h4>
                <p className="text-muted small">
                  An isolated audit service tracks system-wide registrations, state transitions, and actions to assure transparency.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="landing-card">
                <div className="landing-card-icon text-warning">
                  <i className="bi bi-exclamation-octagon"></i>
                </div>
                <h4 className="h5 fw-bold mb-3">Conflict Prevention</h4>
                <p className="text-muted small">
                  Schedules are automatically checked for class overlap and prerequisite requirements before student enrollment completes.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="landing-card">
                <div className="landing-card-icon text-danger">
                  <i className="bi bi-bell-fill"></i>
                </div>
                <h4 className="h5 fw-bold mb-3">Real-time Broadcasts</h4>
                <p className="text-muted small">
                  Keep students and faculty updated instantly regarding course assignments, profile updates, and registration approvals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="landing-footer text-center">
        <div className="container">
          <div className="d-flex flex-column align-items-center justify-content-center gap-3">
            <div>
              <div className="landing-logo mb-2 justify-content-center">
                <i className="bi bi-mortarboard-fill me-2"></i>
                <span>UMS</span>
              </div>
              <p className="small mb-0">© {new Date().getFullYear()} University Management System. All rights reserved.</p>
            </div>
            <div className="d-flex justify-content-center gap-4">
              <a href="#features" className="text-muted text-decoration-none small hover-light">Features</a>
              <a href="#portals" className="text-muted text-decoration-none small hover-light">Portals</a>
              <Link to="/login" className="text-muted text-decoration-none small hover-light">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
