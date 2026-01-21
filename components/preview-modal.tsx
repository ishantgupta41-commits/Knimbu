/**
 * Preview Modal Component
 * Displays document preview in a modal/dialog
 */

"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DocumentPreview } from "@/components/document-preview"
import { DocumentContent, TemplateConfig } from "@/lib/types/document"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentContent: DocumentContent
  templateConfig: TemplateConfig
}

export function PreviewModal({
  open,
  onOpenChange,
  documentContent,
  templateConfig,
}: PreviewModalProps) {
  console.log("PreviewModal render:", { 
    open, 
    hasDocument: !!documentContent, 
    hasTemplate: !!templateConfig,
    title: documentContent?.document?.title 
  })

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
        <div className="relative flex-1 flex flex-col min-h-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/90 backdrop-blur-sm shadow-md"
            onClick={() => onOpenChange(false)}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
          <div 
            className="flex-1 w-full overflow-y-auto overflow-x-hidden preview-scroll"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9',
              WebkitOverflowScrolling: 'touch',
              minHeight: 0
            }}
          >
            <DocumentPreview documentContent={documentContent} templateConfig={templateConfig} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
