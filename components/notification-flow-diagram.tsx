"use client"

export function NotificationFlowDiagram() {
  return (
    <div className="relative py-16 px-4 bg-gradient-to-b from-background to-muted/20 rounded-lg border border-border/50">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-xl font-semibold mb-12 text-center">How It Works</h3>

        <div className="relative flex items-start justify-between gap-8">
          {/* Connecting line */}
          <svg className="absolute top-16 left-0 w-full h-32 -z-0" style={{ transform: "translateY(-50%)" }}>
            <path
              d="M 80 0 Q 200 60, 320 0 Q 440 -60, 560 0 Q 680 60, 800 0"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
              className="animate-pulse"
            />
          </svg>

          {/* Step 1: Pay Once */}
          <div className="flex flex-col items-center text-center space-y-4 flex-1 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative rounded-full w-20 h-20 bg-background border-2 border-orange-500/60 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-orange-500">1. Pay Once</p>
              <p className="text-sm text-muted-foreground max-w-[140px]">Configure with user-defined pricing</p>
            </div>
          </div>

          {/* Step 2: Get MCP Endpoint */}
          <div className="flex flex-col items-center text-center space-y-4 flex-1 relative z-10">
            <div className="relative">
              <div
                className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div className="relative rounded-full w-20 h-20 bg-background border-2 border-orange-500/60 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-orange-500">2. Get MCP Endpoint</p>
              <p className="text-sm text-muted-foreground max-w-[140px]">Unique URL for AI assistants</p>
            </div>
          </div>

          {/* Step 3: Set Conditions */}
          <div className="flex flex-col items-center text-center space-y-4 flex-1 relative z-10">
            <div className="relative">
              <div
                className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
              <div className="relative rounded-full w-20 h-20 bg-background border-2 border-orange-500/60 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-orange-500">3. Set Conditions</p>
              <p className="text-sm text-muted-foreground max-w-[140px]">Define triggers & thresholds</p>
            </div>
          </div>

          {/* Step 4: Receive Alerts */}
          <div className="flex flex-col items-center text-center space-y-4 flex-1 relative z-10">
            <div className="relative">
              <div
                className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "1.5s" }}
              />
              <div className="relative rounded-full w-20 h-20 bg-background border-2 border-orange-500/60 flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-orange-500">4. Receive Alerts</p>
              <p className="text-sm text-muted-foreground max-w-[140px]">Multi-channel delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
