/**
 * Document Preview Component
 * 
 * ROUTER COMPONENT: Routes to template-specific renderers based on template selection
 * 
 * DECISION LOGIC:
 * - Template selection (templateConfig.id) determines which component renders
 * - Knowledge Hub → KnowledgeHubTemplate (product page layout)
 * - Other templates → Fallback to document-style preview
 * 
 * PRIORITY HANDLING:
 * 1. Template ID is primary routing key
 * 2. Features and sections are passed to template-specific components
 * 3. Word document content is used ONLY to populate bullets/descriptions
 */

"use client"

import { DocumentContent, TemplateConfig, Features, Sections } from "@/lib/types/document"
import { KnowledgeHubTemplate } from "@/components/templates/knowledge-hub-template"
import { DocumentPreviewLegacy } from "./document-preview-legacy"

interface DocumentPreviewProps {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
  features?: Features
  sections?: Sections
  onClose?: () => void
}

export function DocumentPreview({ 
  documentContent, 
  templateConfig, 
  features,
  sections,
  onClose 
}: DocumentPreviewProps) {
  // ROUTE TO TEMPLATE-SPECIFIC COMPONENT BASED ON TEMPLATE SELECTION
  // This is the core decision logic: template selection controls layout
  
  if (templateConfig.id === "knowledge-hub") {
    // Knowledge Hub uses product page layout (NOT document layout)
    return (
      <KnowledgeHubTemplate
        documentContent={documentContent}
        templateConfig={templateConfig}
        features={features || {
          languageSwitcher: true,
          aiChatbot: true,
          audioNarration: true,
          complexitySlider: true,
          downloadPDF: true,
        }}
        sections={sections || {
          about: true,
          executiveSummary: true,
          avlearningzone: true,
          casestudyexplorer: true,
          webinarsandevents: true,
          asktheauthor: true,
          additionalresources: true,
          relatedreports: true,
        }}
        onClose={onClose}
      />
    )
  }

  // Fallback to legacy document-style preview for other templates
  return (
    <DocumentPreviewLegacy
      documentContent={documentContent}
      templateConfig={templateConfig}
      onClose={onClose}
    />
  )
}
