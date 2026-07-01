import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Modal, Tabs, Tab } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  fetchPendingRegistrations, selectPendingRegistrations, selectRegistrationLoading,
  fetchAllRegistrations, selectAllRegistrations
} from '../../store/slices/registrationSlice';
import { processRegistration } from '../../api/registrationApi';
import { getFacultyByUsername } from '../../api/academicApi';
import { selectUser } from '../../store/slices/authSlice';

const approvalSchema = Yup.object({
  status: Yup.string().oneOf(['APPROVED', 'REJECTED']).required(),
  remarks: Yup.string().when('status', { is: 'REJECTED', then: (s) => s.required('Reason required for rejection') }),
});

const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

const PendingRegistrationsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const pending = useSelector(selectPendingRegistrations);
  const allRegistrations = useSelector(selectAllRegistrations);
  const loading = useSelector(selectRegistrationLoading);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [facultyProfile, setFacultyProfile] = useState(null);

  useEffect(() => {
    dispatch(fetchPendingRegistrations());
    dispatch(fetchAllRegistrations());
    if (user?.role === 'FACULTY' && user?.username) {
      getFacultyByUsername(user.username)
        .then(res => setFacultyProfile(res.data?.data))
        .catch(err => console.error("Failed to load faculty profile", err));
    }
  }, [dispatch, user]);

  const handleProcess = async (values, { setSubmitting }) => {
    try {
      await processRegistration(selected.id, {
        status: values.status,
        rejectionReason: values.remarks // backend expects rejectionReason
      });
      setMsg('✅ Processed!');
      dispatch(fetchPendingRegistrations());
      dispatch(fetchAllRegistrations());
      setTimeout(() => { setSelected(null); setMsg(''); }, 1500);
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.message || 'Error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // If logged in as Faculty, only show registrations assigned to this faculty member
  const filteredPending = user?.role === 'FACULTY' && facultyProfile
    ? pending.filter(r => r.facultyId === facultyProfile.id)
    : pending;

  const [historyFilter, setHistoryFilter] = useState('ALL');

  const filteredHistory = (user?.role === 'FACULTY' && facultyProfile
    ? allRegistrations.filter(r => r.facultyId === facultyProfile.id && (r.status === 'APPROVED' || r.status === 'REJECTED'))
    : allRegistrations.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED')
  ).filter(r => historyFilter === 'ALL' || r.status === historyFilter);

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-hourglass-split me-3"></i>Pending Approvals</h1>
        <p className="page-subtitle">
          {user?.role === 'FACULTY' ? 'Review registrations and access decision history for your courses' : 'Review pending student course registrations'}
        </p>
      </div>

      <Tabs defaultActiveKey="pending" id="registration-management-tabs" className="mb-4 ums-tabs">
        <Tab eventKey="pending" title={`Pending Review (${filteredPending.length})`}>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : filteredPending.length === 0 ? (
            <div className="empty-state py-5 text-center">
              <i className="bi bi-check-circle-fill fs-1 text-success d-block mb-3"></i>
              <h5>All caught up!</h5>
              <p className="text-muted">No pending registrations to review.</p>
            </div>
          ) : (
            <div className="ums-table-wrapper">
              <Table responsive className="ums-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Instructor</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPending.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.studentName || `Student #${r.studentId}`}</td>
                      <td><strong>{r.courseTitle}</strong></td>
                      <td><Badge bg="info" className="ums-badge">{r.courseCode}</Badge></td>
                      <td><strong>{r.facultyName || `Faculty #${r.facultyId}`}</strong></td>
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
        </Tab>

        <Tab eventKey="history" title={`Decision History (${filteredHistory.length})`}>
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
                <div className="text-muted small">Filter decisions made for your courses:</div>
                <div style={{ width: '200px' }}>
                  <select
                    className="form-select ums-input py-1.5"
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                  >
                    <option value="ALL">All Decisions</option>
                    <option value="APPROVED">Approved Only</option>
                    <option value="REJECTED">Rejected Only</option>
                  </select>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="empty-state py-5 text-center">
                  <i className="bi bi-funnel fs-1 text-muted d-block mb-3"></i>
                  <h5>No records found</h5>
                  <p className="text-muted">No registrations match the selected status.</p>
                </div>
              ) : (
                <div className="ums-table-wrapper">
                  <Table responsive className="ums-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Code</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((r) => (
                        <tr key={r.id}>
                          <td>{r.id}</td>
                          <td>{r.studentName || `Student #${r.studentId}`}</td>
                          <td><strong>{r.courseTitle}</strong></td>
                          <td><Badge bg="info" className="ums-badge">{r.courseCode}</Badge></td>
                          <td>
                            <Badge bg={statusColor[r.status] || 'secondary'} className="ums-badge">
                              {r.status}
                            </Badge>
                          </td>
                          <td className="text-muted small">
                            {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </Tab>
      </Tabs>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title><i className="bi bi-clipboard-check me-2"></i>Review Registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="ums-info-box mb-3">
              <div><strong>Student:</strong> {selected.studentName}</div>
              <div><strong>Course:</strong> {selected.courseTitle} ({selected.courseCode})</div>
              <div><strong>Instructor:</strong> {selected.facultyName}</div>
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
                  <label className="form-label" htmlFor="pending-remarks">
                    Rejection Remarks {values.status === 'REJECTED' && <span className="text-danger">*</span>}
                  </label>
                  <Field 
                    as="textarea" 
                    id="pending-remarks" 
                    name="remarks" 
                    rows={3} 
                    className={`form-control ums-input ${touched.remarks && errors.remarks ? 'is-invalid' : ''}`} 
                    placeholder="Provide remarks if rejecting..." 
                  />
                  <ErrorMessage name="remarks" component="div" className="invalid-feedback" />
                </div>

                <button id="process-reg-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
                  ) : (
                    <><i className="bi bi-send me-2" />Submit Decision</>
                  )}
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
