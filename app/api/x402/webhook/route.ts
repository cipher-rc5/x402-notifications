import { type NextRequest, NextResponse } from "next/server"
import { recordPayment } from "@/lib/x402-payment-handler"
import { sendNotification } from "@/lib/notification-service"
import { turso } from "@/lib/turso"

export const runtime = "nodejs"

/**
 * Webhook endpoint to handle x402 payment confirmations
 * This would be called by the x402 facilitator after payment verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, transactionHash, network, amount, resource, userEmail } = body

    if (!userId || !transactionHash || !network || !amount || !resource) {
      return NextResponse.json({ error: "Missing required webhook parameters" }, { status: 400 })
    }

    // Record payment in database
    const payment = await recordPayment({
      userId,
      transactionHash,
      network,
      amount,
      resource,
    })

    // Get user details for notification
    const userResult = await turso.execute({
      sql: "SELECT email FROM users WHERE id = ?",
      args: [userId],
    })

    const email = (userResult.rows[0]?.email as string) || userEmail

    // Send confirmation notification
    if (email) {
      await sendNotification({
        userId,
        email,
        subject: "Payment Confirmed",
        message: `Your payment of ${amount} USDC on ${network} has been confirmed. Transaction: ${transactionHash}`,
        type: "payment_confirmation",
      })
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.paymentId,
      message: "Payment processed and notification sent",
    })
  } catch (error) {
    console.error("[v0] Error processing payment webhook:", error)
    return NextResponse.json({ error: "Failed to process payment webhook" }, { status: 500 })
  }
}
