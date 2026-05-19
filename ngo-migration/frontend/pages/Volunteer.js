import React, { useState } from 'react';
import { volunteers as volunteersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Users, Heart, Clock, Award, Send } from 'lucide-react';
import './Volunteer.css';

const ROLES = ['Community Outreach', 'Food Distribution', 'Education Support', 'Healthcare Drive', 'Environmental Activity', 'Animal Welfare', 'Event Management', 'Photography/Videography', 'Social Media', 'Other'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Both', 'Flexible'];

export default function VolunteerPage() {
  const { currentUser, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', role: '', availability: '', experience: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!currentUser) { loginWithGoogle(); return; }
    setLoading(true);
    setError('');
    try {
      await volunteersApi.apply(form);
      setSubmitted(true);
    } catch (err) {
      setError('Submission failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <main className="volunteer-page">
      <div className="vol-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Join Our Team</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>Become a Volunteer</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: 520 }}>Your time is the most powerful gift you can give. Join our community and help create real, lasting change.</p>
        </div>
      </div>

      <section className="vol-why">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">Why Join Us</p>
            <h2 className="section-title">What You'll Gain</h2>
          </div>
          <div className="vol-benefits-grid">
            {[
              { icon: <Heart size={26} />, title: 'Make Real Impact', desc: "See the direct difference your efforts make in people's lives." },
              { icon: <Users size={26} />, title: 'Community', desc: 'Join a warm, welcoming team of like-minded change-makers.' },
              { icon: <Clock size={26} />, title: 'Flexible Hours', desc: "Volunteer on your own schedule — weekdays, weekends, or whenever you're free." },
              { icon: <Award size={26} />, title: 'Recognition', desc: 'Receive an appreciation certificate and be featured on our donor wall.' },
            ].map((b, i) => (
              <div key={i} className="vol-benefit">
                <div className="vol-benefit-icon">{b.icon}</div>
                <h3>{b.title}</h3><p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vol-form-section">
        <div className="container vol-form-container">
          {!currentUser ? (
            <div className="vol-login-prompt">
              <Users size={52} color="var(--primary)" />
              <h2>Sign in to Apply</h2>
              <p>Please sign in with Google to submit your volunteer application.</p>
              <button className="btn-primary" onClick={loginWithGoogle}>Continue with Google</button>
            </div>
          ) : submitted ? (
            <div className="vol-success">
              <CheckCircle size={56} color="var(--success)" />
              <h2>Application Submitted!</h2>
              <p>Thank you, <strong>{currentUser.name?.split(' ')[0]}</strong>! We've received your volunteer application.</p>
              <p className="vol-success-sub">Our team will get back to you within 2–3 working days at <strong>{currentUser.email}</strong>.</p>
              <button className="btn-primary" onClick={() => setSubmitted(false)}>Submit Another</button>
            </div>
          ) : (
            <div className="vol-form-wrap">
              <div className="vol-form-header">
                <img src={currentUser.photo || '/default-avatar.png'} alt="avatar" className="vol-avatar" />
                <div><h3>Hello, {currentUser.name?.split(' ')[0]}!</h3><p>Complete the form below to join as a volunteer.</p></div>
              </div>
              {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
              <form onSubmit={handleSubmit} className="vol-form">
                <div className="form-row">
                  <div className="form-field"><label>Full Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required /></div>
                  <div className="form-field"><label>Email *</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required /></div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label>Phone *</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required /></div>
                  <div className="form-field"><label>City</label><input name="city" value={form.city} onChange={handleChange} placeholder="Visakhapatnam" /></div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Preferred Role *</label>
                    <select name="role" value={form.role} onChange={handleChange} required>
                      <option value="">Select a role</option>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Availability *</label>
                    <select name="availability" value={form.availability} onChange={handleChange} required>
                      <option value="">Select availability</option>
                      {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field full"><label>Prior Experience</label><input name="experience" value={form.experience} onChange={handleChange} placeholder="Any previous volunteer or NGO work?" /></div>
                <div className="form-field full"><label>Why do you want to volunteer?</label><textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Tell us your motivation..." /></div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Submitting...' : <><Send size={16} /> Submit Application</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
