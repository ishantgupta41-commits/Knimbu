/**
 * Dashboard document types
 */

export interface DashboardDocument {
  id: string
  title: string
  subtitle?: string
  published?: string
  lastEdited?: string
  views?: number
  template: string
  templateId: string
  collections: string[]
  image?: string
  documentContent?: any // Full document content for editing
  createdAt: string
  status: "draft" | "published"
}
