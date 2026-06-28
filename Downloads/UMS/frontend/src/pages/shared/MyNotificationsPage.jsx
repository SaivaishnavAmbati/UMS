import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Badge, Spinner } from 'react-bootstrap';
import {
  fetchNotifications,
  selectNotifications,
  selectNotifLoading,
} from '../../store/slices/notificationSlice';
import { selectUser } from '../../store/slices/authSlice';

const typeConfig = {
  IN_APP: { icon: 'bi-bell-fill', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  EMAIL: { icon: 'bi-envelope-fill', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const MyNotificationsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotifLoading);

  useEffect(() => {
    if (user?.username) {
      dispatch(fetchNotifications(user.username));
    }
  }, [dispatch, user]);

  const unread = notifications.filter((n) => n.status !== 'READ').length;

  return (
    <div className="page-container">
      <div className="page-header d-flex justify-content-between align-items-start mb-4">
        <div>
          <h1 className="page-title">
            <i className="bi bi-bell me-3"></i>Notifications
            {unread > 0 && (
              <Badge bg="danger" className="ms-2" style={{ fontSize: '0.7rem', verticalAlign: 'middle' }}>
                {unread} new
              </Badge>
            )}
          </h1>
          <p className="page-subtitle">Your system notifications and alerts</p>
        </div>
        <button
          className="btn ums-btn-outline"
          onClick={() => dispatch(fetchNotifications(user?.username))}
          title="Refresh"
        >
          <i className="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>

      <Card className="ums-card">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-muted mt-2 small">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state py-5">
              <i className="bi bi-bell-slash fs-1 d-block mb-3" style={{ color: '#64748b' }}></i>
              <h5 style={{ color: '#94a3b8' }}>No notifications yet</h5>
              <p className="text-muted small">You'll see messages from administrators here.</p>
            </div>
          ) : (
            <div>
              {notifications.map((n, i) => {
                const cfg = typeConfig[n.type] || typeConfig.IN_APP;
                return (
                  <div
                    key={n.id || i}
                    className="notif-item"
                    style={{ borderLeft: `3px solid ${cfg.color}` }}
                  >
                    <div
                      className="notif-icon"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <i className={`bi ${cfg.icon}`}></i>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="notif-title">{n.title}</div>
                        <Badge
                          bg={n.status === 'SENT' ? 'success' : 'secondary'}
                          className="ums-badge flex-shrink-0"
                        >
                          {n.status}
                        </Badge>
                      </div>
                      <div className="notif-content mt-1">{n.content}</div>
                      <div className="notif-meta mt-2">
                        <Badge bg="secondary" className="ums-badge me-2" style={{ fontSize: '0.65rem' }}>
                          {n.type === 'IN_APP' ? 'In-App' : 'Email'}
                        </Badge>
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          <i className="bi bi-clock me-1"></i>
                          {n.sentAt ? new Date(n.sentAt).toLocaleString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          }) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default MyNotificationsPage;
