import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Badge, Spinner, InputGroup, Form, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  searchCoursesThunk,
  fetchCourses,
  selectCourses,
  selectAcademicLoading,
  fetchActiveSemester,
  selectActiveSemester,
} from '../../store/slices/academicSlice';
import {
  submitCourseRegistration,
  fetchMyRegistrations,
  selectMyRegistrations,
} from '../../store/slices/registrationSlice';
import { fetchStudentProfile, selectStudentProfile } from '../../store/slices/studentSlice';
import { getFacultyByCourseId } from '../../api/academicApi';

// Parses raw backend error messages into user-friendly text
const parseRegistrationError = (raw) => {
  if (!raw) return 'Registration failed. Please try again.';
  const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);

  if (msg.toLowerCase().includes('student profile not found') || msg.toLowerCase().includes('profile not found')) {
    return 'Your student profile is incomplete. Please complete your profile before registering.';
  }
  if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('duplicate')) {
    return 'You are already registered for this course this semester.';
  }
  if (msg.toLowerCase().includes('no seats') || msg.toLowerCase().includes('capacity')) {
    return 'This course is full. No seats available.';
  }
  if (msg.toLowerCase().includes('credits') || msg.toLowerCase().includes('maximum')) {
    return 'Registering would exceed your maximum allowed credit hours.';
  }
  if (msg.toLowerCase().includes('deadline') || msg.toLowerCase().includes('registration closed')) {
    return 'The registration deadline for this semester has passed.';
  }
  if (msg.length < 120 && !msg.includes('[') && !msg.includes('{')) {
    return msg;
  }
  return 'Registration failed. Please contact the administration.';
};

