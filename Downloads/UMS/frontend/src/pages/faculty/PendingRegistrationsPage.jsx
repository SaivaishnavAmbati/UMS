import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Modal } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchPendingRegistrations, selectPendingRegistrations, selectRegistrationLoading,
} from '../../store/slices/registrationSlice';
import { processRegistration } from '../../api/registrationApi';

const approvalSchema = Yup.object({
  status: Yup.string().oneOf(['APPROVED', 'REJECTED']).required(),
  remarks: Yup.string().when('status', { is: 'REJECTED', then: (s) => s.required('Reason required for rejection') }),
});

const PendingRegistrationsPage = () => {
  const dispatch = useDispatch();
  const pending = useSelector(selectPendingRegistrations);
  const loading = useSelector(selectRegistrationLoading);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { dispatch(fetchPendingRegistrations()); }, [dispatch]);

  const handleProcess = async (values, { setSubmitting }) => {
    try {
      await processRegistration(selected.id, values);
      setMsg('✅ Processed!');
      dispatch(fetchPendingRegistrations());
      setTimeout(() => { setSelected(null); setMsg(''); }, 1500);
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.message || 'Error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-hourglass-split me-3"></i>Pending Approvals</h1>
        <p className="page-subtitle">Review and approve student course registrations</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : pending.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-check-circle-fill fs-1 text-success d-block mb-3"></i>
          <h5>All caught up!</h5>
          <p className="text-muted">No pending registrations to review.</p>
        </div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr><th>#</th><th>Student</th><th>Course</th><th>Code</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pending.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.studentName || `Student #${r.studentId}`}</td>
                  <td><strong>{r.courseTitle}</strong></td>
                  <td><Badge bg="info" className="ums-badge">{r.courseCode}</Badge></td>
                  <td className="text-muted small">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button id={`approve-reg-${r.id}`} className="btn btn-sm ums-btn-success me-2" onClick={() => setSelected(r)}>
                      <i className="bi bi-check-circle me-1" />Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={!!selected} onHide={() => setSelected(null)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-clipboard-check me-2"></i>Review Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="ums-info-box mb-3">
              <div><strong>Student:</strong> {selected.studentName}</div>
              <div><strong>Course:</strong> {selected.courseTitle} ({selected.courseCode})</div>
            </div>
          )}
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-danger'} mb-3`}>{msg}</div>}
          <Formik initialValues={{ status: 'APPROVED', remarks: '' }} validationSchema={approvalSchema} onSubmit={handleProcess}>
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
                  <label className="form-label" htmlFor="fac-remarks">Remarks</label>
                  <Field as="textarea" id="fac-remarks" name="remarks" rows={3} className={`form-control ums-input ${touched.remarks && errors.remarks ? 'is-invalid' : ''}`} placeholder="Optional..." />
                  <ErrorMessage name="remarks" component="div" className="invalid-feedback" />
                </div>
                <button id="fac-process-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : <><i className="bi bi-send me-2" />Submit</>}
                </button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PendingRegistrationsPage;
