import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { selectUser } from '../../store/slices/authSlice';
import { getFacultyByUsername } from '../../api/academicApi';

const FacultyProfilePage = () => {
  const user = useSelector(selectUser);
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getFacultyByUsername(user?.username);
        setProfile(res.data?.data);
      } catch (e) {
        setError('Profile not found. Contact administrator.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.username) load();
  }, [user]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-person-circle me-3"></i>My Profile</h1>
        <p className="page-subtitle">Faculty profile information</p>
      </div>
      {error && <div className="alert alert-warning">{error}</div>}
      {profile && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="ums-profile-card">
              <Card.Body className="text-center p-5">
                <div className="profile-avatar mb-4">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </div>
                <h3 className="fw-bold mb-1">{profile.firstName} {profile.lastName}</h3>
                <code className="text-muted">@{profile.username}</code>
                <div className="mt-2 mb-4">
                  <Badge bg="success" className="ums-badge fs-6">FACULTY</Badge>
                </div>
                <div className="profile-details">
                  <div className="profile-detail-row">
                    <i className="bi bi-envelope-fill me-2 text-primary"></i>
                    <span>{profile.email}</span>
                  </div>
                  <div className="profile-detail-row">
                    <i className="bi bi-building me-2 text-primary"></i>
                    <span>{profile.departmentName || `Department #${profile.departmentId}`}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FacultyProfilePage;
