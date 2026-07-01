import React, { useEffect, useState } from 'react';
import { Table, Badge, Spinner, Modal, Tabs, Tab } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getPendingStudents, approveStudentProfile } from '../../api/studentApi';
import { getPendingFaculty, approveFacultyProfile, getDepartments } from '../../api/academicApi';

const approvalSchema = Yup.object({
  status: Yup.string().oneOf(['ACTIVE', 'REJECTED']).required('Status is required'),
  reason: Yup.string().when('status', { is: 'REJECTED', then: (s) => s.required('Reason is required for rejection') }),
});

const AdminProfileApprovalsPage = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null); // { type: 'student'|'faculty', data: ... }
  const [actionMsg, setActionMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const studRes = await getPendingStudents();
      const facRes = await getPendingFaculty();
      const depRes = await getDepartments();

      setPendingStudents(studRes.data?.data || []);
      setPendingFaculty(facRes.data?.data || []);
      setDepartments(depRes.data?.data || []);
    } catch (e) {
      console.error("Failed to load profile approvals data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessDecision = async (values, { setSubmitting }) => {
    setActionMsg('');
    try {
      if (selectedProfile.type === 'student') {
        await approveStudentProfile(selectedProfile.data.id, values.status, values.reason);
      } else {
        await approveFacultyProfile(selectedProfile.data.id, values.status, values.reason);
      }
      setActionMsg('✅ Profile processed successfully!');
      loadData();
      setTimeout(() => {
        setSelectedProfile(null);
        setActionMsg('');
      }, 1500);
    } catch (e) {
      setActionMsg(`❌ ${e.response?.data?.message || 'Failed to process decision'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getDeptName = (deptId) => {
    return departments.find((d) => d.id === deptId)?.name || `Dept #${deptId}`;
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-person-check-fill me-3"></i>Profile Approvals</h1>
        <p className="page-subtitle">Verify and approve student and faculty registrations</p>
      </div>

      <Tabs defaultActiveKey="students" id="profile-approvals-tabs" className="mb-4 ums-tabs">
        <Tab eventKey="students" title={`Students (${pendingStudents.length})`}>
          <div className="ums-table-wrapper">
            <Table responsive className="ums-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-5">No pending student profiles found.</td></tr>
                ) : (
                  pendingStudents.map((s) => (
                    <tr key={s.id}>
                      <td>STU-{String(s.id).padStart(4, '0')}</td>
                      <td><strong>{s.firstName} {s.lastName}</strong></td>
                      <td><code className="ums-code">@{s.username}</code></td>
                      <td>{s.email}</td>
                      <td><Badge bg="primary" className="ums-badge">{getDeptName(s.departmentId)}</Badge></td>
                      <td><Badge bg="warning" className="ums-badge">{s.enrollmentStatus}</Badge></td>
                      <td>
                        <button 
                          className="btn btn-sm ums-btn-primary" 
                          onClick={() => setSelectedProfile({ type: 'student', data: s })}
                        >
                          <i className="bi bi-pencil-square me-1" />Process
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="faculty" title={`Faculty (${pendingFaculty.length})`}>
          <div className="ums-table-wrapper">
            <Table responsive className="ums-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Assigned Course</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingFaculty.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-5">No pending faculty profiles found.</td></tr>
                ) : (
                  pendingFaculty.map((f) => (
                    <tr key={f.id}>
                      <td>FAC-{String(f.id).padStart(4, '0')}</td>
                      <td><strong>{f.firstName} {f.lastName}</strong></td>
                      <td><code className="ums-code">@{f.username}</code></td>
                      <td>{f.email}</td>
                      <td><Badge bg="primary" className="ums-badge">{f.departmentName || getDeptName(f.departmentId)}</Badge></td>
                      <td>
                        <strong>{f.courseTitle || '—'}</strong> <small className="text-muted">({f.courseCode})</small>
                      </td>
                      <td><Badge bg="warning" className="ums-badge">{f.status}</Badge></td>
                      <td>
                        <button 
                          className="btn btn-sm ums-btn-primary" 
                          onClick={() => setSelectedProfile({ type: 'faculty', data: f })}
                        >
                          <i className="bi bi-pencil-square me-1" />Process
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      {/* Decision Modal */}
      <Modal show={!!selectedProfile} onHide={() => setSelectedProfile(null)} centered className="ums-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-shield-check me-2"></i>
            Process {selectedProfile?.type === 'student' ? 'Student' : 'Faculty'} Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProfile && (
            <div className="mb-3 p-3 ums-info-box">
              <div><strong>Name:</strong> {selectedProfile.data.firstName} {selectedProfile.data.lastName}</div>
              <div><strong>Username:</strong> @{selectedProfile.data.username}</div>
              <div><strong>Email:</strong> {selectedProfile.data.email}</div>
              <div><strong>Department:</strong> {getDeptName(selectedProfile.data.departmentId)}</div>
              {selectedProfile.type === 'faculty' && (
                <div><strong>Course to Teach:</strong> {selectedProfile.data.courseTitle} ({selectedProfile.data.courseCode})</div>
              )}
            </div>
          )}

          {actionMsg && (
            <div className={`alert ${actionMsg.startsWith('✅') ? 'alert-success' : 'alert-danger'} mb-3`}>
              {actionMsg}
            </div>
          )}

          <Formik
            initialValues={{ status: 'ACTIVE', reason: '' }}
            validationSchema={approvalSchema}
            onSubmit={handleProcessDecision}
          >
            {({ isSubmitting, values, touched, errors }) => (
              <Form noValidate>
                <div className="mb-3">
                  <label className="form-label">Decision</label>
                  <div className="d-flex gap-3">
                    <label className={`decision-option ${values.status === 'ACTIVE' ? 'approved' : ''}`}>
                      <Field type="radio" name="status" value="ACTIVE" className="d-none" />
                      <i className="bi bi-check-circle-fill me-2"></i>Approve
                    </label>
                    <label className={`decision-option ${values.status === 'REJECTED' ? 'rejected' : ''}`}>
                      <Field type="radio" name="status" value="REJECTED" className="d-none" />
                      <i className="bi bi-x-circle-fill me-2"></i>Reject
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label" htmlFor="proc-reason">
                    Rejection Reason {values.status === 'REJECTED' && <span className="text-danger">*</span>}
                  </label>
                  <Field 
                    as="textarea" 
                    id="proc-reason" 
                    name="reason" 
                    rows={3} 
                    className={`form-control ums-input ${touched.reason && errors.reason ? 'is-invalid' : ''}`} 
                    placeholder="Provide reason if rejecting..." 
                  />
                  <ErrorMessage name="reason" component="div" className="invalid-feedback" />
                </div>

                <button id="decision-submit-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
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

export default AdminProfileApprovalsPage;
