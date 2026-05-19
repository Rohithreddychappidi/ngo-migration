import React, { useState, useEffect } from 'react';
import { gallery as galleryApi, cms } from '../services/api';
import { X } from 'lucide-react';
import './Gallery.css';

const DEMO_GALLERY = [
  { id: 'g1', imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80', title: 'Food Drive 2024', category: 'Food' },
  { id: 'g2', imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80', title: 'Birthday Celebrations', category: 'Birthday' },
  { id: 'g3', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80', title: 'Education Drive', category: 'Education' },
  { id: 'g4', imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80', title: 'Tree Plantation', category: 'Environment' },
  { id: 'g5', imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80', title: 'Animal Shelter Visit', category: 'Animals' },
  { id: 'g6', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80', title: 'Medical Camp', category: 'Healthcare' },
  { id: 'g7', imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', title: 'Volunteer Gathering', category: 'Volunteers' },
  { id: 'g8', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', title: 'Diwali Food Packages', category: 'Food' },
];

export default function GalleryPage() {
  const [photos, setPhotos] = useState([]);
  const [sections, setSections] = useState(['All']);
  const [activeSection, setActiveSection] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [pageInfo, setPageInfo] = useState({ title: 'Our Gallery', subtitle: 'Moments of impact, stories of change.' });

  useEffect(() => {
    galleryApi.getAll().then(data => { if (data.length) setPhotos(data); }).catch(() => {});
    cms.get('gallery').then(data => { if (data) setPageInfo(data); }).catch(() => {});
  }, []);

  const source = photos.length > 0 ? photos : DEMO_GALLERY;

  useEffect(() => {
    const s = ['All', ...new Set(source.map(p => p.category).filter(Boolean))];
    setSections(s);
  }, [source.length]);

  const filtered = activeSection === 'All' ? source : source.filter(p => p.category === activeSection);

  return (
    <main className="gallery-page">
      <div className="gallery-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Our Moments</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>{pageInfo.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>{pageInfo.subtitle}</p>
        </div>
      </div>

      <section className="gallery-content">
        <div className="container">
          <div className="category-tabs">
            {sections.map(sec => (
              <button key={sec} className={`cat-tab ${activeSection === sec ? 'active' : ''}`} onClick={() => setActiveSection(sec)}>{sec}</button>
            ))}
          </div>
          <div className="gallery-grid">
            {filtered.map(photo => (
              <div key={photo.id} className="gallery-item" onClick={() => setLightbox(photo)}>
                <img src={photo.imageUrl} alt={photo.title || ''} loading="lazy" />
                {photo.title && <div className="gallery-caption"><span>{photo.title}</span></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}><X size={24} /></button>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.imageUrl} alt={lightbox.title} />
            {lightbox.title && <p className="lightbox-caption">{lightbox.title}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
