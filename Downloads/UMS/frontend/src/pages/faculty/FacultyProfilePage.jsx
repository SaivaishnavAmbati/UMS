import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { selectUser } from '../../store/slices/authSlice';
import { getFacultyByUsername, createFaculty, getDepartments, getCoursesByDepartment } from '../../api/academicApi';
import { getProfile as getAuthProfile } from '../../api/authApi';

const facultyProfileSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  firstName: Yup.string().required('First name is required').min(2),
  lastName: Yup.string().required('Last name is required').min(2),
  departmentId: Yup.number().required('Department is required').positive('Select a department'),
  courseId: Yup.number().required('Course is required').positive('Select a course'),
});

const FacultyProfilePage = () => {
  const user = useSelector(selectUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [deptCourses, setDeptCourses] = useState([]);
  const [prefillEmail, setPrefillEmail] = useState('');
  const [formError, setFormError] = useState('');

  const loadProfileAndDeps = async () => {
    setLoading(true);
    setFormError('');
    try {
      // Load departments
      const depRes = await getDepartments();
      setDepartments(depRes.data?.data || []);
    } catch (e) {
      setFormError('Failed to load departments. Make sure you are logged in and the gateway routes are configured.');
      console.error("Failed to load departments", e);
    }

    try {
      // Load profile
      const res = await getFacultyByUsername(user?.username);
      const profileData = res.data?.data;
      setProfile(profileData);

      // Pre-load courses if department is already set in existing profile
      if (profileData?.departmentId) {
        const courseRes = await getCoursesByDepartment(profileData.departmentId);
        setDeptCourses(courseRes.data?.data || []);
      }
    } catch (e) {
      // Profile not found — this is expected for first-time login
      if (e.response?.status !== 404) {
        setFormError(e.response?.data?.message || 'Failed to load faculty profile details.');
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      loadProfileAndDeps();

      // Pre-fill email from auth info
      getAuthProfile()
        .then((res) => {
          if (res.data?.data?.email) {
            setPrefillEmail(res.data.data.email);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const loadCoursesForDepartment = async (deptId) => {
    try {
      const res = await getCoursesByDepartment(deptId);
      setDeptCourses(res.data?.data || []);
    } catch (e) {
      setDeptCourses([]);
    }
  };

  const handleSubmitProfile = async (values, { setSubmitting }) => {
    setFormError('');
    try {
      const res = await createFaculty({
        userId: user?.userId,
        username: user?.username,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        departmentId: Number(values.departmentId),
        courseId: Number(values.courseId),
      });
      setProfile(res.data?.data);
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to submit profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  const showForm = !profile || profile.status === 'REJECTED';

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-person-circle me-3"></i>My Profile</h1>
        <p className="page-subtitle">Faculty profile and department information</p>
      </div>

      {!showForm && profile ? (
        /* ─── Existing profile view ─────────────────────────────────────── */
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="ums-profile-card">
              <Card.Body className="text-center p-5">
                <div className="profile-avatar mb-4">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </div>
                <h3 className="fw-bold mb-1">{profile.firstName} {profile.lastName}</h3>
                <code className="text-muted">@{profile.username}</code>
                
                <div className="mt-2 mb-4 d-flex justify-content-center gap-2 align-items-center">
                  <Badge bg="success" className="ums-badge fs-6">FACULTY</Badge>
                  <Badge 
                    bg={profile.status === 'ACTIVE' ? 'success' : 'warning'} 
                    className="ums-badge fs-6"
                  >
                    {profile.status}
                  </Badge>
                </div>

                <div className="profile-details">
                  <div className="profile-detail-row">
                    <i className="bi bi-envelope-fill me-2 text-primary"></i>
                    <span>{profile.email}</span>
                  </div>
                  <div className="profile-detail-row">
                    <i className="bi bi-building me-2 text-primary"></i>
                    <span>{profile.departmentName || `Department #${profile.departmentId}`}</span>
                  </div>
                  <div className="profile-detail-row">
                    <i className="bi bi-book me-2 text-primary"></i>
                    <span>Registered Course: <strong>{profile.courseTitle}</strong> <small className="text-muted">({profile.courseCode})</small></span>
                  </div>
                  <div className="profile-detail-row">
                    <i className="bi bi-hash me-2 text-primary"></i>
                    <span>Faculty ID: FAC-{String(profile.id || '').padStart(4, '0')}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        /* ─── Create/Re-submit profile form ─────────────────────────────── */
        <Row className="justify-content-center">
          <Col md={9} lg={7}>
            <Card className="ums-card">
              <Card.Header className="ums-card-header">
                <i className="bi bi-person-plus me-2"></i>
                {profile?.status === 'REJECTED' ? 'Resubmit Faculty Profile' : 'Complete Your Faculty Profile'}
              </Card.Header>
              <Card.Body className="p-4">
                <p className="text-muted small mb-4">
                  <i className="bi bi-info-circle me-1 text-primary"></i>
                  Please complete your details. An administrator will need to approve your profile before you can manage course registrations.
                </p>

                {profile?.status === 'REJECTED' && profile.rejectionReason && (
                  <div className="alert alert-danger mb-4">
                    <strong>Rejection Reason:</strong> {profile.rejectionReason}
                  </div>
                )}

                {formError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                    <span>{formError}</span>
                  </div>
                )}

                <Formik
                  initialValues={{
                    email: profile?.email || prefillEmail,
                    firstName: profile?.firstName || '',
                    lastName: profile?.lastName || '',
                    departmentId: profile?.departmentId || '',
                    courseId: profile?.courseId || '',
                  }}
                  enableReinitialize
                  validationSchema={facultyProfileSchema}
                  onSubmit={handleSubmitProfile}
                >
                  {({ isSubmitting, touched, errors, values, setFieldValue }) => (
                    <Form noValidate>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="fac-email">
                          University Email <span className="text-danger">*</span>
                        </label>
                        <Field
                          id="fac-email"
                          name="email"
                          type="email"
                          className={`form-control ums-input ${touched.email && errors.email ? 'is-invalid' : touched.email ? 'is-valid' : ''}`}
                          placeholder="yourname@university.edu"
                        />
                        <ErrorMessage name="email" component="div" className="invalid-feedback" />
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="form-label" htmlFor="fac-firstName">
                            First Name <span className="text-danger">*</span>
                          </label>
                          <Field
                            id="fac-firstName"
                            name="firstName"
                            className={`form-control ums-input ${touched.firstName && errors.firstName ? 'is-invalid' : touched.firstName ? 'is-valid' : ''}`}
                            placeholder="Alice"
                          />
                          <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                        </div>
                        <div className="col-6">
                          <label className="form-label" htmlFor="fac-lastName">
                            Last Name <span className="text-danger">*</span>
                          </label>
                          <Field
                            id="fac-lastName"
                            name="lastName"
                            className={`form-control ums-input ${touched.lastName && errors.lastName ? 'is-invalid' : touched.lastName ? 'is-valid' : ''}`}
                            placeholder="Smith"
                          />
                          <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="fac-dept">
                          Department <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="select"
                          id="fac-dept"
                          name="departmentId"
                          className={`form-select ums-input ${touched.departmentId && errors.departmentId ? 'is-invalid' : ''}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFieldValue('departmentId', val);
                            setFieldValue('courseId', ''); // Reset course selection
                            if (val) {
                              loadCoursesForDepartment(val);
                            } else {
                              setDeptCourses([]);
                            }
                          }}
                        >
                          <option value="">Select your department...</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="departmentId" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-4">
                        <label className="form-label" htmlFor="fac-course">
                          Course to Teach <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="select"
                          id="fac-course"
                          name="courseId"
                          disabled={!values.departmentId}
                          className={`form-select ums-input ${touched.courseId && errors.courseId ? 'is-invalid' : ''}`}
                        >
                          <option value="">Select your course...</option>
                          {deptCourses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                          ))}
                        </Field>
                        <ErrorMessage name="courseId" component="div" className="invalid-feedback" />
                      </div>

                      <button
                        id="fac-profile-submit-btn"
                        type="submit"
                        className="btn ums-btn-primary w-100 py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                        ) : (
                          <><i className="bi bi-check2-circle me-2" />Submit Profile</>
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

export default FacultyProfilePage;
