import { handleMCPRequest, type MCPRequest } from '@/lib/mcp-server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * MCP API Endpoint
 * POST /api/mcp
 *
 * Handles Model Context Protocol requests from AI assistants
 *
 * Example request:
 * {
 *   "method": "sendNotification",
 *   "params": {
 *     "userId": "user-123",
 *     "email": "user@example.com",
 *     "subject": "Test",
 *     "message": "Hello from MCP"
 *   },
 *   "sessionToken": "tok-xxxxx"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MCPRequest;

    if (!body.method) {
      return NextResponse.json({ success: false, error: 'method is required' }, { status: 400 });
    }

    const response = await handleMCPRequest(body);

    return NextResponse.json(response, { status: response.success ? 200 : 400 });
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process MCP request', timestamp: Math.floor(Date.now() / 1000) }, {
      status: 500
    });
  }
}

// GET endpoint for MCP service info
export async function GET() {
  return NextResponse.json({
    service: 'x402 Notification System MCP Server',
    version: '1.0.0',
    methods: [
      'createSession',
      'sendNotification',
      'getNotifications',
      'markNotificationRead',
      'getPaymentHistory',
      'getTotalSpent',
      'getUser'
    ],
    documentation: '/api/mcp/docs'
  });
}
