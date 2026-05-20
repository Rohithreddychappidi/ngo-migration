const express = require('express');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload, getFileUrl } = require('../middleware/upload');

// ─── Volunteers ───────────────────────────────────────────────────────────────
const volunteersRouter = express.Router();

volunteersRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, skills, message } = req.body;
    const { rows } = await db.query(
      'INSERT INTO volunteers (user_id, name, email, phone, skills, message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, name, email, phone, skills, message]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

volunteersRouter.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM volunteers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

volunteersRouter.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { rows } = await db.query(
      'UPDATE volunteers SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Contacts ─────────────────────────────────────────────────────────────────
const contactsRouter = express.Router();

contactsRouter.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const { rows } = await db.query(
      'INSERT INTO contacts (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, subject, message]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

contactsRouter.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

contactsRouter.put('/:id/read', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE contacts SET read=TRUE WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

contactsRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM contacts WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Users ────────────────────────────────────────────────────────────────────
const usersRouter = express.Router();

usersRouter.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, photo, role, total_donated, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

usersRouter.put('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const { rows } = await db.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING *',
      [role, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CMS ──────────────────────────────────────────────────────────────────────
const cmsRouter = express.Router();

// GET all fields for a page
cmsRouter.get('/:pageKey', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT field_key, value FROM cms_content WHERE page_key=$1',
      [req.params.pageKey]
    );
    const result = {};
    rows.forEach(r => { result[r.field_key] = r.value; });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST save fields for a page (flat key-value pairs)
cmsRouter.post('/:pageKey', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { pageKey } = req.params;
    const fields = req.body;
    for (const [field_key, value] of Object.entries(fields)) {
      await db.query(`
        INSERT INTO cms_content (page_key, field_key, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (page_key, field_key)
        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `, [pageKey, field_key, value ?? '']);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST upload image for CMS use
cmsRouter.post('/upload/image', requireAuth, requireAdmin,
  (req, res, next) => { req.uploadFolder = 'cms'; next(); },
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const url = getFileUrl(req, `uploads/cms/${req.file.filename}`);
      res.json({ url });
    } catch (err) { res.status(500).json({ error: err.message }); }
  }
);

// ─── Donation Plans ───────────────────────────────────────────────────────────
const plansRouter = express.Router();

plansRouter.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM donation_plans ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

plansRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, amount, perks, featured, sort_order } = req.body;
    const { rows } = await db.query(
      'INSERT INTO donation_plans (name, amount, perks, featured, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, amount, perks, featured || false, sort_order || 99]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

plansRouter.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, amount, perks, featured, sort_order } = req.body;
    const { rows } = await db.query(
      'UPDATE donation_plans SET name=$1, amount=$2, perks=$3, featured=$4, sort_order=$5 WHERE id=$6 RETURNING *',
      [name, amount, perks, featured, sort_order, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

plansRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM donation_plans WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = { volunteersRouter, contactsRouter, usersRouter, cmsRouter, plansRouter };