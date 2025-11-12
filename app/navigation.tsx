'use client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { FileCode, LayoutDashboard, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            x402 Notifications
          </Link>

          <div className="flex items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Button key={link.href} asChild variant={isActive ? "secondary" : "ghost"} className="h-14 w-14">
                  <Link href={link.href} title={link.label}>
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </Link>
                </Button>
              )
            })}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
