import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Heart, FileText, Image, Users, MessageSquare,
  Settings, LogOut, ChevronRight, Menu, X, IndianRupee, UserCheck
} from 'lucide-react';
import './AdminLayout.css';

const NAV = [
  { path: '/admin',             label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
  { path: '/admin/causes',      label: 'Causes',     icon: <Heart size={18} /> },
  { path: '/admin/donations',   label: 'Donations',  icon: <IndianRupee size={18} /> },
  { path: '/admin/donors',      label: 'Donors',     icon: <Users size={18} /> },
  { path: '/admin/volunteers',  label: 'Volunteers', icon: <UserCheck size={18} /> },
  { path: '/admin/blog',        label: 'Blog',       icon: <FileText size={18} /> },
  { path: '/admin/gallery',     label: 'Gallery',    icon: <Image size={18} /> },
  { path: '/admin/messages',    label: 'Messages',   icon: <MessageSquare size={18} /> },
  { path: '/admin/cms',         label: 'CMS Pages',  icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }) {
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h2>Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span>❤</span>
            {sidebarOpen && <span>Admin Panel</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
              {sidebarOpen && location.pathname === item.path && <ChevronRight size={14} className="nav-arrow" />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {sidebarOpen && currentUser && (
            <div className="admin-user-info">
              {/* Use .photo and .name — camelCase from API normalizer */}
              <img src={currentUser.photo || '/default-avatar.png'} alt="admin" />
              <div>
                <strong>{currentUser.name?.split(' ')[0]}</strong>
                <span>Administrator</span>
              </div>
            </div>
          )}
          <button className="admin-logout" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
