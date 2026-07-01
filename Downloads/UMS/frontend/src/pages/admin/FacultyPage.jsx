import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner } from 'react-bootstrap';
import {
  fetchFaculty, fetchDepartments,
  selectFaculty, selectAcademicLoading,
} from '../../store/slices/academicSlice';

const FacultyPage = () => {
  const dispatch = useDispatch();
  const faculty = useSelector(selectFaculty);
  const loading = useSelector(selectAcademicLoading);

  useEffect(() => {
    dispatch(fetchFaculty());
    dispatch(fetchDepartments());
  }, [dispatch]);

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title"><i className="bi bi-person-badge me-3"></i>Faculty Directory</h1>
          <p className="page-subtitle">Overview of all faculty members and their departments</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {faculty.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-5">No faculty found.</td></tr>
              ) : (
                faculty.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td><strong>{f.firstName} {f.lastName}</strong></td>
                    <td><code className="ums-code">@{f.username}</code></td>
                    <td>{f.email}</td>
                    <td>
                      <Badge bg="primary" className="ums-badge">
                        {f.departmentName || `Dept #${f.departmentId}`}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={f.status === 'ACTIVE' ? 'success' : 'warning'} className="ums-badge">
                        {f.status || 'PENDING'}
                      </Badge>
                    </td>
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

export default FacultyPage;
