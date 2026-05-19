const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /payments/order — create Razorpay order (called before opening checkout)
router.post('/order', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /payments/verify — verify signature after payment
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature,
            cause_id, cause_title, amount, anonymous } = req.body;

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Save donation to DB
    const { rows } = await db.query(`
      INSERT INTO donations (user_id, user_name, user_email, cause_id, cause_title, amount,
        payment_id, razorpay_order_id, status, anonymous)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'success',$9) RETURNING *
    `, [req.user.id, anonymous ? 'Anonymous' : req.user.name, req.user.email,
        cause_id || null, cause_title, amount, razorpay_payment_id, razorpay_order_id,
        anonymous || false]);

    // Update user total donated
    await db.query('UPDATE users SET total_donated = total_donated + $1 WHERE id = $2', [amount, req.user.id]);

    // Update cause raised amount if cause_id provided
    if (cause_id) {
      await db.query('UPDATE causes SET raised = raised + $1 WHERE id = $2', [amount, cause_id]);
    }

    res.json({ success: true, donation: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /payments/donations — admin: all donations
router.get('/donations', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT d.*, u.photo as user_photo FROM donations d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /payments/my-donations — user's own donations
router.get('/my-donations', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM donations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
