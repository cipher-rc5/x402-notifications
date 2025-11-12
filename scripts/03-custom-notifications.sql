-- Custom notification configurations
CREATE TABLE IF NOT EXISTS custom_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  mcp_session_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (mcp_session_id) REFERENCES mcp_sessions(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_custom_notifications_user_id ON custom_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_notifications_active ON custom_notifications(is_active);
