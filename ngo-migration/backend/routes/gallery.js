// ─── gallery.js ──────────────────────────────────────────────────────────────
const express = require('express');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', requireAuth, requireAdmin, (req, res, next) => {
  req.uploadFolder = 'gallery'; next();
}, upload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;
    const imageUrl = req.file ? getFileUrl(req, `uploads/gallery/${req.file.filename}`) : req.body.image_url;
    const { rows } = await db.query(
      'INSERT INTO gallery (title, image_url, category, uploaded_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, imageUrl, category, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM gallery WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
