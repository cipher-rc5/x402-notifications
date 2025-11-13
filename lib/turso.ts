import { createClient } from '@libsql/client';
import { requireEnv } from './runtime-env';

const TURSO_DATABASE_URL = requireEnv('TURSO_DATABASE_URL');
const TURSO_AUTH_TOKEN = requireEnv('TURSO_AUTH_TOKEN');

console.log('Initializing Turso client with URL:', TURSO_DATABASE_URL.substring(0, 30) + '...');

export const turso = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

console.log('Turso client initialized successfully');

// Type definitions for our database models
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  channel: 'email' | 'sms' | 'push' | 'in_app' | 'voice' | 'slack';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  metadata?: string;
  created_at: number;
  updated_at: number;
  read_at?: number;
}

export interface Payment {
  id: string;
  user_id: string;
  transaction_hash?: string;
  network: 'base' | 'base-sepolia' | 'solana-devnet' | 'solana-testnet';
  amount: string;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  resource: string;
  created_at: number;
  updated_at: number;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  preferences?: string;
  wallet_address?: string;
  created_at: number;
  updated_at: number;
}

export interface MCPSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: number;
  metadata?: string;
  created_at: number;
}

export async function verifyConnection() {
  try {
    console.log('Verifying Turso connection...');
    const result = await turso.execute({ sql: 'SELECT 1 as test', args: [] });
    console.log('Connection verified successfully:', result);
    return true;
  } catch (error) {
    console.error('Connection verification failed:', error);
    return false;
  }
}

export async function verifyTables() {
  try {
    console.log('Checking if tables exist...');
    const result = await turso.execute({
      sql: `SELECT name FROM sqlite_master
            WHERE type='table'
            ORDER BY name`,
      args: []
    });
    console.log('Existing tables:', result.rows.map((r) => r.name));
    return result.rows;
  } catch (error) {
    console.error('Failed to check tables:', error);
    return [];
  }
}
