"use client"

import { useState, useCallback } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MyLibrary } from "@/components/my-library"
import { UnpublishedDocuments } from "@/components/unpublished-documents"
import { CreateDocumentView } from "@/components/create-document-view"
import { DashboardDocument } from "@/lib/types/dashboard"

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState<"dashboard" | "create">("dashboard")
  const [documents, setDocuments] = useState<DashboardDocument[]>([])

  const handleNavClick = () => {
    setView("dashboard")
    setSidebarOpen(false)
  }

  const handleDocumentCreated = useCallback((document: DashboardDocument) => {
    setDocuments((prev) => [document, ...prev])
    setView("dashboard")
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} onNavigate={handleNavClick} />

      <div className="flex flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} onCreateClick={() => setView("create")} />

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {view === "dashboard" ? (
              <div className="space-y-8">
                <div className="space-y-4 pt-0">
                  <h1 className="text-4xl font-bold text-foreground">Library</h1>
                </div>
                <UnpublishedDocuments documents={documents.filter((d) => d.status === "draft")} />
                <MyLibrary documents={documents.filter((d) => d.status === "published")} />
              </div>
            ) : (
              <CreateDocumentView onBack={() => setView("dashboard")} onDocumentCreated={handleDocumentCreated} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
