const express = require('express');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');

const router = express.Router();

// GET /causes — public
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM causes WHERE active = TRUE ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /causes/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM causes WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /causes — admin only
router.post('/', requireAuth, requireAdmin, (req, res, next) => {
  req.uploadFolder = 'causes'; next();
}, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, amount, unit, goal } = req.body;
    const imageUrl = req.file ? getFileUrl(req, `uploads/causes/${req.file.filename}`) : req.body.image_url || null;
    const { rows } = await db.query(`
      INSERT INTO causes (title, description, category, image_url, amount, unit, goal)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [title, description, category, imageUrl, amount, unit, goal]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /causes/:id — admin only
router.put('/:id', requireAuth, requireAdmin, (req, res, next) => {
  req.uploadFolder = 'causes'; next();
}, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, amount, unit, goal, active } = req.body;
    const imageUrl = req.file ? getFileUrl(req, `uploads/causes/${req.file.filename}`) : req.body.image_url || null;
    const { rows } = await db.query(`
      UPDATE causes SET title=$1, description=$2, category=$3, image_url=COALESCE($4,image_url),
        amount=$5, unit=$6, goal=$7, active=$8 WHERE id=$9 RETURNING *
    `, [title, description, category, imageUrl, amount, unit, goal, active !== 'false', req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /causes/:id — admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM causes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
