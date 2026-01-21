/**
 * Template Renderer Service
 * Handles dynamic preview rendering based on template configuration
 * Ensures styling and layout match the selected template exactly
 */

import { DocumentContent, TemplateConfig } from "@/lib/types/document"
import { mapContentToTemplate } from "./template-mapper"

/**
 * Render preview data for the frontend
 * @param documentContent Document content
 * @param templateId Selected template ID
 * @returns Rendered preview data ready for display
 */
export function renderTemplatePreview(
  documentContent: DocumentContent,
  templateId: string
): {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
} {
  // Map content to template structure
  const mapped = mapContentToTemplate(documentContent, templateId)

  // Validate content matches template requirements
  const { validateContentForTemplate } = require("./template-mapper")
  const validation = validateContentForTemplate(
    mapped.documentContent,
    templateId
  )

  if (!validation.valid) {
    console.warn("Template validation warnings:", validation.errors)
    // Continue anyway, but log warnings
  }

  return mapped
}

/**
 * Generate preview HTML (optional, for server-side rendering)
 * @param documentContent Document content
 * @param templateConfig Template configuration
 * @returns HTML string
 */
export function generatePreviewHtml(
  documentContent: DocumentContent,
  templateConfig: TemplateConfig
): string {
  // This can be used for server-side rendering if needed
  // For now, we use React components for rendering
  // This function can be extended in the future for static HTML generation

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${documentContent.document.title}</title>
  <style>
    body { font-family: ${templateConfig.typography.bodyFont === "font-serif" ? "serif" : "sans-serif"}; }
    h1 { font-size: 2.5rem; }
    h2 { font-size: 2rem; }
    h3 { font-size: 1.5rem; }
  </style>
</head>
<body>
  <h1>${documentContent.document.title}</h1>
`

  documentContent.content.forEach((section) => {
    html += `  <section id="${section.id}">\n`
    html += `    <h${section.level}>${section.heading}</h${section.level}>\n`

    section.blocks.forEach((block) => {
      if (block.type === "heading") {
        html += `    <h${block.level || 2}>${block.text}</h${block.level || 2}>\n`
      } else if (block.type === "paragraph") {
        html += `    <p>${escapeHtml(block.text)}</p>\n`
      } else if (block.type === "list") {
        html += `    <ul>\n`
        block.items?.forEach((item) => {
          html += `      <li>${escapeHtml(item)}</li>\n`
        })
        html += `    </ul>\n`
      } else if (block.type === "table" && block.tableData) {
        html += `    <table>\n`
        html += `      <thead><tr>\n`
        block.tableData.headers.forEach((header) => {
          html += `        <th>${escapeHtml(header)}</th>\n`
        })
        html += `      </tr></thead>\n`
        html += `      <tbody>\n`
        block.tableData.rows.forEach((row) => {
          html += `        <tr>\n`
          row.forEach((cell) => {
            html += `          <td>${escapeHtml(cell)}</td>\n`
          })
          html += `        </tr>\n`
        })
        html += `      </tbody>\n`
        html += `    </table>\n`
      }
    })

    html += `  </section>\n`
  })

  html += `</body>
</html>`

  return html
}

/**
 * Escape HTML special characters
 * @param text Text to escape
 * @returns Escaped HTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}
