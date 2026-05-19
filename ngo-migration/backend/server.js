require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Rate limiting
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));
app.use('/api/contacts', rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }));
app.use('/api/payments', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

// ─── Static Files (uploaded images) ──────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const causesRoutes = require('./routes/causes');
const blogRoutes = require('./routes/blog');
const galleryRoutes = require('./routes/gallery');
const paymentsRoutes = require('./routes/payments');
const { volunteersRouter, contactsRouter, usersRouter, cmsRouter, plansRouter } = require('./routes/misc');

app.use('/auth', authRoutes);
app.use('/api/causes', causesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);
app.use('/api/cms', cmsRouter);
app.use('/api/donation-plans', plansRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large' });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
