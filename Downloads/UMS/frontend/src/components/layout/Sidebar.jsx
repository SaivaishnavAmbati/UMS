import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser, selectRole } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/departments', icon: 'bi-building', label: 'Departments' },
    { to: '/admin/semesters', icon: 'bi-calendar3', label: 'Semesters' },
    { to: '/admin/courses', icon: 'bi-book', label: 'Courses' },
    { to: '/admin/faculty', icon: 'bi-person-badge', label: 'Faculty' },
    { to: '/admin/registrations', icon: 'bi-clipboard-check', label: 'Registrations' },
    { to: '/admin/audit', icon: 'bi-shield-lock', label: 'Audit Logs' },
    { to: '/admin/notifications', icon: 'bi-bell', label: 'Notifications' },
  ];

  const facultyLinks = [
    { to: '/faculty/pending', icon: 'bi-hourglass-split', label: 'Pending Approvals' },
    { to: '/faculty/profile', icon: 'bi-person-circle', label: 'My Profile' },
    { to: '/faculty/notifications', icon: 'bi-bell', label: 'Notifications' },
  ];

  const studentLinks = [
    { to: '/student/profile', icon: 'bi-person-circle', label: 'My Profile' },
    { to: '/student/courses', icon: 'bi-search', label: 'Browse Courses' },
    { to: '/student/registrations', icon: 'bi-journal-check', label: 'My Registrations' },
    { to: '/student/notifications', icon: 'bi-bell', label: 'Notifications' },
  ];

  const links =
    role === 'ADMIN' ? adminLinks :
    role === 'FACULTY' ? facultyLinks :
    studentLinks;

  const roleLabel = role === 'ADMIN' ? 'Administrator' : role === 'FACULTY' ? 'Faculty' : 'Student';

  return (
    <div className="ums-sidebar d-flex flex-column">
      {/* Brand */}
      <div className="sidebar-brand">
        <i className="bi bi-mortarboard-fill me-2"></i>
        <span>UMS</span>
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info overflow-hidden">
          <div className="user-name text-truncate">{user?.username}</div>
          <div className="user-role-badge">{roleLabel}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-grow-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <i className={`bi ${link.icon}`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <i className="bi bi-box-arrow-left me-2"></i>
        Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
