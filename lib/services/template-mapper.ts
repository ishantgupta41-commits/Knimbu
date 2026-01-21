/**
 * Template Mapper Service
 * Maps extracted document content and form inputs to template-specific layouts
 * Each template has its own layout rules (header, sections, typography, metadata placement)
 */

import { DocumentContent, TemplateConfig, DocumentSection, ContentBlock } from "@/lib/types/document"
import { getTemplateConfig } from "@/lib/templates/template-registry"

/**
 * Map document content to template structure
 * @param documentContent Raw document content
 * @param templateId Selected template ID
 * @returns Mapped content ready for template rendering
 */
export function mapContentToTemplate(
  documentContent: DocumentContent,
  templateId: string
): {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
} {
  // Get template configuration
  const templateConfig = getTemplateConfig(templateId)

  if (!templateConfig) {
    throw new Error(`Invalid template ID: ${templateId}`)
  }

  // Filter sections based on template navigation levels
  const filteredContent = filterSectionsByNavigationLevels(
    documentContent.content,
    templateConfig.layout.navigationLevels
  )

  // Apply template-specific content transformations
  const transformedContent = applyTemplateTransformations(
    filteredContent,
    templateConfig
  )

  return {
    documentContent: {
      ...documentContent,
      content: transformedContent,
    },
    templateConfig,
  }
}

/**
 * Filter sections based on template navigation levels
 * Only include sections that match the template's navigation level requirements
 * @param sections Document sections
 * @param navigationLevels Allowed navigation levels (e.g., [1, 2] for H1-H2)
 * @returns Filtered sections
 */
function filterSectionsByNavigationLevels(
  sections: DocumentSection[],
  navigationLevels: number[]
): DocumentSection[] {
  // Include all sections, but filter out blocks that don't match navigation levels
  return sections.map((section) => {
    // Include the section if its level matches navigation levels
    if (!navigationLevels.includes(section.level)) {
      // If section level doesn't match, still include it but mark as non-navigable
      return section
    }

    // Filter blocks to only include headings that match navigation levels
    const filteredBlocks = section.blocks.filter((block) => {
      if (block.type === "heading") {
        return navigationLevels.includes(block.level || 2)
      }
      return true // Keep all non-heading blocks
    })

    return {
      ...section,
      blocks: filteredBlocks,
    }
  })
}

/**
 * Apply template-specific transformations to content
 * @param sections Document sections
 * @param templateConfig Template configuration
 * @returns Transformed sections
 */
function applyTemplateTransformations(
  sections: DocumentSection[],
  templateConfig: TemplateConfig
): DocumentSection[] {
  return sections.map((section) => {
    // Apply template-specific block transformations
    const transformedBlocks = section.blocks.map((block) => {
      return transformBlockForTemplate(block, templateConfig)
    })

    return {
      ...section,
      blocks: transformedBlocks,
    }
  })
}

/**
 * Transform a content block based on template rules
 * @param block Content block
 * @param templateConfig Template configuration
 * @returns Transformed block
 */
function transformBlockForTemplate(
  block: ContentBlock,
  templateConfig: TemplateConfig
): ContentBlock {
  // Template-specific transformations can be added here
  // For now, return block as-is
  return block
}

/**
 * Validate that content matches template requirements
 * @param documentContent Document content
 * @param templateId Template ID
 * @returns Validation result
 */
export function validateContentForTemplate(
  documentContent: DocumentContent,
  templateId: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const templateConfig = getTemplateConfig(templateId)

  if (!templateConfig) {
    return { valid: false, errors: [`Invalid template ID: ${templateId}`] }
  }

  // Check if document has required metadata
  if (!documentContent.document.title) {
    errors.push("Document title is required")
  }

  // Check if content sections exist
  if (documentContent.content.length === 0) {
    errors.push("Document must have at least one section")
  }

  // Validate navigation levels match template requirements
  const navigationLevels = templateConfig.layout.navigationLevels
  const sectionLevels = documentContent.content.map((s) => s.level)
  const invalidLevels = sectionLevels.filter(
    (level) => !navigationLevels.includes(level)
  )

  if (invalidLevels.length > 0 && navigationLevels.length > 0) {
    // Warning only, not an error
    console.warn(
      `Some sections have levels (${invalidLevels.join(", ")}) that don't match template navigation levels (${navigationLevels.join(", ")})`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
