/**
 * MCP (Model Context Protocol) Server for Notification System
 * Allows AI assistants to interface with the notification system
 */
import { getUserNotifications, sendNotification } from './notification-service';
import { turso } from './turso';
import { getPaymentHistory, getTotalSpent } from './x402-payment-handler';

export interface MCPRequest {
  method: string;
  params?: Record<string, any>;
  sessionToken?: string;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

/**
 * Validate MCP session token
 */
async function validateSession(token: string): Promise<string | null> {
  try {
    const result = await turso.execute({ sql: 'SELECT user_id, expires_at FROM mcp_sessions WHERE session_token = ?', args: [token] });

    if (result.rows.length === 0) {
      return null;
    }

    const session = result.rows[0];
    const expiresAt = session.expires_at as number;

    if (expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return session.user_id as string;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Create new MCP session
 */
export async function createMCPSession(userId: string): Promise<string> {
  const sessionId = `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const sessionToken = `tok-${Math.random().toString(36).substr(2, 32)}`;
  const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours

  await turso.execute({
    sql: `INSERT INTO mcp_sessions (id, user_id, session_token, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [sessionId, userId, sessionToken, expiresAt, Math.floor(Date.now() / 1000)]
  });

  return sessionToken;
}

/**
 * Main MCP request handler
 */
export async function handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    // Validate session for protected methods
    if (request.method !== 'createSession' && request.sessionToken) {
      const userId = await validateSession(request.sessionToken);
      if (!userId) {
        return { success: false, error: 'Invalid or expired session token', timestamp };
      }
      // Attach userId to params for method handlers
      request.params = { ...request.params, userId };
    }

    // Route to appropriate handler
    switch (request.method) {
      case 'createSession':
        return await handleCreateSession(request.params!);

      case 'sendNotification':
        return await handleSendNotification(request.params!);

      case 'getNotifications':
        return await handleGetNotifications(request.params!);

      case 'markNotificationRead':
        return await handleMarkRead(request.params!);

      case 'getPaymentHistory':
        return await handleGetPayments(request.params!);

      case 'getTotalSpent':
        return await handleGetTotalSpent(request.params!);

      case 'getUser':
        return await handleGetUser(request.params!);

      default:
        return { success: false, error: `Unknown method: ${request.method}`, timestamp };
    }
  } catch (error) {
    console.error('MCP request error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Internal server error', timestamp };
  }
}

// Method Handlers

async function handleCreateSession(params: Record<string, any>): Promise<MCPResponse> {
  const { userId } = params;
  if (!userId) {
    return { success: false, error: 'userId is required', timestamp: Date.now() };
  }

  const token = await createMCPSession(userId);
  return { success: true, data: { sessionToken: token, expiresIn: 86400 }, timestamp: Math.floor(Date.now() / 1000) };
}

async function handleSendNotification(params: Record<string, any>): Promise<MCPResponse> {
  const { userId, email, subject, message, type } = params;

  const result = await sendNotification({ userId, email, subject, message, type });

  return { success: true, data: result, timestamp: Math.floor(Date.now() / 1000) };
}

async function handleGetNotifications(params: Record<string, any>): Promise<MCPResponse> {
  const { userId } = params;
  const notifications = await getUserNotifications(userId);

  return { success: true, data: { notifications, count: notifications.length }, timestamp: Math.floor(Date.now() / 1000) };
}

async function handleMarkRead(params: Record<string, any>): Promise<MCPResponse> {
  const { notificationId } = params;

  await turso.execute({
    sql: `UPDATE notifications
          SET status = 'read', read_at = ?, updated_at = ?
          WHERE id = ?`,
    args: [Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), notificationId]
  });

  return { success: true, data: { notificationId }, timestamp: Math.floor(Date.now() / 1000) };
}

async function handleGetPayments(params: Record<string, any>): Promise<MCPResponse> {
  const { userId } = params;
  const payments = await getPaymentHistory(userId);

  return { success: true, data: { payments, count: payments.length }, timestamp: Math.floor(Date.now() / 1000) };
}

async function handleGetTotalSpent(params: Record<string, any>): Promise<MCPResponse> {
  const { userId } = params;
  const total = await getTotalSpent(userId);

  return { success: true, data: { totalSpent: total, currency: 'USDC' }, timestamp: Math.floor(Date.now() / 1000) };
}

async function handleGetUser(params: Record<string, any>): Promise<MCPResponse> {
  const { userId } = params;

  const result = await turso.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });

  if (result.rows.length === 0) {
    return { success: false, error: 'User not found', timestamp: Math.floor(Date.now() / 1000) };
  }

  return { success: true, data: { user: result.rows[0] }, timestamp: Math.floor(Date.now() / 1000) };
}
