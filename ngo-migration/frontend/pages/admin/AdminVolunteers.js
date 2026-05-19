import React, { useState, useEffect } from 'react';
import { volunteers as volunteersApi } from '../../services/api';
import AdminLayout from './AdminLayout';
import { format } from 'date-fns';

export default function AdminVolunteers() {
  const [vols, setVols] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    volunteersApi.getAll().then(setVols).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    try {
      await volunteersApi.updateStatus(id, status);
      setVols(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    } catch {}
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Volunteer Applications</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{vols.length} applications</span>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Role</th><th>Availability</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : vols.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No applications yet.</td></tr>
            ) : vols.map(v => (
              <tr key={v.id}>
                <td>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>{v.email}</div>
                  </div>
                </td>
                <td>{v.phone}</td>
                <td>{v.role}</td>
                <td>{v.availability}</td>
                <td>{v.createdAt ? format(new Date(v.createdAt), 'MMM d, yyyy') : '—'}</td>
                <td>
                  <select
                    value={v.status || 'pending'}
                    onChange={e => updateStatus(v.id, e.target.value)}
                    style={{ padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', background: 'white' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
