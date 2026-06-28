import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import {
  fetchNotifications, sendNotificationThunk, resetSent,
  selectNotifications, selectNotifLoading, selectNotifSent,
} from '../../store/slices/notificationSlice';
import { useSelector as useReduxSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const notifSchema = Yup.object({
  recipient: Yup.string().required('Recipient username is required'),
  type: Yup.string().oneOf(['IN_APP', 'EMAIL'], 'Invalid type').required(),
  title: Yup.string().required('Title is required').min(3),
  content: Yup.string().required('Content is required').min(5),
});

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const user = useReduxSelector(selectUser);
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotifLoading);
  const sent = useSelector(selectNotifSent);

  useEffect(() => {
    if (user?.username) dispatch(fetchNotifications(user.username));
  }, [dispatch, user]);

  useEffect(() => {
    if (sent) {
      setTimeout(() => dispatch(resetSent()), 3000);
    }
  }, [sent, dispatch]);

  const handleSend = async (values, { setSubmitting, resetForm }) => {
    await dispatch(sendNotificationThunk(values));
    setSubmitting(false);
    resetForm();
    if (user?.username) dispatch(fetchNotifications(user.username));
  };

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-bell me-3"></i>Notifications</h1>
        <p className="page-subtitle">Send and view system notifications</p>
      </div>

      <Row className="g-4">
        <Col lg={5}>
          <Card className="ums-card h-100">
            <Card.Header className="ums-card-header">
              <i className="bi bi-send me-2"></i>Send Notification
            </Card.Header>
            <Card.Body>
              {sent && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-check-circle-fill"></i> Notification sent successfully!
                </div>
              )}
              <Formik
                initialValues={{ recipient: '', type: 'IN_APP', title: '', content: '' }}
                validationSchema={notifSchema}
                onSubmit={handleSend}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form noValidate>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="notif-recipient">Recipient Username</label>
                      <Field id="notif-recipient" name="recipient" className={`form-control ums-input ${touched.recipient && errors.recipient ? 'is-invalid' : ''}`} placeholder="username" />
                      <ErrorMessage name="recipient" component="div" className="invalid-feedback" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="notif-type">Type</label>
                      <Field as="select" id="notif-type" name="type" className={`form-select ums-input ${touched.type && errors.type ? 'is-invalid' : ''}`}>
                        <option value="IN_APP">In-App</option>
                        <option value="EMAIL">Email</option>
                      </Field>
                      <ErrorMessage name="type" component="div" className="invalid-feedback" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="notif-title">Title</label>
                      <Field id="notif-title" name="title" className={`form-control ums-input ${touched.title && errors.title ? 'is-invalid' : ''}`} placeholder="Alert title" />
                      <ErrorMessage name="title" component="div" className="invalid-feedback" />
                    </div>
                    <div className="mb-4">
                      <label className="form-label" htmlFor="notif-content">Message</label>
                      <Field as="textarea" id="notif-content" name="content" rows={4} className={`form-control ums-input ${touched.content && errors.content ? 'is-invalid' : ''}`} placeholder="Notification message..." />
                      <ErrorMessage name="content" component="div" className="invalid-feedback" />
                    </div>
                    <button id="notif-send-btn" type="submit" className="btn ums-btn-primary w-100" disabled={isSubmitting}>
                      {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : <><i className="bi bi-send-fill me-2" />Send Notification</>}
                    </button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="ums-card h-100">
            <Card.Header className="ums-card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-inbox me-2"></i>Recent Notifications</span>
              <Badge bg="primary" className="ums-badge">{notifications.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>No notifications found.
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map((n, i) => (
                    <div key={n.id || i} className="notif-item">
                      <div className="notif-icon">
                        <i className={`bi ${n.type === 'EMAIL' ? 'bi-envelope-fill' : 'bi-bell-fill'}`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-content">{n.content}</div>
                        <div className="notif-meta">
                          <Badge bg="secondary" className="ums-badge me-2">{n.type}</Badge>
                          <span className="text-muted small">{new Date(n.sentAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge bg={n.status === 'SENT' ? 'success' : 'warning'} className="ums-badge align-self-start">
                        {n.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NotificationsPage;
