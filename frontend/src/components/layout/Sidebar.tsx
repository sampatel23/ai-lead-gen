import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, BarChart3, Settings as SettingsIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
]

export function Sidebar({ className }: { className?: string }) {
  return (
    <div className={cn("pb-12 min-h-screen border-r bg-card w-64 hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-6 py-2">
          <h2 className="text-lg font-bold tracking-tight">LeadGen.ai</h2>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
