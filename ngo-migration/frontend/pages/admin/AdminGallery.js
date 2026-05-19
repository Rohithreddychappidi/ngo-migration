import React, { useState, useEffect } from 'react';
import { gallery as galleryApi } from '../../services/api';
import AdminLayout from './AdminLayout';
import { Plus, Trash2, X, Upload } from 'lucide-react';

const SECTIONS = ['Food', 'Birthday', 'Environment', 'Animals', 'Education', 'Orphanage', 'Healthcare', 'Volunteers', 'General'];

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ imageUrl: '', title: '', category: 'General' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchPhotos(); }, []);

  async function fetchPhotos() {
    try { setPhotos(await galleryApi.getAll()); } catch {}
  }

  function handleFileChange(e) {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('title', form.title);
      fd.append('category', form.category);
      if (!file && form.imageUrl) fd.append('image_url', form.imageUrl);
      await galleryApi.upload(fd);
      await fetchPhotos();
      setShowModal(false);
      setForm({ imageUrl: '', title: '', category: 'General' });
      setFile(null);
      setPreview(null);
    } catch (err) { alert('Upload failed: ' + err.message); }
    setUploading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this photo?')) return;
    await galleryApi.remove(id);
    fetchPhotos();
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h1>Gallery Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Photo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'white' }}>
            <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title || 'No caption'}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>{photo.category}</div>
            </div>
            <button onClick={() => handleDelete(photo.id)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(231,76,60,0.9)', color: 'white', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {photos.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)' }}>No photos yet. Click "Add Photo" to get started.</div>}
      </div>

      {showModal && (
        <div className="modal-form-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-form-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface-alt)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            <h2>Add Photo</h2>
            <form onSubmit={handleAdd}>
              <div className="form-field">
                <label>Upload Image from Device</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ padding: '8px 12px' }} />
                {preview && <img src={preview} alt="preview" style={{ marginTop: 8, width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }} />}
              </div>
              <div className="form-field">
                <label>— OR — Paste Image URL</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." disabled={!!file} />
              </div>
              <div className="form-field"><label>Caption / Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Photo caption" /></div>
              <div className="form-field"><label>Section</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{SECTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="modal-form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={uploading || (!file && !form.imageUrl)}><Upload size={14} /> {uploading ? 'Uploading...' : 'Add Photo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