const CourseSearchPage = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const loading = useSelector(selectAcademicLoading);
  const myRegistrations = useSelector(selectMyRegistrations);
  const activeSemester = useSelector(selectActiveSemester);
  const studentProfile = useSelector(selectStudentProfile);

  const [query, setQuery] = useState('');
  const [registering, setRegistering] = useState(null);
  const [messages, setMessages] = useState({});
  const [profileChecked, setProfileChecked] = useState(false);

  // Modal State for Instructor Selection
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [facultiesForCourse, setFacultiesForCourse] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchMyRegistrations());
    dispatch(fetchActiveSemester());
    dispatch(fetchStudentProfile()).finally(() => setProfileChecked(true));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) dispatch(searchCoursesThunk(query.trim()));
    else dispatch(fetchCourses());
  };

  // Checks if student has already submitted registration for this course
  const isRegistered = (courseId) =>
    myRegistrations.some((r) => r.courseId === courseId);

  const handleOpenRegisterModal = async (course) => {
    if (!studentProfile) {
      setMessages((m) => ({
        ...m,
        [course.id]: {
          type: 'warning',
          text: 'Complete your student profile first before registering for courses.',
        },
      }));
      return;
    }
    if (!activeSemester) {
      setMessages((m) => ({
        ...m,
        [course.id]: { type: 'danger', text: 'No active semester found. Contact admin.' },
      }));
      return;
    }

    setSelectedCourse(course);
    setLoadingFaculties(true);
    setFacultiesForCourse([]);
    setSelectedFacultyId('');
    try {
      const res = await getFacultyByCourseId(course.id);
      setFacultiesForCourse(res.data?.data || []);
    } catch (e) {
      console.error("Failed to load instructors for course", e);
    } finally {
      setLoadingFaculties(false);
    }
  };

  const handleConfirmRegister = async () => {
    if (!selectedFacultyId || !selectedCourse) return;
    
    setRegistering(selectedCourse.id);
    const courseId = selectedCourse.id;
    try {
      await dispatch(
        submitCourseRegistration({ 
          courseId, 
          facultyId: Number(selectedFacultyId) 
        })
      ).unwrap();
      dispatch(fetchMyRegistrations());
      setMessages((m) => ({
        ...m,
        [courseId]: { type: 'success', text: 'Registration submitted! Awaiting approval.' },
      }));
      setSelectedCourse(null);
    } catch (e) {
      setMessages((m) => ({
        ...m,
        [courseId]: { type: 'danger', text: parseRegistrationError(e) },
      }));
    } finally {
      setRegistering(null);
    }
  };

  const hasNoProfile = profileChecked && !studentProfile;

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-search me-3"></i>Browse Courses</h1>
        <p className="page-subtitle">Search and register for courses in the active semester</p>
      </div>

      {/* No profile warning */}
      {hasNoProfile && (
        <div className="alert alert-warning d-flex align-items-center gap-3 mb-4" style={{ borderRadius: '12px' }}>
          <i className="bi bi-person-x-fill fs-4 flex-shrink-0"></i>
          <div>
            <div className="fw-semibold">Student profile not set up</div>
            <div className="small mt-1">
              You must complete your student profile before you can register for courses.{' '}
              <Link to="/student/profile" className="auth-link fw-semibold">
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Active semester banner */}
      {activeSemester ? (
        <div className="active-semester-banner mb-4">
          <i className="bi bi-calendar-check-fill me-2"></i>
          Active Semester: <strong>{activeSemester.name}</strong>
          <span className="ms-3 text-muted small">
            Registration deadline: {activeSemester.registrationDeadline}
          </span>
        </div>
      ) : (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '12px' }}>
          <i className="bi bi-calendar-x-fill"></i>
          <span>No active semester. Course registration is currently closed.</span>
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
        <div className="flex-grow-1">
          <InputGroup>
            <InputGroup.Text className="ums-input-group-text">
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              id="course-search-input"
              className="ums-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by course title or code..."
            />
          </InputGroup>
        </div>
        <button id="course-search-btn" type="submit" className="btn ums-btn-primary px-4">
          <i className="bi bi-search me-2"></i>Search
        </button>
        {query && (
          <button
            type="button"
            className="btn ums-btn-outline"
            onClick={() => { setQuery(''); dispatch(fetchCourses()); }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </form>

      {/* Course grid */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-book fs-1 d-block mb-3"></i>
          <h5>No courses found</h5>
          <p className="text-muted">Try a different search term or check back later.</p>
        </div>
      ) : (
        <Row className="g-4">
          {courses.map((course) => {
            const registered = isRegistered(course.id);
            const seats = course.remainingSeats ?? course.availableSeats ?? 0;
            const msg = messages[course.id];
            const isFull = seats === 0;
            const isCourseActive = course.active;

            return (
              <Col key={course.id} md={6} xl={4}>
                <Card className="course-card h-100">
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Badge bg="primary" className="ums-badge">{course.code}</Badge>
                      <div className="d-flex gap-2">
                        {!isCourseActive && (
                          <Badge bg="danger" className="ums-badge">Inactive</Badge>
                        )}
                        <Badge
                          bg={seats > 10 ? 'success' : seats > 0 ? 'warning' : 'danger'}
                          className="ums-badge"
                        >
                          {isFull ? 'Full' : `${seats} seats left`}
                        </Badge>
                      </div>
                    </div>

                    <h5 className="course-title mb-1">{course.title}</h5>
                    <p className="text-muted small mb-3">{course.departmentName || `Department #${course.departmentId}`}</p>

                    <div className="course-meta mb-4">
                      <span className="course-meta-item">
                        <i className="bi bi-award me-1"></i>{course.credits} Credits
                      </span>
                      <span className="course-meta-item">
                        <i className="bi bi-people me-1"></i>{course.capacity} Capacity
                      </span>
                    </div>

                    {/* Feedback message */}
                    {msg && (
                      <div className={`alert alert-${msg.type} py-2 small mb-3`} style={{ borderRadius: '8px' }}>
                        <i className={`bi ${msg.type === 'success' ? 'bi-check-circle' : msg.type === 'warning' ? 'bi-exclamation-triangle' : 'bi-x-circle'} me-2`}></i>
                        {msg.text}
                      </div>
                    )}

                    <div className="mt-auto">
                      {registered ? (
                        <button className="btn w-100 ums-btn-registered" disabled>
                          <i className="bi bi-check-circle-fill me-2"></i>Registered
                        </button>
                      ) : !isCourseActive ? (
                        <button className="btn w-100" disabled style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px' }}>
                          <i className="bi bi-exclamation-triangle me-2"></i>No Instructor Assigned
                        </button>
                      ) : isFull ? (
                        <button className="btn w-100" disabled style={{ background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', color: '#64748b', borderRadius: '8px' }}>
                          <i className="bi bi-slash-circle me-2"></i>Course Full
                        </button>
                      ) : (
                        <button
                          id={`register-course-${course.id}`}
                          className="btn w-100 ums-btn-primary"
                          onClick={() => handleOpenRegisterModal(course)}
                          disabled={registering === course.id || !activeSemester}
                          title={hasNoProfile ? 'Complete your profile first' : ''}
                        >
                          {registering === course.id ? (
                            <><span className="spinner-border spinner-border-sm me-2" />Registering...</>
                          ) : (
                            <><i className="bi bi-plus-circle me-2"></i>Register</>
                          )}
                        </button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Faculty Selection Modal */}
      <Modal show={!!selectedCourse} onHide={() => setSelectedCourse(null)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-person-badge me-2"></i>Select Instructor for {selectedCourse?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingFaculties ? (
            <div className="text-center py-4"><Spinner animation="border" variant="primary" /></div>
          ) : facultiesForCourse.length === 0 ? (
            <div className="alert alert-warning mb-0">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              No approved instructors are teaching this course at the moment. Course registration is unavailable.
            </div>
          ) : (
            <div>
              <div className="mb-3 p-3 ums-info-box">
                <div><strong>Course:</strong> {selectedCourse?.title} ({selectedCourse?.code})</div>
                <div><strong>Credits:</strong> {selectedCourse?.credits} Credits</div>
              </div>
              <div className="mb-4">
                <label className="form-label" htmlFor="reg-faculty">Choose Instructor <span className="text-danger">*</span></label>
                <select 
                  id="reg-faculty"
                  className="form-select ums-input" 
                  value={selectedFacultyId} 
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                >
                  <option value="">Select a faculty member...</option>
                  {facultiesForCourse.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.firstName} {fac.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                id="confirm-registration-btn"
                className="btn ums-btn-primary w-100 py-2" 
                disabled={!selectedFacultyId || registering === selectedCourse?.id}
                onClick={handleConfirmRegister}
              >
                {registering === selectedCourse?.id ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Registering...</>
                ) : (
                  <><i className="bi bi-check2-circle me-2" />Confirm Registration</>
                )}
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CourseSearchPage;
