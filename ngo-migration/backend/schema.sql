-- ─────────────────────────────────────────────────────────────
-- NGO Website — NeonDB PostgreSQL Schema
-- Run this in your NeonDB SQL editorpostgresql://neondb_owner:npg_20BmTVLKzQeP@ep-lingering-wave-apn4y4sz-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
-- ─────────────────────────────────────────────────────────────

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id   VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255),
  email       VARCHAR(255) UNIQUE NOT NULL,
  photo       TEXT,
  role        VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  total_donated NUMERIC(10,2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Causes
CREATE TABLE IF NOT EXISTS causes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(100),
  image_url   TEXT,
  amount      NUMERIC(10,2),
  unit        VARCHAR(100),
  raised      NUMERIC(10,2) DEFAULT 0,
  goal        NUMERIC(10,2),
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) UNIQUE,
  content     TEXT,
  excerpt     TEXT,
  cover_url   TEXT,
  author_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  published   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255),
  image_url   TEXT NOT NULL,
  category    VARCHAR(100),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Donations
CREATE TABLE IF NOT EXISTS donations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name       VARCHAR(255),
  user_email      VARCHAR(255),
  cause_id        UUID REFERENCES causes(id) ON DELETE SET NULL,
  cause_title     VARCHAR(255),
  amount          NUMERIC(10,2) NOT NULL,
  payment_id      VARCHAR(255),
  razorpay_order_id VARCHAR(255),
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  anonymous       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Donation Plans
CREATE TABLE IF NOT EXISTS donation_plans (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(255) NOT NULL,
  amount    NUMERIC(10,2) NOT NULL,
  perks     TEXT[],
  featured  BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteers
CREATE TABLE IF NOT EXISTS volunteers (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  name      VARCHAR(255) NOT NULL,
  email     VARCHAR(255) NOT NULL,
  phone     VARCHAR(20),
  skills    TEXT,
  message   TEXT,
  status    VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contacts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(255) NOT NULL,
  email     VARCHAR(255) NOT NULL,
  subject   VARCHAR(255),
  message   TEXT NOT NULL,
  read      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CMS Content (key-value store per page)
CREATE TABLE IF NOT EXISTS cms_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key   VARCHAR(100) NOT NULL,
  field_key  VARCHAR(255) NOT NULL,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_key, field_key)
);

-- Seed default donation plans
INSERT INTO donation_plans (name, amount, perks, featured, sort_order) VALUES
  ('Supporter', 200,  ARRAY['Feed 1 family', 'Digital thank-you card', 'Monthly impact report'], FALSE, 1),
  ('Champion',  500,  ARRAY['Feed 3 families', 'Featured donor badge', 'Impact certificate'],    TRUE,  2),
  ('Guardian',  1000, ARRAY['Education kit for 3 children', 'Priority event invites', 'Guardian certificate'], FALSE, 3),
  ('Patron',    2500, ARRAY['Sponsor an orphanage child', 'Annual impact report', 'Personal thank-you call'], FALSE, 4)
ON CONFLICT DO NOTHING;
