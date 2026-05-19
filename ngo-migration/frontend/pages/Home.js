import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { causes as causesApi, payments, cms } from '../services/api';
import CauseCard from '../components/ui/CauseCard';
import { Heart, Camera, Video, ArrowRight, Users, CheckCircle, ChevronDown } from 'lucide-react';
import './Home.css';

const CATEGORIES = ['All', 'Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare'];

const DEFAULT_CONTENT = {
  hero: { headline: 'Transform Lives With Every Donation', subheadline: 'Join Aneesha Joy Foundation in creating meaningful change across Visakhapatnam — one cause at a time.', ctaText: 'Start Donating', bgImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80' },
  transparency: { title: 'Our Commitment to Transparency', subtitle: 'Every contribution is documented, verified, and shared with our donors.' },
  volunteer: { title: 'Become a Volunteer', subtitle: 'Join our growing family of changemakers. Your time and skills can transform lives.', ctaText: 'Join as Volunteer' },
};

const DEMO_CAUSES = [
  { id: 'd1', title: 'Feed a Family', category: 'Food', amount: 200, unit: 'family/day', description: 'Help provide nutritious meals to underprivileged families.', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
  { id: 'd2', title: 'Plant a Sapling', category: 'Environment', amount: 50, unit: 'sapling', description: 'Help us grow a greener future for coming generations.', imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80' },
  { id: 'd3', title: 'Birthday Celebration', category: 'Birthday', amount: 500, unit: 'child', description: 'Bring smiles to orphanage children on their birthdays.', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80' },
  { id: 'd4', title: 'School Supplies', category: 'Education', amount: 300, unit: 'student', description: 'Give a child the tools they need to learn and grow.', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80' },
  { id: 'd5', title: 'Animal Shelter Care', category: 'Animals', amount: 150, unit: 'animal/week', description: 'Support our local animal shelter.', imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80' },
  { id: 'd6', title: 'Medical Camp Support', category: 'Healthcare', amount: 1000, unit: 'patient', description: 'Fund free medical checkups for the rural community.', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
  { id: 'd7', title: 'Orphanage Monthly Fund', category: 'Orphanage', amount: 2000, unit: 'month', description: 'Monthly contributions to support our partner orphanages.', imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80' },
  { id: 'd8', title: 'Clean Water Access', category: 'Healthcare', amount: 800, unit: 'household', description: 'Provide clean drinking water to underserved households.', imageUrl: 'https://images.unsplash.com/photo-1594671676461-7e649a2a7a4c?w=400&q=80' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [causesList, setCausesList] = useState([]);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [donors, setDonors] = useState([]);
  const [stats, setStats] = useState({ totalDonors: 0, totalRaised: 0, causesSupported: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      cms.get('homepage'),
      causesApi.getAll(),
      payments.getAll(),
    ]).then(([cmsRes, causesRes, donationsRes]) => {
      if (cmsRes.status === 'fulfilled' && cmsRes.value) setContent({ ...DEFAULT_CONTENT, ...cmsRes.value });
      if (causesRes.status === 'fulfilled') setCausesList(causesRes.value);
      if (donationsRes.status === 'fulfilled') {
        const donations = donationsRes.value;
        const totalRaised = donations.reduce((s, d) => s + (Number(d.amount) || 0), 0);
        const uniqueDonors = new Set(donations.map(d => d.userId)).size;
        setStats({ totalDonors: uniqueDonors, totalRaised, causesSupported: causesRes.value?.length || 7 });
        const seen = new Set();
        const recent = donations.filter(d => { if (d.anonymous || seen.has(d.userId)) return false; seen.add(d.userId); return true; }).slice(0, 8);
        setDonors(recent);
      }
    }).finally(() => setLoading(false));
  }, []);

  const source = causesList.length > 0 ? causesList : DEMO_CAUSES;
  const filtered = activeCategory === 'All' ? source : source.filter(c => c.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <main className="home-page">
      <section className="hero-section" style={{ backgroundImage: `url(${content.hero?.bgImage || DEFAULT_CONTENT.hero.bgImage})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-label">Aneesha Joy Foundation</p>
          <h1 className="hero-title">{content.hero?.headline || DEFAULT_CONTENT.hero.headline}</h1>
          <p className="hero-sub">{content.hero?.subheadline || DEFAULT_CONTENT.hero.subheadline}</p>
          <div className="hero-ctas">
            <Link to="/causes" className="btn-primary">{content.hero?.ctaText || 'Start Donating'} <ArrowRight size={16} /></Link>
            <Link to="/about" className="btn-hero-outline">Learn More</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span className="stat-num">₹{(stats.totalRaised / 1000).toFixed(0)}K+</span><span className="stat-label">Raised</span></div>
            <div className="stat-divider" />
            <div className="hero-stat"><span className="stat-num">{stats.totalDonors}+</span><span className="stat-label">Donors</span></div>
            <div className="stat-divider" />
            <div className="hero-stat"><span className="stat-num">{stats.causesSupported || 7}+</span><span className="stat-label">Causes</span></div>
          </div>
        </div>
        <a href="#causes-section" className="scroll-hint"><ChevronDown size={22} /></a>
      </section>

      <section id="causes-section" className="causes-section">
        <div className="container">
          <div className="section-head">
            <p className="section-label">Make an Impact</p>
            <h2 className="section-title">{content.causesSection?.title || 'Choose a Cause to Support'}</h2>
            <p className="section-subtitle">{content.causesSection?.subtitle || 'From food to education, every contribution creates lasting change.'}</p>
          </div>
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
          {loading ? (
            <div className="causes-grid">{[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
          ) : (
            <div className="causes-grid">
              {filtered.map(cause => <CauseCard key={cause.id} cause={cause} />)}
            </div>
          )}
        </div>
      </section>

      <section className="transparency-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">Why Trust Us</p>
            <h2 className="section-title">{content.transparency?.title || DEFAULT_CONTENT.transparency.title}</h2>
            <p className="section-subtitle">{content.transparency?.subtitle || DEFAULT_CONTENT.transparency.subtitle}</p>
          </div>
          <div className="transparency-grid">
            <div className="trans-card"><div className="trans-icon donor-icon"><Users size={28} /></div><h3>Donor Recognition</h3><p>Every donation is acknowledged with the donor's name, creating a transparent record.</p></div>
            <div className="trans-card featured"><div className="trans-icon photo-icon"><Camera size={28} /></div><h3>Photo Documentation</h3><p>Every donor's contribution is backed with photo proof of the real impact.</p></div>
            <div className="trans-card"><div className="trans-icon video-icon"><Video size={28} /></div><h3>Video Documentation</h3><p>Transparency shown through video, highlighting the real difference your support makes.</p></div>
          </div>
        </div>
      </section>

      {donors.length > 0 && (
        <section className="donors-strip">
          <div className="container">
            <p className="section-label" style={{ textAlign: 'center' }}>Our Generous Donors</p>
            <div className="donors-row">
              {donors.map((d, i) => (
                <div key={i} className="donor-chip">
                  <img src={d.userPhoto || '/default-avatar.png'} alt={d.userName} />
                  <div><strong>{d.userName}</strong><span>₹{d.amount}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="volunteer-section">
        <div className="container volunteer-inner">
          <div className="volunteer-text">
            <p className="section-label">Get Involved</p>
            <h2 className="section-title">{content.volunteer?.title || DEFAULT_CONTENT.volunteer.title}</h2>
            <p className="section-subtitle">{content.volunteer?.subtitle || DEFAULT_CONTENT.volunteer.subtitle}</p>
            <ul className="volunteer-perks">
              <li><CheckCircle size={16} color="var(--primary)" /> Make a real, visible difference</li>
              <li><CheckCircle size={16} color="var(--primary)" /> Certificate of appreciation</li>
              <li><CheckCircle size={16} color="var(--primary)" /> Community of like-minded individuals</li>
              <li><CheckCircle size={16} color="var(--primary)" /> Flexible commitment, any skill set welcome</li>
            </ul>
            <Link to="/volunteer" className="btn-primary">{content.volunteer?.ctaText || 'Join as Volunteer'} <ArrowRight size={16} /></Link>
          </div>
          <div className="volunteer-image">
            <img src={content.volunteer?.image || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=700&q=80'} alt="Volunteers" />
          </div>
        </div>
      </section>

      <section className="home-contact-section">
        <div className="container home-contact-inner">
          <div>
            <h2 className="section-title" style={{ color: 'white' }}>Ready to Make a Difference?</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>Reach out to us. Every question, every idea, and every offer of help matters.</p>
          </div>
          <div className="contact-ctas">
            <Link to="/contact" className="btn-white">Contact Us</Link>
            <Link to="/causes" className="btn-outline-white">Donate Now</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
