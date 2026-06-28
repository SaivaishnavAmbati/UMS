import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Table, Badge, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchFaculty, addFaculty, fetchDepartments,
  selectFaculty, selectDepartments, selectAcademicLoading,
} from '../../store/slices/academicSlice';

const facultySchema = Yup.object({
  userId: Yup.number().required('User ID is required').positive('Must be positive'),
  username: Yup.string().required('Username is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  departmentId: Yup.number().required('Department is required').positive(),
});

const FacultyPage = () => {
  const dispatch = useDispatch();
  const faculty = useSelector(selectFaculty);
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectAcademicLoading);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchFaculty());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleCreate = async (values, { setSubmitting, resetForm }) => {
    await dispatch(addFaculty({ ...values, userId: Number(values.userId), departmentId: Number(values.departmentId) }));
    setSubmitting(false);
    resetForm();
    setShowModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="page-title"><i className="bi bi-person-badge me-3"></i>Faculty</h1>
          <p className="page-subtitle">Manage faculty members</p>
        </div>
        <button id="add-faculty-btn" className="btn ums-btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Faculty
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Username</th><th>Email</th><th>Department</th></tr>
            </thead>
            <tbody>
              {faculty.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-5">No faculty found.</td></tr>
              ) : (
                faculty.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td><strong>{f.firstName} {f.lastName}</strong></td>
                    <td><code className="ums-code">@{f.username}</code></td>
                    <td>{f.email}</td>
                    <td><Badge bg="primary" className="ums-badge">{f.departmentName || f.departmentId}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-person-plus me-2"></i>Add Faculty Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ userId: '', username: '', firstName: '', lastName: '', email: '', departmentId: '' }}
            validationSchema={facultySchema}
            onSubmit={handleCreate}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="fac-userId">Auth User ID</label>
                  <Field id="fac-userId" name="userId" type="number" className={`form-control ums-input ${touched.userId && errors.userId ? 'is-invalid' : ''}`} placeholder="User ID from auth service" />
                  <ErrorMessage name="userId" component="div" className="invalid-feedback" />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label" htmlFor="fac-firstName">First Name</label>
                    <Field id="fac-firstName" name="firstName" className={`form-control ums-input ${touched.firstName && errors.firstName ? 'is-invalid' : ''}`} />
                    <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                  </div>
                  <div className="col-6">
                    <label className="form-label" htmlFor="fac-lastName">Last Name</label>
                    <Field id="fac-lastName" name="lastName" className={`form-control ums-input ${touched.lastName && errors.lastName ? 'is-invalid' : ''}`} />
                    <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="fac-username">Username</label>
                  <Field id="fac-username" name="username" className={`form-control ums-input ${touched.username && errors.username ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="username" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="fac-email">Email</label>
                  <Field id="fac-email" name="email" type="email" className={`form-control ums-input ${touched.email && errors.email ? 'is-invalid' : ''}`} />
                  <ErrorMessage name="email" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="fac-dept">Department</label>
                  <Field as="select" id="fac-dept" name="departmentId" className={`form-select ums-input ${touched.departmentId && errors.departmentId ? 'is-invalid' : ''}`}>
                    <option value="">Select department...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Field>
                  <ErrorMessage name="departmentId" component="div" className="invalid-feedback" />
                </div>
                <button id="fac-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2 me-2" />Add Faculty</>}
                </button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FacultyPage;
