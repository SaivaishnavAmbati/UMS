import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, selectAuth } from '../../store/slices/authSlice';
import { login } from '../../api/authApi';
import { decodeJWT } from '../../utils/jwtUtils';

const loginSchema = Yup.object({
  username: Yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
  password: Yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
});

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(selectAuth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const roleRedirect = {
        ADMIN: '/admin/dashboard',
        FACULTY: '/faculty/pending',
        STUDENT: '/student/profile',
      };
      navigate(roleRedirect[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(loginStart());
    try {
      const res = await login(values);
      const { token, refreshToken, username, role } = res.data.data;

      // Decode JWT to extract userId stored in the token claims
      const decoded = decodeJWT(token);
      const userId = decoded?.userId ?? null;

      dispatch(loginSuccess({ accessToken: token, refreshToken, username, role, userId }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-overlay" />
      <div className="auth-card">
        <div className="auth-logo">
          <i className="bi bi-mortarboard-fill"></i>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to University Management System</p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form noValidate>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="login-username">
                  <i className="bi bi-person me-2"></i>Username
                </label>
                <Field
                  id="login-username"
                  name="username"
                  type="text"
                  className={`form-control ums-input ${touched.username && errors.username ? 'is-invalid' : touched.username ? 'is-valid' : ''}`}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
                <ErrorMessage name="username" component="div" className="invalid-feedback" />
              </div>

              <div className="form-group mb-4">
                <label className="form-label" htmlFor="login-password">
                  <i className="bi bi-lock me-2"></i>Password
                </label>
                <div className="input-group">
                  <Field
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ums-input ${touched.password && errors.password ? 'is-invalid' : touched.password ? 'is-valid' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ borderRight: 'none' }}
                  />
                  <button
                    type="button"
                    className="pw-toggle-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                  {touched.password && errors.password && (
                    <div className="invalid-feedback d-block">{errors.password}</div>
                  )}
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="btn ums-btn-primary w-100 py-3"
                disabled={isSubmitting || loading}
              >
                {(isSubmitting || loading) ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-footer-text mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>

        <div className="auth-admin-note">
          <i className="bi bi-info-circle me-1"></i>
          Admin accounts are provisioned by the system administrator.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
