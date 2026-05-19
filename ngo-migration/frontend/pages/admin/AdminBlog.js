// ─── AdminBlog.js ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { blog as blogApi } from '../../services/api';
import AdminLayout from './AdminLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = ['Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare', 'General', 'Volunteers'];
const EMPTY = { title: '', category: 'General', authorName: '', excerpt: '', content: '', coverUrl: '', published: true };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    try { setPosts(await blogApi.getAllAdmin()); } catch {}
  }

  function openAdd() { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(p) { setEditing(p); setForm({ ...p }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (editing) await blogApi.update(editing.id, fd);
      else await blogApi.create(fd);
      await fetchPosts();
      setShowModal(false);
    } catch (err) { alert('Error: ' + err.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post?')) return;
    await blogApi.remove(id);
    fetchPosts();
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Blog Management</h1>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> New Post</button>
      </div>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>Cover</th><th>Title</th><th>Category</th><th>Author</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>No blog posts yet.</td></tr>
            ) : posts.map(p => (
              <tr key={p.id}>
                <td>{p.coverUrl ? <img src={p.coverUrl} alt="" style={{ width: 60, height: 42, objectFit: 'cover', borderRadius: 6 }} /> : '—'}</td>
                <td><strong style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</strong></td>
                <td>{p.category}</td>
                <td>{p.authorName}</td>
                <td>{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yy') : '—'}</td>
                <td><span className={`status-badge ${p.published ? 'status-success' : 'status-pending'}`}>{p.published ? 'Published' : 'Draft'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openEdit(p)} style={{ padding: '5px 10px', borderRadius: 6, background: 'var(--surface-alt)', border: '1px solid var(--border)', cursor: 'pointer' }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', cursor: 'pointer', color: '#e74c3c' }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-form-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-form-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface-alt)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            <h2>{editing ? 'Edit Post' : 'New Blog Post'}</h2>
            <form onSubmit={handleSave}>
              <div className="form-field"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Post title" required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-field"><label>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-field"><label>Author</label><input value={form.authorName || ''} onChange={e => setForm({ ...form, authorName: e.target.value })} placeholder="Author name" /></div>
              </div>
              <div className="form-field"><label>Cover Image URL</label><input value={form.coverUrl || ''} onChange={e => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://..." /></div>
              <div className="form-field"><label>Excerpt</label><textarea value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} placeholder="Brief summary" /></div>
              <div className="form-field"><label>Content (HTML supported)</label><textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} placeholder="<p>Write your post here...</p>" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} /></div>
              <div className="form-field"><label>Status</label><select value={form.published ? 'published' : 'draft'} onChange={e => setForm({ ...form, published: e.target.value === 'published' })}><option value="published">Published</option><option value="draft">Draft</option></select></div>
              <div className="modal-form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Post' : 'Publish Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
