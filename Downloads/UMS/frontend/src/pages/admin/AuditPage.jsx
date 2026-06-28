import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Badge, Spinner, Form, InputGroup } from 'react-bootstrap';
import { getAuditLogs, getAuditLogsByUser } from '../../api/auditApi';

const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [filterInput, setFilterInput] = useState('');

  const loadLogs = async (username) => {
    setLoading(true);
    try {
      const res = username
        ? await getAuditLogsByUser(username)
        : await getAuditLogs();
      setLogs(res.data?.data || []);
    } catch (e) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(''); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setUsernameFilter(filterInput);
    loadLogs(filterInput.trim());
  };

  const handleClear = () => {
    setFilterInput('');
    setUsernameFilter('');
    loadLogs('');
  };

  const actionColor = (action) => {
    if (action?.includes('LOGIN')) return 'success';
    if (action?.includes('DELETE') || action?.includes('REJECT')) return 'danger';
    if (action?.includes('CREATE') || action?.includes('REGISTER')) return 'primary';
    if (action?.includes('APPROVE')) return 'info';
    return 'secondary';
  };

  return (
    <div className="page-container">
      <div className="page-header mb-4">
        <h1 className="page-title"><i className="bi bi-shield-lock me-3"></i>Audit Logs</h1>
        <p className="page-subtitle">System-wide activity and security audit trail</p>
      </div>

      <form onSubmit={handleFilter} className="d-flex gap-2 mb-4">
        <div className="flex-grow-1">
          <InputGroup>
            <InputGroup.Text className="ums-input-group-text">
              <i className="bi bi-person-search"></i>
            </InputGroup.Text>
            <Form.Control
              id="audit-username-filter"
              className="ums-input"
              value={filterInput}
              onChange={e => setFilterInput(e.target.value)}
              placeholder="Filter by username..."
            />
          </InputGroup>
        </div>
        <button id="audit-filter-btn" type="submit" className="btn ums-btn-primary px-4">
          <i className="bi bi-funnel me-2"></i>Filter
        </button>
        {usernameFilter && (
          <button id="audit-clear-btn" type="button" className="btn ums-btn-outline" onClick={handleClear}>
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </form>

      {usernameFilter && (
        <div className="mb-3">
          <Badge bg="primary" className="ums-badge me-2">
            <i className="bi bi-funnel me-1"></i>Filtered by: {usernameFilter}
          </Badge>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <div className="ums-table-wrapper">
          <Table responsive className="ums-table">
            <thead>
              <tr><th>#</th><th>Action</th><th>Performed By</th><th>Details</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted py-5">No audit logs found.</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id || i}>
                    <td>{i + 1}</td>
                    <td><Badge bg={actionColor(log.action)} className="ums-badge">{log.action}</Badge></td>
                    <td><code className="ums-code">@{log.performedBy}</code></td>
                    <td className="text-muted">{log.details}</td>
                    <td className="text-muted small">{new Date(log.timestamp).toLocaleString()}</td>
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

export default AuditPage;
