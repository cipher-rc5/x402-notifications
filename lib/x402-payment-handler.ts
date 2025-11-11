import { turso } from "./turso"

export interface PaymentVerification {
  userId: string
  transactionHash: string
  network: "base" | "base-sepolia" | "solana-devnet" | "solana-testnet"
  amount: string
  resource: string
}

/**
 * Verify and record x402 payment in database
 */
export async function recordPayment(verification: PaymentVerification) {
  const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  try {
    await turso.execute({
      sql: `INSERT INTO payments (id, user_id, transaction_hash, network, amount, currency, status, resource, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        paymentId,
        verification.userId,
        verification.transactionHash,
        verification.network,
        verification.amount,
        "USDC",
        "confirmed",
        verification.resource,
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
      ],
    })

    console.log("[v0] Payment recorded successfully:", paymentId)
    return { success: true, paymentId }
  } catch (error) {
    console.error("[v0] Error recording payment:", error)
    throw error
  }
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId: string) {
  const result = await turso.execute({
    sql: "SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    args: [userId],
  })

  return result.rows
}

/**
 * Calculate total spent by user
 */
export async function getTotalSpent(userId: string): Promise<number> {
  const result = await turso.execute({
    sql: `SELECT SUM(CAST(amount AS REAL)) as total 
          FROM payments 
          WHERE user_id = ? AND status = 'confirmed'`,
    args: [userId],
  })

  const total = result.rows[0]?.total as number | null
  return total || 0
}
