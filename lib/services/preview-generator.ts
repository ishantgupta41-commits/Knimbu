/**
 * Preview Generator Service
 * Generates HTML/React preview from structured document content
 */

import { DocumentContent } from "@/lib/types/document"
import { TemplateConfig } from "@/lib/types/document"

/**
 * Generate navigation items from document sections
 */
export function generateNavigation(content: DocumentContent["content"], levels: number[]) {
  return content
    .filter((section) => levels.includes(section.level))
    .map((section) => ({
      id: section.id,
      title: section.heading,
      level: section.level,
    }))
}

/**
 * Generate preview HTML structure
 */
export function generatePreviewHTML(
  documentContent: DocumentContent,
  templateConfig: TemplateConfig
): string {
  const navigation = generateNavigation(documentContent.content, templateConfig.layout.navigationLevels)

  // Build sidebar navigation HTML
  const sidebarNav = navigation
    .map((item) => {
      const indent = item.level === 1 ? "" : item.level === 2 ? "ml-4" : "ml-8"
      return `<a href="#${item.id}" class="block py-2 ${indent} text-sm hover:text-[#628F07]">${item.title}</a>`
    })
    .join("\n")

  // Build content sections HTML
  const contentSections = documentContent.content
    .map((section) => {
      const headingClass =
        section.level === 1
          ? templateConfig.typography.headingHierarchy[0]
          : section.level === 2
            ? templateConfig.typography.headingHierarchy[1]
            : templateConfig.typography.headingHierarchy[2]

      const blocksHTML = section.blocks
        .map((block) => {
          if (block.type === "heading") {
            const blockHeadingClass =
              block.level === 2
                ? templateConfig.typography.headingHierarchy[1]
                : templateConfig.typography.headingHierarchy[2]
            return `<h${block.level} class="${blockHeadingClass} font-bold mt-6 mb-4">${block.text}</h${block.level}>`
          }
          if (block.type === "paragraph") {
            return `<p class="mb-4 ${templateConfig.typography.bodyFont} leading-relaxed">${block.text}</p>`
          }
          return ""
        })
        .join("\n")

      return `
        <section id="${section.id}" class="mb-12">
          <h${section.level} class="${headingClass} font-bold mb-6">${section.heading}</h${section.level}>
          ${blocksHTML}
        </section>
      `
    })
    .join("\n")

  // Build metadata HTML
  const authorsHTML =
    documentContent.document.authors.length > 0
      ? `<div class="mb-4">
          <h3 class="text-sm font-semibold mb-2">Authors</h3>
          <div class="flex flex-wrap gap-2">
            ${documentContent.document.authors.map((author) => `<span class="text-sm">${author.name}</span>`).join(", ")}
          </div>
        </div>`
      : ""

  const dateHTML = documentContent.document.publicationDate
    ? `<div class="mb-4"><span class="text-sm text-muted-foreground">Published: ${documentContent.document.publicationDate}</span></div>`
    : ""

  const collectionsHTML =
    documentContent.document.collections.length > 0
      ? `<div class="mb-4">
          <h3 class="text-sm font-semibold mb-2">Collections</h3>
          <div class="flex flex-wrap gap-2">
            ${documentContent.document.collections.map((col) => `<span class="text-xs px-2 py-1 bg-gray-100 rounded">${col.name}</span>`).join("")}
          </div>
        </div>`
      : ""

  // Determine sidebar layout
  const sidebarClass = templateConfig.layout.sidebar === "double" ? "w-64" : "w-48"
  const sidebarHTML = templateConfig.layout.sidebar !== "none" ? `
    <aside class="${sidebarClass} flex-shrink-0 border-r pr-6">
      <nav class="sticky top-4">
        <h3 class="text-sm font-semibold mb-4">Contents</h3>
        ${sidebarNav}
        ${templateConfig.metadataPlacement.authors === "sidebar" ? authorsHTML : ""}
        ${templateConfig.metadataPlacement.date === "sidebar" ? dateHTML : ""}
        ${templateConfig.metadataPlacement.collections === "sidebar" ? collectionsHTML : ""}
      </nav>
    </aside>
  ` : ""

  // Build header HTML
  const headerHTML = templateConfig.layout.header
    ? `
    <header class="border-b pb-6 mb-8">
      <h1 class="${templateConfig.typography.headingHierarchy[0]} font-bold mb-2">${documentContent.document.title}</h1>
      ${documentContent.document.subtitle ? `<h2 class="text-xl text-muted-foreground mb-4">${documentContent.document.subtitle}</h2>` : ""}
      ${templateConfig.metadataPlacement.authors === "header" ? authorsHTML : ""}
      ${templateConfig.metadataPlacement.date === "header" ? dateHTML : ""}
      ${templateConfig.metadataPlacement.collections === "header" ? collectionsHTML : ""}
    </header>
  `
    : ""

  // Assemble full HTML
  const html = `
    <div class="min-h-screen bg-background">
      <div class="max-w-7xl mx-auto px-4 py-8">
        ${headerHTML}
        <div class="flex gap-8">
          ${sidebarHTML}
          <main class="flex-1 prose max-w-none">
            ${contentSections}
          </main>
        </div>
      </div>
    </div>
  `

  return html
}
