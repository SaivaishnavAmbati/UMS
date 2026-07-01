import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner } from 'react-bootstrap';
import {
  fetchAllRegistrations, selectAllRegistrations, selectRegistrationLoading,
} from '../../store/slices/registrationSlice';

const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

const AdminRegistrationsPage = () => {
  const dispatch = useDispatch();
  const registrations = useSelector(selectAllRegistrations);
  const loading = useSelector(selectRegistrationLoading);

  useEffect(() => { dispatch(fetchAllRegistrations()); }, [dispatch]);

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
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Course</th>
                <th>Instructor</th>
                <th>Semester</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-5">No registrations found.</td></tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.studentName || `Student #${r.studentId}`}</td>
                    <td><strong>{r.courseTitle}</strong> <small className="text-muted">({r.courseCode})</small></td>
                    <td><strong>{r.facultyName || `Faculty #${r.facultyId}`}</strong></td>
                    <td>Sem #{r.semesterId}</td>
                    <td><Badge bg={statusColor[r.status] || 'secondary'} className="ums-badge">{r.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationsPage;
