import React, { useState, useEffect } from 'react';
import { blog as blogApi } from '../services/api';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import './Blog.css';

const DEMO_POSTS = [
  { id: 'b1', title: 'How We Fed 500 Families This Diwali', category: 'Food', authorName: 'Aneesha Joy', createdAt: '2024-10-28T10:00:00Z', excerpt: 'This Diwali, we distributed food packages to over 500 families across Visakhapatnam.', coverUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80' },
  { id: 'b2', title: 'Education Drive: 200 Children Get School Supplies', category: 'Education', authorName: 'Aneesha Joy', createdAt: '2024-10-15T10:00:00Z', excerpt: 'In partnership with local schools, we distributed books, stationery and bags to 200 deserving students.', coverUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80' },
  { id: 'b3', title: 'Tree Plantation: 1000 Saplings Planted in One Day', category: 'Environment', authorName: 'Team AJF', createdAt: '2024-09-20T10:00:00Z', excerpt: '50 volunteers came together to plant 1000 indigenous saplings across the city.', coverUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80' },
  { id: 'b4', title: 'Birthday Smiles at Sunshine Orphanage', category: 'Orphanage', authorName: 'Aneesha Joy', createdAt: '2024-09-05T10:00:00Z', excerpt: 'We celebrated 12 birthdays at Sunshine Orphanage this month!', coverUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80' },
  { id: 'b5', title: 'Free Medical Camp Serves 300 Patients', category: 'Healthcare', authorName: 'Team AJF', createdAt: '2024-08-18T10:00:00Z', excerpt: 'Our free medical camp saw over 300 patients receive consultations and medicines at no cost.', coverUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80' },
  { id: 'b6', title: 'Stray Animal Rescue: A Week of Compassion', category: 'Animals', authorName: 'Aneesha Joy', createdAt: '2024-08-01T10:00:00Z', excerpt: 'Our volunteer team rescued and rehabilitated 15 injured stray animals in a week-long drive.', coverUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80' },
];

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getAll()
      .then(data => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const source = posts.length > 0 ? posts : DEMO_POSTS;
  const filtered = source.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <p className="section-label" style={{ color: 'var(--accent-light)' }}>Stories & Updates</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.2rem)', color: 'white', marginBottom: 12 }}>Our Blog</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Impact stories, volunteer highlights, and field updates from the ground.</p>
        </div>
      </div>

      <section className="blog-content">
        <div className="container">
          <div className="blog-search-bar">
            <Search size={18} color="var(--text-light)" />
            <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="blog-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" style={{ height: 300, borderRadius: 16 }} />)}</div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '60px 0' }}>No posts found.</p>
          ) : (
            <>
              {featured && (
                <Link to={`/blog/${featured.id}`} className="blog-featured">
                  <div className="featured-img-wrap">
                    <img src={featured.coverUrl} alt={featured.title} />
                    <span className="blog-cat-badge">{featured.category}</span>
                  </div>
                  <div className="featured-text">
                    <p className="section-label">Featured Story</p>
                    <h2>{featured.title}</h2>
                    <p className="blog-excerpt">{featured.excerpt}</p>
                    <div className="blog-meta">
                      <span><User size={13} /> {featured.authorName}</span>
                      <span><Calendar size={13} /> {featured.createdAt ? format(new Date(featured.createdAt), 'MMM d, yyyy') : ''}</span>
                    </div>
                    <span className="read-more">Read Story <ArrowRight size={14} /></span>
                  </div>
                </Link>
              )}
              <div className="blog-grid">
                {rest.map(post => (
                  <Link to={`/blog/${post.id}`} key={post.id} className="blog-card">
                    <div className="blog-card-img">
                      <img src={post.coverUrl} alt={post.title} />
                      <span className="blog-cat-badge">{post.category}</span>
                    </div>
                    <div className="blog-card-body">
                      <h3>{post.title}</h3>
                      <p className="blog-excerpt">{post.excerpt}</p>
                      <div className="blog-meta">
                        <span><User size={12} /> {post.authorName}</span>
                        <span><Calendar size={12} /> {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : ''}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
