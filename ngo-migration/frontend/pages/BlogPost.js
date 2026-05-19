// ─── BlogPost.js ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blog as blogApi } from '../services/api';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import './BlogPost.css';

const DEMO_POST = {
  title: 'How We Fed 500 Families This Diwali', category: 'Food', authorName: 'Aneesha Joy',
  createdAt: '2024-10-28T10:00:00Z',
  coverUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80',
  content: `<p>This Diwali, Aneesha Joy Foundation undertook its most ambitious food drive yet — reaching over 500 families across Visakhapatnam's underserved neighborhoods.</p><h2>The Preparation</h2><p>Three weeks before Diwali, our team of 40 volunteers began collecting donations and preparing food packages.</p><h2>Impact</h2><p>By 4 PM, every package had been distributed. Your generosity lit up more than just homes this Diwali.</p>`
};

export function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getOne(id)
      .then(data => setPost(data))
      .catch(() => setPost(DEMO_POST))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="post-loading">Loading...</div>;
  if (!post) return <div className="post-loading">Post not found.</div>;

  return (
    <main className="blog-post-page">
      <div className="post-hero" style={{ backgroundImage: `url(${post.coverUrl})` }}>
        <div className="post-hero-overlay" />
        <div className="container post-hero-content">
          <Link to="/blog" className="back-link"><ArrowLeft size={16} /> Back to Blog</Link>
          <span className="blog-cat-badge" style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}>{post.category}</span>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span><User size={14} /> {post.authorName}</span>
            <span><Calendar size={14} /> {post.createdAt ? format(new Date(post.createdAt), 'MMMM d, yyyy') : ''}</span>
          </div>
        </div>
      </div>
      <div className="container post-body">
        <article className="post-content" dangerouslySetInnerHTML={{ __html: post.content || '<p>' + (post.excerpt || '') + '</p>' }} />
      </div>
    </main>
  );
}

export default BlogPostPage;
