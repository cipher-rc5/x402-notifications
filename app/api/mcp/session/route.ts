import { type NextRequest, NextResponse } from "next/server"
import { createMCPSession } from "@/lib/mcp-server"

export const runtime = "nodejs"

/**
 * Create new MCP session
 * POST /api/mcp/session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const sessionToken = await createMCPSession(userId)

    return NextResponse.json({
      success: true,
      sessionToken,
      expiresIn: 86400,
      message: "MCP session created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating MCP session:", error)
    return NextResponse.json({ error: "Failed to create MCP session" }, { status: 500 })
  }
}
