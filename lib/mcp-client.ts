/**
 * TypeScript MCP Client for Node.js integrations
 * Example usage in the documentation
 */

export interface MCPClientConfig {
  baseUrl: string
  userId: string
  sessionToken?: string
}

export class MCPClient {
  private baseUrl: string
  private userId: string
  private sessionToken: string | null = null

  constructor(config: MCPClientConfig) {
    this.baseUrl = config.baseUrl
    this.userId = config.userId
    this.sessionToken = config.sessionToken || null
  }

  /**
   * Initialize the client and create a session
   */
  async init(): Promise<void> {
    if (this.sessionToken) return

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "createSession",
        params: { userId: this.userId },
      }),
    })

    const data = await response.json()
    if (data.success) {
      this.sessionToken = data.data.sessionToken
    } else {
      throw new Error(data.error || "Failed to create session")
    }
  }

  /**
   * Send a notification
   */
  async sendNotification(params: {
    email: string
    subject: string
    message: string
    type?: string
    phone?: string
  }) {
    if (!this.sessionToken) throw new Error("Client not initialized. Call init() first.")

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "sendNotification",
        params: {
          userId: this.userId,
          ...params,
        },
        sessionToken: this.sessionToken,
      }),
    })

    return response.json()
  }

  /**
   * Get all notifications
   */
  async getNotifications() {
    if (!this.sessionToken) throw new Error("Client not initialized. Call init() first.")

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "getNotifications",
        params: {},
        sessionToken: this.sessionToken,
      }),
    })

    return response.json()
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string) {
    if (!this.sessionToken) throw new Error("Client not initialized. Call init() first.")

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "markNotificationRead",
        params: { notificationId },
        sessionToken: this.sessionToken,
      }),
    })

    return response.json()
  }

  /**
   * Get payment history
   */
  async getPaymentHistory() {
    if (!this.sessionToken) throw new Error("Client not initialized. Call init() first.")

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "getPaymentHistory",
        params: {},
        sessionToken: this.sessionToken,
      }),
    })

    return response.json()
  }

  /**
   * Get total spent
   */
  async getTotalSpent() {
    if (!this.sessionToken) throw new Error("Client not initialized. Call init() first.")

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "getTotalSpent",
        params: {},
        sessionToken: this.sessionToken,
      }),
    })

    return response.json()
  }
}
