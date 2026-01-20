"use client"

import {
  FileText,
  Palette,
  Layers,
  BookOpen,
  Sparkles,
  HelpCircle,
  BarChart3,
  Users,
  Grid3x3,
  Shield,
  Settings,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: () => void
}

export function DashboardSidebar({ open, onOpenChange, onNavigate }: DashboardSidebarProps) {
  const sections = [
    {
      title: "Content",
      items: [
        { icon: FileText, label: "Library" },
        { icon: Grid3x3, label: "Collections" },
        { icon: Users, label: "Authors" },
      ],
    },
    {
      title: "Metrics",
      items: [{ icon: BarChart3, label: "Dashboard" }],
    },
    {
      title: "Design & Layout",
      items: [
        { icon: Layers, label: "Templates" },
        { icon: Palette, label: "Brand Kit" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: Shield, label: "Admin Panel" },
        { icon: Settings, label: "Settings" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: BookOpen, label: "Tutorials" },
        { icon: Sparkles, label: "What's New" },
        { icon: HelpCircle, label: "Help Center" },
      ],
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => onOpenChange(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-md",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ backgroundColor: "#F9FDF7" }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-start p-4">
            <Image src="/knimbu-logo.png" alt="Knimbu" width={240} height={64} className="h-16 w-auto" />
          </div>

          {/* Navigation sections */}
          <nav className="flex-1 space-y-0 overflow-y-auto p-4">
            {sections.map((section, index) => (
              <div key={section.title} className={index !== 0 ? "mt-4" : ""}>
                {section.title === "Support" && <div className="mb-2 border-t border-sidebar-border" />}
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const IconComponent = item.icon
                    const isActive = item.label === "Library"
                    return (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3",
                          isActive && "border-l-4 border-l-green-700 pl-2",
                          isActive ? "text-sidebar-foreground" : "text-sidebar-foreground",
                        )}
                        onClick={() => {
                          // Add navigation handler to switch back to dashboard view
                          if (onNavigate) {
                            onNavigate()
                          }
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "rgba(98, 143, 7, 0.1)"
                            e.currentTarget.style.color = "#135745"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = "transparent"
                            e.currentTarget.style.color = ""
                          }
                        }}
                      >
                        <IconComponent className={cn("h-5 w-5", isActive && "text-green-700")} />
                        {item.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="space-y-4 border-t border-sidebar-border p-4"></div>
        </div>
      </aside>
    </>
  )
}
