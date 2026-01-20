/**
 * Template Registry
 * Defines available templates and their configurations
 */

import { TemplateConfig } from "@/lib/types/document"

export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  "knowledge-hub": {
    id: "knowledge-hub",
    name: "Knowledge Hub",
    description: "Our organizational standard template. Recommended for reports 20-80 pages long.",
    layout: {
      sidebar: "single",
      header: true,
      navigationLevels: [1, 2], // H1 and H2
    },
    typography: {
      headingHierarchy: ["text-4xl", "text-3xl", "text-2xl"],
      bodyFont: "font-sans",
    },
    metadataPlacement: {
      authors: "header",
      date: "header",
      collections: "sidebar",
    },
  },
  "global-economic-prospects": {
    id: "global-economic-prospects",
    name: "Global Economic Prospects",
    description: "Template optimized for reports in the Global Economic Prospects series",
    layout: {
      sidebar: "single",
      header: true,
      navigationLevels: [1], // H1 only
    },
    typography: {
      headingHierarchy: ["text-5xl", "text-3xl", "text-2xl"],
      bodyFont: "font-serif",
    },
    metadataPlacement: {
      authors: "header",
      date: "header",
      collections: "header",
    },
  },
  "academic-papers": {
    id: "academic-papers",
    name: "Academic Papers",
    description: "Optimized for academic publications and papers",
    layout: {
      sidebar: "single",
      header: true,
      navigationLevels: [1, 2], // H1 and H2
    },
    typography: {
      headingHierarchy: ["text-3xl", "text-2xl", "text-xl"],
      bodyFont: "font-serif",
    },
    metadataPlacement: {
      authors: "header",
      date: "header",
      collections: "sidebar",
    },
  },
  "in-depth-report": {
    id: "in-depth-report",
    name: "In-depth Report",
    description: "Optimized for lengthy (80+ page) reports",
    layout: {
      sidebar: "double",
      header: true,
      navigationLevels: [1, 2, 3], // H1, H2, H3
    },
    typography: {
      headingHierarchy: ["text-4xl", "text-3xl", "text-2xl", "text-xl"],
      bodyFont: "font-sans",
    },
    metadataPlacement: {
      authors: "sidebar",
      date: "sidebar",
      collections: "sidebar",
    },
  },
}

/**
 * Get template config by ID
 */
export function getTemplateConfig(templateId: string): TemplateConfig | null {
  return TEMPLATE_REGISTRY[templateId] || null
}

/**
 * Get template ID from template name (for backward compatibility)
 */
export function getTemplateIdFromName(templateName: string): string | null {
  const entry = Object.entries(TEMPLATE_REGISTRY).find(
    ([_, config]) => config.name === templateName
  )
  return entry ? entry[0] : null
}
