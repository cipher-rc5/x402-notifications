-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  billing_period TEXT NOT NULL CHECK(billing_period IN ('monthly', 'yearly')),
  notification_limit INTEGER, -- NULL means unlimited
  features TEXT, -- JSON string for plan features
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  notifications_used INTEGER DEFAULT 0,
  auto_renew INTEGER DEFAULT 1, -- boolean (0 or 1)
  payment_id TEXT, -- reference to initial payment
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Pricing model preferences (user can choose pay-per-use or subscription)
CREATE TABLE IF NOT EXISTS user_pricing_preferences (
  user_id TEXT PRIMARY KEY,
  pricing_model TEXT NOT NULL CHECK(pricing_model IN ('pay-per-use', 'subscription')),
  per_notification_price REAL DEFAULT 0.99, -- customizable per-notification price for pay-per-use
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notification usage tracking for pay-per-use model
CREATE TABLE IF NOT EXISTS notification_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  notification_id TEXT NOT NULL,
  payment_id TEXT, -- reference to payment if pay-per-use
  charged_amount REAL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_notification_usage_user_id ON notification_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pricing_preferences_user_id ON user_pricing_preferences(user_id);

-- Insert default subscription plans
INSERT OR IGNORE INTO subscription_plans (id, name, description, price, billing_period, notification_limit, features)
VALUES
  ('plan-free', 'Free', 'Basic notification system', 0, 'monthly', 100, '["100 notifications/month", "Email notifications", "Basic MCP integration"]'),
  ('plan-starter', 'Starter', 'For individual developers', 9.99, 'monthly', 1000, '["1,000 notifications/month", "Email + SMS", "Full MCP integration", "API access"]'),
  ('plan-pro', 'Pro', 'For growing teams', 29.99, 'monthly', 10000, '["10,000 notifications/month", "All channels", "Priority support", "Custom conditions", "Webhooks"]'),
  ('plan-unlimited', 'Unlimited', 'No limits for enterprises', 99.99, 'monthly', NULL, '["Unlimited notifications", "All channels", "24/7 support", "Custom integrations", "SLA guarantee"]');
