-- Users (auth + profile)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  stripe_customer_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS membership_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_usd REAL NOT NULL,
  features TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Boshqa',
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  region TEXT,
  latitude REAL,
  longitude REAL,
  is_vip INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Forum',
  location TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT,
  price_usd REAL NOT NULL DEFAULT 0,
  spots_total INTEGER NOT NULL DEFAULT 100,
  spots_remaining INTEGER NOT NULL DEFAULT 100,
  image_url TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- News posts (created by users, approved by admins)
CREATE TABLE IF NOT EXISTS news_posts (
  id TEXT PRIMARY KEY,
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Boshqa',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected
  is_featured INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  approved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_status TEXT NOT NULL DEFAULT 'free',
  order_id TEXT,
  amount_paid REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  items TEXT NOT NULL DEFAULT '[]',
  total_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  metadata TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS business_submissions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  industry TEXT,
  dba_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_at TEXT,
  reviewed_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_pm_id TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'card',
  last4 TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hero_leads (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'hero_form',
  unsubscribed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  target_source TEXT NOT NULL DEFAULT 'all',
  sent_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_opens (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES hero_leads(id) ON DELETE CASCADE,
  opened_at TEXT NOT NULL,
  UNIQUE(campaign_id, lead_id)
);

CREATE TABLE IF NOT EXISTS campaign_clicks (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id TEXT NOT NULL REFERENCES hero_leads(id) ON DELETE CASCADE,
  clicked_at TEXT NOT NULL,
  UNIQUE(campaign_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
