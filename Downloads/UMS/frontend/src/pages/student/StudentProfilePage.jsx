import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchStudentProfile, createProfile, selectStudentProfile } from '../../store/slices/studentSlice';
import { selectUser } from '../../store/slices/authSlice';
import { fetchDepartments, selectDepartments } from '../../store/slices/academicSlice';
import { getProfile } from '../../api/authApi';

// Enrollment status and max credits are controlled by admin — not editable by student
const profileSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  firstName: Yup.string().required('First name is required').min(2),
  lastName: Yup.string().required('Last name is required').min(2),
  departmentId: Yup.number().required('Department is required').positive('Select a department'),
});

const StudentProfilePage = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const user = useSelector(selectUser);
  const departments = useSelector(selectDepartments);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [prefillEmail, setPrefillEmail] = useState('');

  useEffect(() => {
    dispatch(fetchDepartments());

    // Try to get current profile
    dispatch(fetchStudentProfile()).finally(() => setLoading(false));

    // Pre-fill email from auth profile (gateway injects X-User-Username automatically)
    getProfile()
      .then((res) => {
        if (res.data?.data?.email) {
          setPrefillEmail(res.data.data.email);
        }
      })
      .catch(() => {
        // Silently ignore — user can type email manually
      });
  }, [dispatch]);

  const handleCreateProfile = async (values, { setSubmitting }) => {
    setProfileError('');

    // userId MUST come from the decoded JWT stored in auth state
    const userId = user?.userId;
    if (!userId) {
      setProfileError('Session error: userId not found. Please log out and log in again.');
      setSubmitting(false);
      return;
    }

    try {
      await dispatch(createProfile({
        userId,
        username: user?.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        // Admin-controlled fields — student cannot set these
        enrollmentStatus: 'ACTIVE',
        maxCredits: 18,
        currentCredits: 0,
        departmentId: Number(values.departmentId),
      })).unwrap();
    } catch (e) {
      // Show a clean error message (not raw backend exception)
      const msg = typeof e === 'string' ? e : 'Failed to create profile. Please try again.';
      setProfileError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-person-circle me-3"></i>My Profile</h1>
        <p className="page-subtitle">Student profile and enrollment information</p>
      </div>

      {profile ? (
        /* ─── Existing profile view ─────────────────────────────────────── */
        <Row className="justify-content-center">
          <Col md={10} lg={7}>
            <Card className="ums-profile-card">
              <Card.Body className="p-0">
                {/* Profile header band */}
                <div className="profile-header-band">
                  <div className="profile-avatar-lg">
                    {(profile.firstName?.charAt(0) || profile.username?.charAt(0) || '?').toUpperCase()}
                  </div>
                </div>
                <div className="p-4 text-center">
                  <h3 className="fw-bold mb-1">
                    {profile.firstName && profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile.username}
                  </h3>
                  <code className="text-muted">@{profile.username}</code>
                  <div className="mt-2 mb-4">
                    <Badge
                      bg={profile.enrollmentStatus === 'ACTIVE' ? 'success' : 'warning'}
                      className="ums-badge fs-6"
                    >
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                      {profile.enrollmentStatus}
                    </Badge>
                  </div>

                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <i className="bi bi-envelope-fill"></i>
                      <div>
                        <div className="info-label">Email</div>
                        <div className="info-value">{profile.email || '—'}</div>
                      </div>
                    </div>
                    <div className="profile-info-item">
                      <i className="bi bi-building"></i>
                      <div>
                        <div className="info-label">Department</div>
                        <div className="info-value">
                          {departments.find((d) => d.id === profile.departmentId)?.name
                            || (profile.departmentId ? `Dept #${profile.departmentId}` : 'Not assigned')}
                        </div>
                      </div>
                    </div>
                    <div className="profile-info-item">
                      <i className="bi bi-calendar3"></i>
                      <div>
                        <div className="info-label">Enrolled Since</div>
                        <div className="info-value">
                          {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="profile-info-item">
                      <i className="bi bi-hash"></i>
                      <div>
                        <div className="info-label">Student ID</div>
                        <div className="info-value">STU-{String(profile.id || '').padStart(4, '0')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Credits progress */}
                  <div className="credits-section mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-semibold small">Credit Hours</span>
                      <span className="fw-bold small text-primary">
                        {profile.currentCredits || 0} / {profile.maxCredits || 18}
                      </span>
                    </div>
                    <div className="credits-bar-track">
                      <div
                        className="credits-bar-fill"
                        style={{
                          width: `${Math.min(100, ((profile.currentCredits || 0) / (profile.maxCredits || 18)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-muted small mt-1">
                      {profile.maxCredits - (profile.currentCredits || 0)} credits remaining
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        /* ─── Create profile form ────────────────────────────────────────── */
        <Row className="justify-content-center">
          <Col md={9} lg={7}>
            <Card className="ums-card">
              <Card.Header className="ums-card-header">
                <i className="bi bi-person-plus me-2"></i>Complete Your Student Profile
              </Card.Header>
              <Card.Body className="p-4">
                <p className="text-muted small mb-4">
                  <i className="bi bi-info-circle me-1 text-primary"></i>
                  Please fill in your details to activate your student account.
                </p>

                {profileError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                    <span>{profileError}</span>
                  </div>
                )}

                <Formik
                  initialValues={{
                    email: prefillEmail,
                    firstName: '',
                    lastName: '',
                    departmentId: '',
                  }}
                  enableReinitialize
                  validationSchema={profileSchema}
                  onSubmit={handleCreateProfile}
                >
                  {({ isSubmitting, touched, errors }) => (
                    <Form noValidate>
                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label" htmlFor="stu-email">
                          University Email <span className="text-danger">*</span>
                        </label>
                        <Field
                          id="stu-email"
                          name="email"
                          type="email"
                          className={`form-control ums-input ${touched.email && errors.email ? 'is-invalid' : touched.email ? 'is-valid' : ''}`}
                          placeholder="yourname@university.edu"
                          autoComplete="email"
                        />
                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                      </div>

                      {/* Name row */}
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="form-label" htmlFor="stu-firstName">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <Field
                            id="stu-firstName"
                            name="firstName"
                            className={`form-control ums-input ${touched.firstName && errors.firstName ? 'is-invalid' : touched.firstName ? 'is-valid' : ''}`}
                            placeholder="Alice"
                          />
                          <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                        </div>
                        <div className="col-6">
                          <label className="form-label" htmlFor="stu-lastName">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <Field
                            id="stu-lastName"
                            name="lastName"
                            className={`form-control ums-input ${touched.lastName && errors.lastName ? 'is-invalid' : touched.lastName ? 'is-valid' : ''}`}
                            placeholder="Smith"
                          />
                          <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                        </div>
                      </div>

                      {/* Department */}
                      <div className="mb-4">
                        <label className="form-label" htmlFor="stu-dept">
                          Department <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="select"
                          id="stu-dept"
                          name="departmentId"
                          className={`form-select ums-input ${touched.departmentId && errors.departmentId ? 'is-invalid' : ''}`}
                        >
                          <option value="">Select your department...</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="departmentId" component="div" className="invalid-feedback" />
                      </div>

                      <button
                        id="stu-profile-submit-btn"
                        type="submit"
                        className="btn ums-btn-primary w-100 py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Saving Profile...</>
                        ) : (
                          <><i className="bi bi-check2-circle me-2" />Save Profile</>
                        )}
                      </button>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default StudentProfilePage;
