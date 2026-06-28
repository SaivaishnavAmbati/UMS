import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="ums-app-shell">
      <Sidebar />
      <main className="ums-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
