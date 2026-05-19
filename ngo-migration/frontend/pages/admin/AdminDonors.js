import React, { useState, useEffect } from 'react';
import { payments } from '../../services/api';
import AdminLayout from './AdminLayout';

export default function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    payments.getAll()
      .then(donations => {
        const map = {};
        donations.forEach(d => {
          if (d.anonymous) return;
          if (!map[d.userId]) {
            map[d.userId] = { userId: d.userId, name: d.userName, email: d.userEmail, photo: d.userPhoto, total: 0, count: 0, lastDonation: d.createdAt };
          }
          map[d.userId].total += Number(d.amount) || 0;
          map[d.userId].count += 1;
        });
        setDonors(Object.values(map).sort((a, b) => b.total - a.total));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Donors</h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{donors.length} unique donors</span>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Donor</th><th>Email</th><th>Total Donated</th><th>Donations</th><th>Last Donation</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : donors.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No donors yet.</td></tr>
            ) : donors.map((d, i) => (
              <tr key={d.userId}>
                <td style={{ color: 'var(--text-light)', fontWeight: 700 }}>#{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {d.photo && <img src={d.photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
                    <strong>{d.name}</strong>
                  </div>
                </td>
                <td style={{ fontSize: '0.83rem', color: 'var(--text-mid)' }}>{d.email}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.05rem' }}>₹{d.total.toLocaleString()}</td>
                <td>{d.count}</td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  {d.lastDonation ? new Date(d.lastDonation).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
