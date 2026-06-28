import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Table, Badge, Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchDepartments, addDepartment, removeDepartment,
  selectDepartments, selectAcademicLoading, selectAcademicError,
} from '../../store/slices/academicSlice';

const deptSchema = Yup.object({
  name: Yup.string().required('Name is required').min(2, 'Min 2 characters'),
  code: Yup.string().required('Code is required').min(2).max(10).uppercase(),
  description: Yup.string(),
});

const DepartmentsPage = () => {
  const dispatch = useDispatch();
  const departments = useSelector(selectDepartments);
  const loading = useSelector(selectAcademicLoading);
  const error = useSelector(selectAcademicError);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { dispatch(fetchDepartments()); }, [dispatch]);

  const handleCreate = async (values, { setSubmitting, resetForm }) => {
    await dispatch(addDepartment(values));
    setSubmitting(false);
    resetForm();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department? This cannot be undone.')) {
      dispatch(removeDepartment(id));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="page-title"><i className="bi bi-building me-3"></i>Departments</h1>
          <p className="page-subtitle">Manage academic departments</p>
        </div>
        <button id="add-department-btn" className="btn ums-btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Department
        </button>
      </div>

      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2" />{error}</div>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-muted py-5">No departments found.</td></tr>
              ) : (
                departments.map((dept, i) => (
                  <tr key={dept.id}>
                    <td>{i + 1}</td>
                    <td><strong>{dept.name}</strong></td>
                    <td><Badge bg="primary" className="ums-badge">{dept.code}</Badge></td>
                    <td>
                      <button
                        id={`delete-dept-${dept.id}`}
                        className="btn btn-sm ums-btn-danger"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <i className="bi bi-trash me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Create Department Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-building-add me-2"></i>Add Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ name: '', code: '', description: '' }}
            validationSchema={deptSchema}
            onSubmit={handleCreate}
          >
            {({ isSubmitting, touched, errors }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="dept-name">Department Name</label>
                  <Field id="dept-name" name="name" className={`form-control ums-input ${touched.name && errors.name ? 'is-invalid' : ''}`} placeholder="e.g. Computer Science" />
                  <ErrorMessage name="name" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="dept-code">Code</label>
                  <Field id="dept-code" name="code" className={`form-control ums-input ${touched.code && errors.code ? 'is-invalid' : ''}`} placeholder="e.g. CS" />
                  <ErrorMessage name="code" component="div" className="invalid-feedback" />
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="dept-description">Description (optional)</label>
                  <Field as="textarea" id="dept-description" name="description" rows={3} className="form-control ums-input" placeholder="Brief description..." />
                </div>
                <button id="dept-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2 me-2" />Create Department</>}
                </button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
