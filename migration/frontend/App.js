import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import CausesPage from './pages/Causes';
import BlogPage from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import ContactPage from './pages/Contact';
import GalleryPage from './pages/Gallery';
import DonationPage from './pages/Donation';
import VolunteerPage from './pages/Volunteer';
import AuthCallback from './pages/AuthCallback';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCauses from './pages/admin/AdminCauses';
import AdminDonations from './pages/admin/AdminDonations';
import AdminDonors from './pages/admin/AdminDonors';
import AdminVolunteers from './pages/admin/AdminVolunteers';
import AdminBlog from './pages/admin/AdminBlog';
import AdminGallery from './pages/admin/AdminGallery';
import AdminMessages from './pages/admin/AdminMessages';
import AdminCMS from './pages/admin/AdminCMS';

import './App.css';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-body)', fontSize: '0.9rem' } }} />
        <Routes>
          {/* Public */}
          <Route path="/"              element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/about"         element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/causes"        element={<PublicLayout><CausesPage /></PublicLayout>} />
          <Route path="/blog"          element={<PublicLayout><BlogPage /></PublicLayout>} />
          <Route path="/blog/:id"      element={<PublicLayout><BlogPostPage /></PublicLayout>} />
          <Route path="/contact"       element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/gallery"       element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path="/donate"        element={<PublicLayout><DonationPage /></PublicLayout>} />
          <Route path="/donate-monthly" element={<PublicLayout><DonationPage /></PublicLayout>} />
          <Route path="/volunteer"     element={<PublicLayout><VolunteerPage /></PublicLayout>} />

          {/* OAuth callback — backend redirects here with ?token= */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin */}
          <Route path="/admin"              element={<AdminDashboard />} />
          <Route path="/admin/causes"       element={<AdminCauses />} />
          <Route path="/admin/donations"    element={<AdminDonations />} />
          <Route path="/admin/donors"       element={<AdminDonors />} />
          <Route path="/admin/volunteers"   element={<AdminVolunteers />} />
          <Route path="/admin/blog"         element={<AdminBlog />} />
          <Route path="/admin/gallery"      element={<AdminGallery />} />
          <Route path="/admin/messages"     element={<AdminMessages />} />
          <Route path="/admin/cms"          element={<AdminCMS />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
