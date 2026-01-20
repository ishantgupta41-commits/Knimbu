/**
 * Document structure types for Knimbu preview system
 */

export interface DocumentMetadata {
  title: string
  subtitle?: string
  publicationDate?: string
  authors: Array<{ id: number; name: string; image?: string }>
  collections: Array<{ id: number; name: string; icon?: string }>
}

export interface ContentBlock {
  type: "paragraph" | "heading" | "list"
  text: string
  level?: number // For headings (1-3)
  items?: string[] // For lists
}

export interface DocumentSection {
  id: string
  heading: string
  level: number // 1 = H1, 2 = H2, 3 = H3
  blocks: ContentBlock[]
}

export interface DocumentContent {
  document: DocumentMetadata
  content: DocumentSection[]
}

export interface PublicationOptions {
  immediatePublish: boolean
  schedulePublish?: string
  draftOnly: boolean
  publishOnOrgWebsite: boolean
  publishOnKnimbu: boolean
}

export interface DocumentFeatures {
  languageSwitcher: boolean
  aiChatbot: boolean
  audioNarration: boolean
  complexitySlider: boolean
  downloadPDF: boolean
}

export interface DocumentSections {
  about: boolean
  executiveSummary: boolean
  avlearningzone: boolean
  casestudyexplorer: boolean
  webinarsandevents: boolean
  asktheauthor: boolean
  additionalresources: boolean
  relatedreports: boolean
}

export interface Accelerators {
  prePopulateChapterBanners: boolean
  prePopulateSubchapterImages: boolean
}

export interface CreateDocumentRequest {
  metadata: DocumentMetadata
  templateId: string
  features: DocumentFeatures
  sections: DocumentSections
  accelerators: Accelerators
  publicationOptions: PublicationOptions
  file?: File
}

export interface PreviewResponse {
  success: boolean
  preview: DocumentContent
  templateId: string
  previewHtml?: string
  error?: string
}

export interface TemplateConfig {
  id: string
  name: string
  description: string
  layout: {
    sidebar: "single" | "double" | "none"
    header: boolean
    navigationLevels: number[] // e.g., [1, 2] for H1-H2 navigation
  }
  typography: {
    headingHierarchy: string[]
    bodyFont: string
  }
  metadataPlacement: {
    authors: "header" | "sidebar" | "footer"
    date: "header" | "sidebar" | "footer"
    collections: "header" | "sidebar" | "footer"
  }
}
