import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Badge, Spinner, Row, Col } from 'react-bootstrap';
import {
  fetchMyRegistrations, selectMyRegistrations, selectRegistrationLoading,
} from '../../store/slices/registrationSlice';

const statusConfig = {
  PENDING: { color: 'warning', icon: 'bi-hourglass-split', label: 'Pending' },
  APPROVED: { color: 'success', icon: 'bi-check-circle-fill', label: 'Approved' },
  REJECTED: { color: 'danger', icon: 'bi-x-circle-fill', label: 'Rejected' },
};

const MyRegistrationsPage = () => {
  const dispatch = useDispatch();
  const registrations = useSelector(selectMyRegistrations);
  const loading = useSelector(selectRegistrationLoading);

  useEffect(() => { dispatch(fetchMyRegistrations()); }, [dispatch]);

  const grouped = {
    APPROVED: registrations.filter((r) => r.status === 'APPROVED'),
    PENDING: registrations.filter((r) => r.status === 'PENDING'),
    REJECTED: registrations.filter((r) => r.status === 'REJECTED'),
  };

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-journal-check me-3"></i>My Registrations</h1>
        <p className="page-subtitle">Track your course registration status</p>
      </div>

      <Row className="g-3 mb-4">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <Col md={4} key={status}>
            <div className={`reg-stat-mini reg-stat-${cfg.color}`}>
              <i className={`bi ${cfg.icon} fs-3`}></i>
              <div>
                <div className="fs-2 fw-bold">{grouped[status].length}</div>
                <div className="small">{cfg.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : registrations.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-journal fs-1 d-block mb-3"></i>
          <h5>No registrations yet</h5>
          <p className="text-muted">Browse courses and submit your first registration!</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {registrations.map((r) => {
            const cfg = statusConfig[r.status] || { color: 'secondary', icon: 'bi-question-circle', label: r.status };
            return (
              <Card key={r.id} className="reg-card">
                <Card.Body className="d-flex align-items-center gap-4 p-4">
                  <div className={`reg-status-icon reg-status-${cfg.color}`}>
                    <i className={`bi ${cfg.icon}`}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">{r.courseTitle}</h6>
                    <div className="d-flex gap-3 text-muted small">
                      <span><i className="bi bi-tag me-1"></i>{r.courseCode}</span>
                      <span><i className="bi bi-calendar me-1"></i>Sem #{r.semesterId}</span>
                      {r.createdAt && <span><i className="bi bi-clock me-1"></i>{new Date(r.createdAt).toLocaleDateString()}</span>}
                    </div>
                    {r.rejectionReason && (
                      <div className="text-danger small mt-1">
                        <i className="bi bi-info-circle me-1"></i>Reason: {r.rejectionReason}
                      </div>
                    )}
                  </div>
                  <Badge bg={cfg.color} className="ums-badge px-3 py-2">
                    <i className={`bi ${cfg.icon} me-1`}></i>{cfg.label}
                  </Badge>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRegistrationsPage;
