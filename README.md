# x402 Notification System

A futuristic notification system with blockchain payments via x402 protocol, supporting both Solana and EVM testnets, integrated with NotificationAPI.com and Turso database, with MCP endpoint support for AI assistants.

## Features

- **Multi-Channel Notifications**: Email, SMS, push, in-app, voice, and Slack via NotificationAPI
- **Blockchain Payments**: x402 protocol supporting Base, Base Sepolia, Solana Devnet, Solana Testnet
- **Edge Database**: Turso (libSQL) for fast, distributed data storage
- **MCP Protocol**: AI assistants can interface with the system programmatically
- **Modern Stack**: Next.js 16, React 19, shadcn/ui, Bun runtime

## Prerequisites

- [Bun](https://bun.sh) installed
- [Turso CLI](https://docs.turso.tech/cli/installation) installed
- NotificationAPI account (credentials provided)

## Setup

1. **Install dependencies**:
   \`\`\`bash
   bun install
   \`\`\`

2. **Create Turso database**:
   \`\`\`bash
   turso db create x402-notifications
   turso db show x402-notifications
   \`\`\`

3. **Configure environment variables**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your Turso credentials
   \`\`\`

4. **Run database migrations**:
   \`\`\`bash
   bun run scripts/01-create-schema.sql
   bun run scripts/02-seed-data.sql
   \`\`\`

5. **Start development server**:
   \`\`\`bash
   bun dev
   \`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── notifications/     # Notification API routes
│   │   ├── payments/          # Payment tracking
│   │   ├── users/             # User management
│   │   ├── mcp/               # MCP protocol endpoint
│   │   └── x402/              # x402 webhook handler
│   ├── dashboard/             # Protected dashboard (x402)
│   └── page.tsx               # Landing page
├── components/
│   ├── notification-card.tsx  # Notification UI component
│   ├── payment-card.tsx       # Payment UI component
│   └── stats-card.tsx         # Stats dashboard card
├── lib/
│   ├── turso.ts               # Database client & types
│   ├── notification-service.ts# NotificationAPI integration
│   ├── x402-payment-handler.ts# Payment processing
│   └── mcp-server.ts          # MCP protocol handler
├── scripts/
│   ├── 01-create-schema.sql   # Database schema
│   └── 02-seed-data.sql       # Seed data
├── proxy.ts                   # Next.js 16 proxy (x402 payment gates)
└── bunfig.toml                # Bun configuration
\`\`\`

## MCP API

The system exposes an MCP endpoint at \`/api/mcp\` for AI assistants. Available methods:

- \`createSession\`: Create authentication session
- \`sendNotification\`: Send notification to user
- \`getNotifications\`: Fetch user notifications
- \`markNotificationRead\`: Mark notification as read
- \`getPaymentHistory\`: Get payment transactions
- \`getTotalSpent\`: Calculate total spending
- \`getUser\`: Fetch user profile

See \`/api/mcp/docs\` for full documentation.

## x402 Payment Integration

Protected routes require micropayments:
- Dashboard: $0.01 USDC
- Send Notification API: $0.005 USDC
- Analytics: $0.02 USDC

Supports Base Sepolia and can be configured for Solana testnets.

## Technologies

- **Runtime**: Bun
- **Framework**: Next.js 16 with App Router
- **UI**: shadcn/ui + Tailwind CSS v4 + Lucide React
- **Database**: Turso (libSQL)
- **Notifications**: NotificationAPI
- **Payments**: x402-next protocol
- **Types**: TypeScript

## License

MIT
