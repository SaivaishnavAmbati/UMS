import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Table, Badge, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchSemesters, addSemester, triggerActivateSemester,
  selectSemesters, selectAcademicLoading, selectAcademicError,
} from '../../store/slices/academicSlice';

const semesterSchema = Yup.object({
  name: Yup.string().required('Name is required').min(3),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().required('End date is required').min(Yup.ref('startDate'), 'End must be after start'),
  registrationDeadline: Yup.date().required('Registration deadline is required'),
});

const SemestersPage = () => {
  const dispatch = useDispatch();
  const semesters = useSelector(selectSemesters);
  const loading = useSelector(selectAcademicLoading);
  const error = useSelector(selectAcademicError);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { dispatch(fetchSemesters()); }, [dispatch]);

  const handleCreate = async (values, { setSubmitting, resetForm }) => {
    await dispatch(addSemester({ ...values, isActive: false }));
    setSubmitting(false);
    resetForm();
    setShowModal(false);
  };

  const handleActivate = (id) => {
    dispatch(triggerActivateSemester(id));
  };

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="page-title"><i className="bi bi-calendar3 me-3"></i>Semesters</h1>
          <p className="page-subtitle">Manage academic semesters</p>
        </div>
        <button id="add-semester-btn" className="btn ums-btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Semester
        </button>
      </div>

      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2" />{error}</div>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Start</th><th>End</th><th>Reg. Deadline</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {semesters.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-5">No semesters found.</td></tr>
              ) : (
                semesters.map((sem, i) => (
                  <tr key={sem.id}>
                    <td>{i + 1}</td>
                    <td><strong>{sem.name}</strong></td>
                    <td>{sem.startDate}</td>
                    <td>{sem.endDate}</td>
                    <td>{sem.registrationDeadline}</td>
                    <td>
                      {sem.isActive
                        ? <Badge bg="success" className="ums-badge"><i className="bi bi-check-circle me-1" />Active</Badge>
                        : <Badge bg="secondary" className="ums-badge">Inactive</Badge>}
                    </td>
                    <td>
                      {!sem.isActive && (
                        <button id={`activate-sem-${sem.id}`} className="btn btn-sm ums-btn-success" onClick={() => handleActivate(sem.id)}>
                          <i className="bi bi-play-fill me-1" />Activate
                        </button>
                      )}
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
          <Modal.Title><i className="bi bi-calendar-plus me-2"></i>Create Semester</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ name: '', startDate: '', endDate: '', registrationDeadline: '' }}
            validationSchema={semesterSchema}
            onSubmit={handleCreate}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sem-name">Semester Name</label>
                  <Field id="sem-name" name="name" className={`form-control ums-input ${touched.name && errors.name ? 'is-invalid' : ''}`} placeholder="e.g. Spring 2027" />
                  <ErrorMessage name="name" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sem-startDate">Start Date</label>
                  <Field id="sem-startDate" name="startDate" type="date" className={`form-control ums-input ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="startDate" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="sem-endDate">End Date</label>
                  <Field id="sem-endDate" name="endDate" type="date" className={`form-control ums-input ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="endDate" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="sem-regDeadline">Registration Deadline</label>
                  <Field id="sem-regDeadline" name="registrationDeadline" type="date" className={`form-control ums-input ${touched.registrationDeadline && errors.registrationDeadline ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="registrationDeadline" component="div" className="invalid-feedback" />
                </div>
                <button id="sem-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2 me-2" />Create Semester</>}
                </button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SemestersPage;
