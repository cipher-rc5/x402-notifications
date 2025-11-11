import { createClient } from "@libsql/client"

if (!process.env.TURSO_DATABASE_URL) {
  console.error("[v0] TURSO_DATABASE_URL environment variable is missing")
  throw new Error(
    "TURSO_DATABASE_URL environment variable is required. Please add it in the Vars section of the sidebar.",
  )
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.error("[v0] TURSO_AUTH_TOKEN environment variable is missing")
  throw new Error(
    "TURSO_AUTH_TOKEN environment variable is required. Please add it in the Vars section of the sidebar.",
  )
}

console.log("[v0] Initializing Turso client with URL:", process.env.TURSO_DATABASE_URL.substring(0, 30) + "...")

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

console.log("[v0] Turso client initialized successfully")

// Type definitions for our database models
export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  channel: "email" | "sms" | "push" | "in_app" | "voice" | "slack"
  status: "pending" | "sent" | "delivered" | "failed" | "read"
  metadata?: string
  created_at: number
  updated_at: number
  read_at?: number
}

export interface Payment {
  id: string
  user_id: string
  transaction_hash?: string
  network: "base" | "base-sepolia" | "solana-devnet" | "solana-testnet"
  amount: string
  currency: string
  status: "pending" | "confirmed" | "failed"
  resource: string
  created_at: number
  updated_at: number
}

export interface User {
  id: string
  email: string
  phone?: string
  preferences?: string
  wallet_address?: string
  created_at: number
  updated_at: number
}

export interface MCPSession {
  id: string
  user_id: string
  session_token: string
  expires_at: number
  metadata?: string
  created_at: number
}

export async function verifyConnection() {
  try {
    console.log("[v0] Verifying Turso connection...")
    const result = await turso.execute("SELECT 1 as test")
    console.log("[v0] Connection verified successfully:", result)
    return true
  } catch (error) {
    console.error("[v0] Connection verification failed:", error)
    return false
  }
}

export async function verifyTables() {
  try {
    console.log("[v0] Checking if tables exist...")
    const result = await turso.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)
    console.log(
      "[v0] Existing tables:",
      result.rows.map((r) => r.name),
    )
    return result.rows
  } catch (error) {
    console.error("[v0] Failed to check tables:", error)
    return []
  }
}
