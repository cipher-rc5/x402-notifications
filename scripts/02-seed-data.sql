-- Seed test user
INSERT OR IGNORE INTO users (id, email, phone, preferences, wallet_address) VALUES 
  ('test-user-1', 'c0217636@gmail.com', '+15005550006', 
   '{"email": true, "sms": false, "push": true, "in_app": true}',
   '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

-- Seed sample notifications
INSERT OR IGNORE INTO notifications (id, user_id, type, title, message, channel, status, created_at) VALUES
  ('notif-1', 'test-user-1', 'notification_system', 'Welcome', 'Welcome to the x402 Notification System', 'email', 'delivered', unixepoch() - 86400),
  ('notif-2', 'test-user-1', 'notification_system', 'Payment Received', 'Your payment of $0.01 was confirmed', 'in_app', 'read', unixepoch() - 3600),
  ('notif-3', 'test-user-1', 'notification_system', 'System Update', 'New features available in your dashboard', 'email', 'sent', unixepoch() - 1800);
