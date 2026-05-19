const express = require('express');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');

const router = express.Router();

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// GET /blog — public (published only)
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM blog_posts WHERE published = TRUE ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /blog/all — admin (all posts)
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /blog/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM blog_posts WHERE id = $1 OR slug = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /blog — admin
router.post('/', requireAuth, requireAdmin, (req, res, next) => {
  req.uploadFolder = 'blog'; next();
}, upload.single('cover'), async (req, res) => {
  try {
    const { title, content, excerpt, published } = req.body;
    const slug = slugify(title) + '-' + Date.now();
    const coverUrl = req.file ? getFileUrl(req, `uploads/blog/${req.file.filename}`) : req.body.cover_url || null;
    const { rows } = await db.query(`
      INSERT INTO blog_posts (title, slug, content, excerpt, cover_url, author_id, author_name, published)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [title, slug, content, excerpt, coverUrl, req.user.id, req.user.name, published === 'true']);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /blog/:id — admin
router.put('/:id', requireAuth, requireAdmin, (req, res, next) => {
  req.uploadFolder = 'blog'; next();
}, upload.single('cover'), async (req, res) => {
  try {
    const { title, content, excerpt, published } = req.body;
    const coverUrl = req.file ? getFileUrl(req, `uploads/blog/${req.file.filename}`) : req.body.cover_url || null;
    const { rows } = await db.query(`
      UPDATE blog_posts SET title=$1, content=$2, excerpt=$3,
        cover_url=COALESCE($4,cover_url), published=$5, updated_at=NOW()
      WHERE id=$6 RETURNING *
    `, [title, content, excerpt, coverUrl, published === 'true', req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /blog/:id — admin
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
