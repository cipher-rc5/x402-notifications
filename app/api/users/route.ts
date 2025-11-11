import { type NextRequest, NextResponse } from "next/server"
import { turso } from "@/lib/turso"

export const runtime = "nodejs"

// GET /api/users/:id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 })
    }

    const result = await turso.execute({
      sql: "SELECT * FROM users WHERE id = ?",
      args: [userId],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// POST /api/users - Create or update user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, phone, preferences, walletAddress } = body

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required" }, { status: 400 })
    }

    // Check if user exists
    const existing = await turso.execute({
      sql: "SELECT id FROM users WHERE id = ?",
      args: [userId],
    })

    if (existing.rows.length > 0) {
      // Update existing user
      await turso.execute({
        sql: `UPDATE users 
              SET email = ?, phone = ?, preferences = ?, wallet_address = ?, updated_at = ?
              WHERE id = ?`,
        args: [
          email,
          phone || null,
          preferences ? JSON.stringify(preferences) : null,
          walletAddress || null,
          Math.floor(Date.now() / 1000),
          userId,
        ],
      })
    } else {
      // Create new user
      await turso.execute({
        sql: `INSERT INTO users (id, email, phone, preferences, wallet_address, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          email,
          phone || null,
          preferences ? JSON.stringify(preferences) : null,
          walletAddress || null,
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000),
        ],
      })
    }

    return NextResponse.json({
      success: true,
      message: "User saved successfully",
    })
  } catch (error) {
    console.error("[v0] Error saving user:", error)
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 })
  }
}
