"use client"

import { Button } from "@/components/ui/button"
import { Bell, LayoutDashboard, FileCode, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/api/mcp/docs", label: "Documentation", icon: FileCode },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="rounded-lg bg-primary p-1.5">
              <Bell className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">x402 Notifications</span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Button key={link.href} asChild variant={isActive ? "secondary" : "ghost"} size="icon">
                  <Link href={link.href} title={link.label}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
