import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/authApi';

const registerSchema = Yup.object({
  username: Yup.string().required('Username is required').min(3, 'Min 3 characters').max(50),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character (@, #, !, etc.)'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
  role: Yup.string().oneOf(['STUDENT', 'FACULTY'], 'Select a valid role').required('Role is required'),
  firstName: Yup.string().required('First name is required').min(2),
  lastName: Yup.string().required('Last name is required').min(2),
});

// Admin is a static role — not available for self-registration
const roles = [
  {
    value: 'STUDENT',
    icon: 'bi-person-graduation',
    color: '#6366f1',
    label: 'Student',
    desc: 'Browse and register for courses',
  },
  {
    value: 'FACULTY',
    icon: 'bi-person-badge',
    color: '#10b981',
    label: 'Faculty',
    desc: 'Manage and approve student registrations',
  },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError('');
    const { confirmPassword, ...payload } = values;
    try {
      await register(payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-overlay" />
        <div className="auth-card text-center">
          <div className="success-icon mb-3">
            <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem', color: '#10b981' }}></i>
          </div>
          <h2 className="auth-title">Registration Successful!</h2>
          <p className="auth-subtitle">Your account has been created. Redirecting to login...</p>
          <div className="spinner-border text-primary mt-3" role="status" />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-overlay" />
      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <i className="bi bi-person-plus-fill"></i>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the University Management System</p>

        {serverError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{serverError}</span>
          </div>
        )}

        <Formik
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'STUDENT',
            firstName: '',
            lastName: '',
          }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors, values }) => (
            <Form noValidate>
              {/* Role Selector — ADMIN excluded (system-provisioned) */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-person-gear me-2"></i>I am a...
                </label>
                <div className="role-selector">
                  {roles.map((r) => (
                    <label key={r.value} className={`role-option ${values.role === r.value ? 'selected' : ''}`}>
                      <Field type="radio" name="role" value={r.value} className="d-none" />
                      <i className={`bi ${r.icon}`} style={{ color: r.color }}></i>
                      <span className="role-label">{r.label}</span>
                      <small className="role-desc">{r.desc}</small>
                    </label>
                  ))}
                </div>
                <ErrorMessage name="role" component="div" className="text-danger small mt-1" />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="reg-firstName">First Name</label>
                  <Field
                    id="reg-firstName"
                    name="firstName"
                    className={`form-control ums-input ${touched.firstName && errors.firstName ? 'is-invalid' : touched.firstName ? 'is-valid' : ''}`}
                    placeholder="Alice"
                  />
                  <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="reg-lastName">Last Name</label>
                  <Field
                    id="reg-lastName"
                    name="lastName"
                    className={`form-control ums-input ${touched.lastName && errors.lastName ? 'is-invalid' : touched.lastName ? 'is-valid' : ''}`}
                    placeholder="Smith"
                  />
                  <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="reg-username">Username</label>
                  <Field
                    id="reg-username"
                    name="username"
                    className={`form-control ums-input ${touched.username && errors.username ? 'is-invalid' : touched.username ? 'is-valid' : ''}`}
                    placeholder="alice_smith"
                    autoComplete="username"
                  />
                  <ErrorMessage name="username" component="div" className="invalid-feedback" />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="reg-email">Email Address</label>
                  <Field
                    id="reg-email"
                    name="email"
                    type="email"
                    className={`form-control ums-input ${touched.email && errors.email ? 'is-invalid' : touched.email ? 'is-valid' : ''}`}
                    placeholder="alice@university.com"
                    autoComplete="email"
                  />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div className="input-group">
                    <Field
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ums-input ${touched.password && errors.password ? 'is-invalid' : touched.password ? 'is-valid' : ''}`}
                      placeholder="Min 8 chars"
                      autoComplete="new-password"
                      style={{ borderRight: 'none' }}
                    />
                    <button
                      type="button"
                      className="pw-toggle-btn"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {touched.password && errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
                  <div className="input-group">
                    <Field
                      id="reg-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-control ums-input ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : touched.confirmPassword ? 'is-valid' : ''}`}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      style={{ borderRight: 'none' }}
                    />
                    <button
                      type="button"
                      className="pw-toggle-btn"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                className="btn ums-btn-primary w-100 py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
                ) : (
                  <><i className="bi bi-person-check-fill me-2" />Create Account</>
                )}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-footer-text mt-4">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
