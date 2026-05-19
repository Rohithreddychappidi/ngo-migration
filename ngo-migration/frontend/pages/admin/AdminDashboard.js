// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { causes as causesApi, payments, contacts as contactsApi, volunteers as volunteersApi } from '../../services/api';
import AdminLayout from './AdminLayout';
import { IndianRupee, Users, Heart, MessageSquare, TrendingUp, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRaised: 0, donors: 0, causes: 0, messages: 0, volunteers: 0, donations: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      payments.getAll(),
      causesApi.getAll(),
      contactsApi.getAll(),
      volunteersApi.getAll(),
    ]).then(([donRes, cauRes, msgRes, volRes]) => {
      const donations = donRes.status === 'fulfilled' ? donRes.value : [];
      const totalRaised = donations.reduce((s, d) => s + (Number(d.amount) || 0), 0);
      const uniqueDonors = new Set(donations.map(d => d.userId)).size;
      setStats({
        totalRaised,
        donors: uniqueDonors,
        causes: cauRes.status === 'fulfilled' ? cauRes.value.length : 0,
        messages: msgRes.status === 'fulfilled' ? msgRes.value.length : 0,
        volunteers: volRes.status === 'fulfilled' ? volRes.value.length : 0,
        donations: donations.length,
      });
      setRecentDonations(donations.slice(0, 8));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Raised',   value: `₹${stats.totalRaised.toLocaleString()}`, icon: <IndianRupee size={22} />, color: '#E8521A' },
    { label: 'Total Donors',   value: stats.donors,     icon: <Users size={22} />,       color: '#3498db' },
    { label: 'Donations',      value: stats.donations,  icon: <TrendingUp size={22} />,  color: '#9b59b6' },
    { label: 'Active Causes',  value: stats.causes,     icon: <Heart size={22} />,       color: '#e74c3c' },
    { label: 'Volunteers',     value: stats.volunteers, icon: <UserCheck size={22} />,   color: '#2ecc71' },
    { label: 'Messages',       value: stats.messages,   icon: <MessageSquare size={22} />, color: '#f39c12' },
  ];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <span className="dashboard-date">{format(new Date(), 'EEEE, MMMM d yyyy')}</span>
      </div>
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
            <div className="stat-card-info">
              <div className="stat-card-value">{loading ? '—' : s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="dashboard-lower">
        <div className="admin-card recent-donations-card">
          <div className="card-header"><h3>Recent Donations</h3></div>
          <table className="admin-table">
            <thead><tr><th>Donor</th><th>Cause</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {recentDonations.length === 0 && !loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '32px' }}>No donations yet</td></tr>
              ) : recentDonations.map(d => (
                <tr key={d.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{d.userPhoto && <img src={d.userPhoto} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}<span>{d.anonymous ? 'Anonymous' : d.userName}</span></div></td>
                  <td>{d.causeTitle}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{d.amount}</td>
                  <td>{d.createdAt ? format(new Date(d.createdAt), 'MMM d, yyyy') : '—'}</td>
                  <td><span className="status-badge status-success">{d.status || 'success'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
