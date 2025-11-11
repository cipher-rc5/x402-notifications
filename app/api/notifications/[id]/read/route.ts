import { type NextRequest, NextResponse } from "next/server"
import { markNotificationRead } from "@/lib/notification-service"

export const runtime = "nodejs"

// POST /api/notifications/:id/read
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await markNotificationRead(id)

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
