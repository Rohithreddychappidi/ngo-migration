import React, { useState } from 'react';
import { contacts as contactsApi } from '../services/api';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon } from '../components/ui/SocialIcons';
import './Contact.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await contactsApi.send(form);
      setSent(true);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <main className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Get in Touch</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>We'd love to hear from you. Reach out for collaborations, queries, or volunteer info.</p>
        </div>
      </div>

      <section className="contact-content">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2>Let's Connect</h2>
            <p className="contact-intro">Whether you want to donate, volunteer, collaborate, or just learn more — we're always happy to hear from you.</p>
            <div className="contact-details">
              <div className="contact-detail-item">
                <div className="contact-icon"><Phone size={20} /></div>
                <div><strong>Phone</strong><a href="tel:8886444317">8886444317</a></div>
              </div>
              <div className="contact-detail-item">
                <div className="contact-icon"><Mail size={20} /></div>
                <div><strong>Email</strong><a href="mailto:aneshajoyp@gmail.com">aneshajoyp@gmail.com</a></div>
              </div>
              <div className="contact-detail-item">
                <div className="contact-icon"><MapPin size={20} /></div>
                <div><strong>Address</strong><span>19-27-25/1, Gandhi Nagar, VUDA Colony,<br />Pedagantyada, Visakhapatnam - 530044</span></div>
              </div>
            </div>
            <div className="contact-socials">
              <p>Follow Our Journey</p>
              <div className="social-row">
                <a href="https://www.instagram.com/aneesha_joyp" target="_blank" rel="noreferrer" className="social-link instagram"><InstagramIcon size={18} /> Instagram</a>
                <a href="https://www.facebook.com/share/1CqAnysw7Z/" target="_blank" rel="noreferrer" className="social-link facebook"><FacebookIcon size={18} /> Facebook</a>
                <a href="https://youtube.com/@aneeshajoyp" target="_blank" rel="noreferrer" className="social-link youtube"><YoutubeIcon size={18} /> YouTube</a>
              </div>
            </div>
            <div className="map-embed">
              <iframe title="Location Map" src="https://maps.google.com/maps?q=Pedagantyada+Visakhapatnam&output=embed" width="100%" height="200" style={{ border: 0, borderRadius: 12 }} loading="lazy" />
            </div>
          </div>

          <div className="contact-form-wrap">
            {sent ? (
              <div className="form-success">
                <CheckCircle size={52} color="var(--success)" />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn-primary" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h3>Send a Message</h3>
                {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}
                <div className="form-row">
                  <div className="form-field"><label>Your Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" required /></div>
                  <div className="form-field"><label>Email *</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ravi@email.com" required /></div>
                </div>
                <div className="form-row">
                  <div className="form-field"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" /></div>
                  <div className="form-field">
                    <label>Subject *</label>
                    <select name="subject" value={form.subject} onChange={handleChange} required>
                      <option value="">Select...</option>
                      <option>Donation Query</option><option>Volunteer Enquiry</option>
                      <option>Partnership</option><option>General Query</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-field full"><label>Message *</label><textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Write your message..." required /></div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Sending...' : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
