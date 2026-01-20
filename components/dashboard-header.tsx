"use client"

import { Menu, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  onMenuClick: () => void
  onCreateClick?: () => void
}

export function DashboardHeader({ onMenuClick, onCreateClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-auto flex items-center gap-4">
          <Button className="gap-2 hidden sm:flex" style={{ backgroundColor: "#628F07" }} onClick={onCreateClick}>
            <Plus className="h-4 w-4" />
            Create New Knimbu
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">BH</span>
          </div>
        </div>
      </div>
    </header>
  )
}
