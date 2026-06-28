import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { fetchDashboardMetrics, selectMetrics, selectReportLoading } from '../../store/slices/reportSlice';
import { exportRegistrations, exportAuditTrail } from '../../api/reportApi';

const StatCard = ({ icon, label, value, color, gradient }) => (
  <Card className="stat-card h-100 border-0" style={{ background: gradient }}>
    <Card.Body className="d-flex align-items-center gap-3 p-4">
      <div className="stat-icon" style={{ background: color }}>
        <i className={`bi ${icon} fs-4 text-white`}></i>
      </div>
      <div>
        <div className="stat-value">{value ?? '—'}</div>
        <div className="stat-label">{label}</div>
      </div>
    </Card.Body>
  </Card>
);

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const metrics = useSelector(selectMetrics);
  const loading = useSelector(selectReportLoading);

  useEffect(() => { dispatch(fetchDashboardMetrics()); }, [dispatch]);

  const handleExportRegistrations = async () => {
    try {
      const res = await exportRegistrations();
      downloadBlob(res.data, 'registrations.csv');
    } catch { alert('Export failed'); }
  };

  const handleExportAudit = async () => {
    try {
      const res = await exportAuditTrail();
      downloadBlob(res.data, 'audit_trail.csv');
    } catch { alert('Export failed'); }
  };

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i className="bi bi-speedometer2 me-3"></i>Dashboard
        </h1>
        <p className="page-subtitle">University Management System — Overview</p>
      </div>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading metrics...</p>
        </div>
      )}

      {!loading && metrics && (
        <>
          <Row className="g-4 mb-4">
            <Col md={6} xl={4}>
              <StatCard icon="bi-people-fill" label="Total Students" value={metrics.totalStudents}
                color="#6366f1" gradient="linear-gradient(135deg, #1e1b4b, #312e81)" />
            </Col>
            <Col md={6} xl={4}>
              <StatCard icon="bi-book-fill" label="Total Courses" value={metrics.totalCourses}
                color="#10b981" gradient="linear-gradient(135deg, #064e3b, #065f46)" />
            </Col>
            <Col md={6} xl={4}>
              <StatCard icon="bi-clipboard-data-fill" label="Total Registrations" value={metrics.totalRegistrations}
                color="#f59e0b" gradient="linear-gradient(135deg, #451a03, #78350f)" />
            </Col>
            <Col md={6} xl={4}>
              <StatCard icon="bi-hourglass-split" label="Pending" value={metrics.pendingRegistrations}
                color="#ef4444" gradient="linear-gradient(135deg, #450a0a, #7f1d1d)" />
            </Col>
            <Col md={6} xl={4}>
              <StatCard icon="bi-check-circle-fill" label="Approved" value={metrics.approvedRegistrations}
                color="#10b981" gradient="linear-gradient(135deg, #052e16, #064e3b)" />
            </Col>
            <Col md={6} xl={4}>
              <StatCard icon="bi-x-circle-fill" label="Rejected" value={metrics.rejectedRegistrations}
                color="#8b5cf6" gradient="linear-gradient(135deg, #2e1065, #3b0764)" />
            </Col>
          </Row>

          <div className="section-title mb-3">
            <i className="bi bi-download me-2"></i>Export Reports
          </div>
          <Row className="g-3">
            <Col md={6}>
              <button id="export-registrations-btn" className="btn ums-btn-outline w-100 py-3" onClick={handleExportRegistrations}>
                <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export Registrations CSV
              </button>
            </Col>
            <Col md={6}>
              <button id="export-audit-btn" className="btn ums-btn-outline w-100 py-3" onClick={handleExportAudit}>
                <i className="bi bi-file-earmark-lock me-2"></i>Export Audit Trail CSV
              </button>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
