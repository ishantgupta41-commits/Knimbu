/**
 * Preview Modal Component
 * Displays document preview in a modal/dialog
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DocumentPreview } from "@/components/document-preview"
import { DocumentContent, TemplateConfig, Features, Sections } from "@/lib/types/document"
import { X, Rocket, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentContent: DocumentContent
  templateConfig: TemplateConfig
  features?: Features
  sections?: Sections
  templateId?: string
  onPublished?: (templateId: string) => void
}

export function PreviewModal({
  open,
  onOpenChange,
  documentContent,
  templateConfig,
  features,
  sections,
  templateId,
  onPublished,
}: PreviewModalProps) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)

  console.log("PreviewModal render:", { 
    open, 
    hasDocument: !!documentContent, 
    hasTemplate: !!templateConfig,
    title: documentContent?.document?.title 
  })

  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      const userId = localStorage.getItem("knimbu_user_id") || "default-user"
      
      // Save template to backend
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          documentContent,
          templateId: templateConfig.id,
          features: features || {},
          sections: sections || {},
        })
      })

      const data = await response.json()

      if (data.success && data.template?.id) {
        const savedTemplateId = data.template.id
        toast.success("Template published successfully!")
        
        // Close modal
        onOpenChange(false)
        
        // Notify parent component
        if (onPublished) {
          onPublished(savedTemplateId)
        }
        
        // Navigate to preview page
        router.push(`/preview/${savedTemplateId}`)
      } else {
        toast.error(data.error || "Failed to publish template")
      }
    } catch (error) {
      console.error("Error publishing template:", error)
      toast.error("Failed to publish template")
    } finally {
      setIsPublishing(false)
    }
  }

  if (!documentContent || !templateConfig) {
    console.warn("PreviewModal: Missing required props", { documentContent, templateConfig })
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[95vw] !h-[95vh] !max-w-[95vw] !max-h-[95vh] p-0 !overflow-hidden !z-[100] flex flex-col"
        showCloseButton={false}
      >
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          Document Preview: {documentContent.document.title}
        </DialogTitle>
        {/* Action Buttons Bar - Fixed at top, above content */}
        <div className="sticky top-0 z-[100] bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Preview Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-[#628F07] hover:bg-[#628F07]/90 text-white"
              size="default"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
              onClick={() => onOpenChange(false)}
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative flex-1 flex flex-col min-h-0">
          <div 
            className="flex-1 w-full overflow-y-auto overflow-x-hidden preview-scroll"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9',
              WebkitOverflowScrolling: 'touch',
              minHeight: 0
            }}
          >
            <DocumentPreview 
              documentContent={documentContent} 
              templateConfig={templateConfig}
              features={features}
              sections={sections}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
