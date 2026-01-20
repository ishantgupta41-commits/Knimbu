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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[90vw] h-[90vh] p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          Document Preview: {documentContent.document.title}
        </DialogTitle>
        <div className="relative h-full">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="h-full w-full overflow-auto">
            <DocumentPreview documentContent={documentContent} templateConfig={templateConfig} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
