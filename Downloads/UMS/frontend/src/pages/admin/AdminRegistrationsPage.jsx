import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Modal } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchAllRegistrations, selectAllRegistrations, selectRegistrationLoading,
} from '../../store/slices/registrationSlice';
import { processRegistration } from '../../api/registrationApi';

const approvalSchema = Yup.object({
  status: Yup.string().oneOf(['APPROVED', 'REJECTED']).required('Status is required'),
  remarks: Yup.string().when('status', { is: 'REJECTED', then: (s) => s.required('Reason is required for rejection') }),
});

const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

const AdminRegistrationsPage = () => {
  const dispatch = useDispatch();
  const registrations = useSelector(selectAllRegistrations);
  const loading = useSelector(selectRegistrationLoading);
  const [selected, setSelected] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { dispatch(fetchAllRegistrations()); }, [dispatch]);

  const handleProcess = async (values, { setSubmitting }) => {
    try {
      await processRegistration(selected.id, values);
      setActionMsg('✅ Registration processed successfully!');
      dispatch(fetchAllRegistrations());
      setTimeout(() => { setSelected(null); setActionMsg(''); }, 1500);
    } catch (e) {
      setActionMsg(`❌ ${e.response?.data?.message || 'Failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-clipboard-check me-3"></i>All Registrations</h1>
        <p className="page-subtitle">View and manage all student course registrations</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr><th>#</th><th>Student</th><th>Course</th><th>Semester</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-5">No registrations found.</td></tr>
              ) : (
                registrations.map((r, i) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.studentName || `Student #${r.studentId}`}</td>
                    <td><strong>{r.courseTitle}</strong> <small className="text-muted">({r.courseCode})</small></td>
                    <td>Sem #{r.semesterId}</td>
                    <td><Badge bg={statusColor[r.status] || 'secondary'} className="ums-badge">{r.status}</Badge></td>
                    <td>
                      {r.status === 'PENDING' && (
                        <button id={`process-reg-${r.id}`} className="btn btn-sm ums-btn-primary" onClick={() => setSelected(r)}>
                          <i className="bi bi-pencil-square me-1" />Process
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

      <Modal show={!!selected} onHide={() => setSelected(null)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-clipboard-check me-2"></i>Process Registration #{selected?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="mb-3 p-3 ums-info-box">
              <div><strong>Student:</strong> {selected.studentName}</div>
              <div><strong>Course:</strong> {selected.courseTitle} ({selected.courseCode})</div>
              <div><strong>Status:</strong> <Badge bg={statusColor[selected.status]}>{selected.status}</Badge></div>
            </div>
          )}
          {actionMsg && <div className={`alert ${actionMsg.startsWith('✅') ? 'alert-success' : 'alert-danger'} mb-3`}>{actionMsg}</div>}
          <Formik
            initialValues={{ status: 'APPROVED', remarks: '' }}
            validationSchema={approvalSchema}
            onSubmit={handleProcess}
          >
            {({ isSubmitting, values, touched, errors }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label">Decision</label>
                  <div className="d-flex gap-3">
                    <label className={`decision-option ${values.status === 'APPROVED' ? 'approved' : ''}`}>
                      <Field type="radio" name="status" value="APPROVED" className="d-none" />
                      <i className="bi bi-check-circle-fill me-2"></i>Approve
                    </label>
                    <label className={`decision-option ${values.status === 'REJECTED' ? 'rejected' : ''}`}>
                      <Field type="radio" name="status" value="REJECTED" className="d-none" />
                      <i className="bi bi-x-circle-fill me-2"></i>Reject
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label" htmlFor="proc-remarks">Remarks {values.status === 'REJECTED' && <span className="text-danger">*</span>}</label>
                  <Field as="textarea" id="proc-remarks" name="remarks" rows={3} className={`form-control ums-input ${touched.remarks && errors.remarks ? 'is-invalid' : ''}`} placeholder="Optional remarks..." />
                  <ErrorMessage name="remarks" component="div" className="invalid-feedback" />
                </div>
                <button id="process-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : <><i className="bi bi-send me-2" />Submit Decision</>}
                </button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminRegistrationsPage;
