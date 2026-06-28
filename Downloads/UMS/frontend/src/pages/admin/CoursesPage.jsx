import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Table, Badge, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchCourses, addCourse, fetchDepartments, fetchSemesters,
  selectCourses, selectDepartments, selectSemesters, selectAcademicLoading,
} from '../../store/slices/academicSlice';

const courseSchema = Yup.object({
  title: Yup.string().required('Title is required').min(3),
  code: Yup.string().required('Code is required').min(2).max(20),
  credits: Yup.number().required('Credits required').min(1).max(6),
  capacity: Yup.number().required('Capacity required').min(1),
  departmentId: Yup.number().required('Department is required').positive(),
  semesterId: Yup.number().required('Semester is required').positive(),
});

const CoursesPage = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const departments = useSelector(selectDepartments);
  const semesters = useSelector(selectSemesters);
  const loading = useSelector(selectAcademicLoading);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchDepartments());
    dispatch(fetchSemesters());
  }, [dispatch]);

  const handleCreate = async (values, { setSubmitting, resetForm }) => {
    await dispatch(addCourse({
      ...values,
      credits: Number(values.credits),
      capacity: Number(values.capacity),
      departmentId: Number(values.departmentId),
      semesterId: Number(values.semesterId),
      prerequisiteCodes: [],
    }));
    setSubmitting(false);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="page-title"><i className="bi bi-book me-3"></i>Courses</h1>
          <p className="page-subtitle">Manage academic courses</p>
        </div>
        <button id="add-course-btn" className="btn ums-btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Course
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr><th>Code</th><th>Title</th><th>Department</th><th>Credits</th><th>Capacity</th><th>Seats Left</th></tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-5">No courses found.</td></tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.id}>
                    <td><Badge bg="info" className="ums-badge">{c.code}</Badge></td>
                    <td><strong>{c.title}</strong></td>
                    <td>{c.departmentName || c.departmentId}</td>
                    <td>{c.credits}</td>
                    <td>{c.capacity}</td>
                    <td>
                      <Badge bg={c.remainingSeats > 5 ? 'success' : c.remainingSeats > 0 ? 'warning' : 'danger'} className="ums-badge">
                        {c.remainingSeats ?? c.availableSeats ?? '—'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-book-half me-2"></i>Create Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ title: '', code: '', credits: '', capacity: '', departmentId: '', semesterId: '' }}
            validationSchema={courseSchema}
            onSubmit={handleCreate}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form noValidate>
                <div className="row g-3 mb-3">
                  <div className="col-8">
                    <label className="form-label" htmlFor="course-title">Title</label>
                    <Field id="course-title" name="title" className={`form-control ums-input ${touched.title && errors.title ? 'is-invalid' : ''}`} placeholder="Data Structures" />
                    <ErrorMessage name="title" component="div" className="invalid-feedback" />
                  </div>
                  <div className="col-4">
                    <label className="form-label" htmlFor="course-code">Code</label>
                    <Field id="course-code" name="code" className={`form-control ums-input ${touched.code && errors.code ? 'is-invalid' : ''}`} placeholder="CS101" />
                    <ErrorMessage name="code" component="div" className="invalid-feedback" />
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label" htmlFor="course-credits">Credits</label>
                    <Field id="course-credits" name="credits" type="number" min="1" max="6" className={`form-control ums-input ${touched.credits && errors.credits ? 'is-invalid' : ''}`} />
                    <ErrorMessage name="credits" component="div" className="invalid-feedback" />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="course-capacity">Capacity</label>
                    <Field id="course-capacity" name="capacity" type="number" min="1" className={`form-control ums-input ${touched.capacity && errors.capacity ? 'is-invalid' : ''}`} />
                    <ErrorMessage name="capacity" component="div" className="invalid-feedback" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="course-dept">Department</label>
                  <Field as="select" id="course-dept" name="departmentId" className={`form-select ums-input ${touched.departmentId && errors.departmentId ? 'is-invalid' : ''}`}>
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Field>
                  <ErrorMessage name="departmentId" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="course-semester">Semester</label>
                  <Field as="select" id="course-semester" name="semesterId" className={`form-select ums-input ${touched.semesterId && errors.semesterId ? 'is-invalid' : ''}`}>
                    <option value="">Select semester...</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Field>
                  <ErrorMessage name="semesterId" component="div" className="invalid-feedback" />
                </div>
                <button id="course-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2 me-2" />Create Course</>}
                </button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CoursesPage;
