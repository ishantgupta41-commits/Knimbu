"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MyLibrary } from "@/components/my-library"
import { UnpublishedDocuments } from "@/components/unpublished-documents"
import { CreateDocumentView } from "@/components/create-document-view"
import { PreviewModal } from "@/components/preview-modal"
import { DashboardDocument } from "@/lib/types/dashboard"
import { getTemplateConfig } from "@/lib/templates/template-registry"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState<"dashboard" | "create">("dashboard")
  const [documents, setDocuments] = useState<DashboardDocument[]>([])
  const [previewDocument, setPreviewDocument] = useState<DashboardDocument | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFeatures, setPreviewFeatures] = useState<any>(null)
  const [previewSections, setPreviewSections] = useState<any>(null)

  // Load published templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      if (!isAuthenticated || isLoading) return
      
      try {
        const userId = localStorage.getItem("knimbu_user_id") || "default-user"
        const response = await fetch("/api/templates", {
          headers: {
            "x-user-id": userId
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.templates) {
            // Convert templates to dashboard documents
            const dashboardDocs: DashboardDocument[] = data.templates.map((template: any) => ({
              id: template.id,
              title: template.documentContent?.document?.title || "Untitled",
              subtitle: template.documentContent?.document?.subtitle,
              template: template.templateConfig?.name || "Unknown",
              templateId: template.templateConfig?.id || "knowledge-hub",
              collections: template.documentContent?.document?.collections?.map((c: any) => c.name) || [],
              createdAt: template.createdAt,
              status: "published" as const,
              documentContent: template.documentContent,
              image: "/placeholder.jpg",
              views: 0,
            }))
            setDocuments(dashboardDocs)
          }
        }
      } catch (error) {
        console.error("Error loading templates:", error)
      }
    }

    loadTemplates()
  }, [isAuthenticated, isLoading])

  const handleNavClick = () => {
    setView("dashboard")
    setSidebarOpen(false)
  }

  const handleDocumentCreated = useCallback((document: DashboardDocument) => {
    setDocuments((prev) => [document, ...prev])
    // Don't navigate away - keep showing the create view so preview can show
  }, [])

  const handlePreview = useCallback((document: DashboardDocument) => {
    setPreviewDocument(document)
    setShowPreview(true)
  }, [])

  const handleTemplatePublished = useCallback((templateId: string) => {
    // Reload templates after publishing
    const loadTemplates = async () => {
      try {
        const userId = localStorage.getItem("knimbu_user_id") || "default-user"
        const response = await fetch("/api/templates", {
          headers: {
            "x-user-id": userId
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.templates) {
            const dashboardDocs: DashboardDocument[] = data.templates.map((template: any) => ({
              id: template.id,
              title: template.documentContent?.document?.title || "Untitled",
              subtitle: template.documentContent?.document?.subtitle,
              template: template.templateConfig?.name || "Unknown",
              templateId: template.templateConfig?.id || "knowledge-hub",
              collections: template.documentContent?.document?.collections?.map((c: any) => c.name) || [],
              createdAt: template.createdAt,
              status: "published" as const,
              documentContent: template.documentContent,
              image: "/placeholder.jpg",
              views: 0,
            }))
            setDocuments(dashboardDocs)
          }
        }
      } catch (error) {
        console.error("Error loading templates:", error)
      }
    }
    loadTemplates()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

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
                <UnpublishedDocuments 
                  documents={documents.filter((d) => d.status === "draft")} 
                  onPreview={handlePreview}
                />
                <MyLibrary 
                  documents={documents.filter((d) => d.status === "published")} 
                  onPreview={handlePreview}
                />
              </div>
            ) : (
              <CreateDocumentView 
                onBack={() => setView("dashboard")} 
                onDocumentCreated={handleDocumentCreated}
                onTemplatePublished={handleTemplatePublished}
              />
            )}
          </div>
        </main>
      </div>

      {/* Preview Modal for dashboard documents */}
      {previewDocument && previewDocument.documentContent && (
        <PreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          documentContent={previewDocument.documentContent}
          templateConfig={getTemplateConfig(previewDocument.templateId) || getTemplateConfig("knowledge-hub")!}
          onPublished={(templateId) => {
            handleTemplatePublished(templateId)
            setShowPreview(false)
          }}
        />
      )}
    </div>
  )
}
