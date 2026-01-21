/**
 * DOCX Parser Service
 * Enhanced Word document parser that extracts headings, paragraphs, lists, and tables
 * This is a wrapper around the existing document-parser with table support
 */

import { DocumentContent, DocumentSection, ContentBlock, TableData } from "@/lib/types/document"
import { parseDocument as parseDocumentCore } from "./document-parser"
import mammoth from "mammoth"

/**
 * Parse Word document and extract structured content including tables
 * @param file Word document file (.docx)
 * @param useAI Whether to use AI for enhanced parsing
 * @param aiClient Optional AI client (OpenAI)
 * @returns Structured document content with all elements
 */
export async function parseDocxDocument(
  file: File | Blob,
  useAI: boolean = false,
  aiClient?: any
): Promise<DocumentContent["content"]> {
  // First, parse using the core parser (handles headings, paragraphs, lists)
  const content = await parseDocumentCore(file, useAI, aiClient)

  // Then, extract tables separately and merge them into sections
  const tables = await extractTables(file)

  // Merge tables into appropriate sections
  return mergeTablesIntoContent(content, tables)
}

/**
 * Extract tables from Word document
 * @param file Word document file
 * @returns Array of table data
 */
async function extractTables(file: File | Blob): Promise<Array<{ sectionId?: string; table: TableData }>> {
  try {
    // Convert file to ArrayBuffer
    let arrayBuffer: ArrayBuffer
    if (file instanceof File || file instanceof Blob) {
      arrayBuffer = await file.arrayBuffer()
    } else {
      return []
    }

    // Convert to Buffer for mammoth
    if (typeof Buffer === "undefined") {
      return []
    }

    const buffer = Buffer.from(arrayBuffer)

    // Extract HTML to parse tables
    const htmlResult = await mammoth.convertToHtml({ buffer })
    const html = htmlResult.value

    if (!html) {
      return []
    }

    // Parse tables from HTML
    const tables: Array<{ sectionId?: string; table: TableData }> = []
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi
    let match

    while ((match = tableRegex.exec(html)) !== null) {
      const tableHtml = match[1]
      const tableData = parseTableHtml(tableHtml)

      if (tableData && tableData.headers.length > 0) {
        tables.push({ table: tableData })
      }
    }

    return tables
  } catch (error) {
    console.warn("Failed to extract tables:", error)
    return []
  }
}

/**
 * Parse table HTML into structured data
 * @param tableHtml HTML content of a table
 * @returns Table data structure
 */
function parseTableHtml(tableHtml: string): TableData | null {
  try {
    // Extract header row
    const headerMatch = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i)
    if (!headerMatch) {
      return null
    }

    const headerRow = headerMatch[1]
    const headers: string[] = []
    const headerCellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
    let cellMatch

    while ((cellMatch = headerCellRegex.exec(headerRow)) !== null) {
      const cellText = cleanHtmlText(cellMatch[1])
      if (cellText.trim()) {
        headers.push(cellText.trim())
      }
    }

    if (headers.length === 0) {
      return null
    }

    // Extract data rows
    const rows: string[][] = []
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
    let rowMatch
    let isFirstRow = true

    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      // Skip header row
      if (isFirstRow) {
        isFirstRow = false
        continue
      }

      const rowHtml = rowMatch[1]
      const row: string[] = []
      const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi
      let cellMatch

      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const cellText = cleanHtmlText(cellMatch[1])
        row.push(cellText.trim())
      }

      if (row.length > 0) {
        rows.push(row)
      }
    }

    // Limit rows to keep content concise (max 5 rows)
    const limitedRows = rows.slice(0, 5)

    return {
      headers,
      rows: limitedRows,
    }
  } catch (error) {
    console.warn("Failed to parse table HTML:", error)
    return null
  }
}

/**
 * Clean HTML text content
 * @param html HTML string
 * @returns Cleaned text
 */
function cleanHtmlText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Merge tables into document content sections
 * @param content Existing document sections
 * @param tables Extracted tables
 * @returns Content with tables merged into sections
 */
function mergeTablesIntoContent(
  content: DocumentSection[],
  tables: Array<{ sectionId?: string; table: TableData }>
): DocumentSection[] {
  // If no tables, return content as-is
  if (tables.length === 0) {
    return content
  }

  // Add tables to the last section or create a new section
  const updatedContent = [...content]

  // Add tables to the last section (or create a new section if none exists)
  if (updatedContent.length === 0) {
    updatedContent.push({
      id: "section-tables",
      heading: "Tables",
      level: 1,
      blocks: [],
    })
  }

  const lastSection = updatedContent[updatedContent.length - 1]

  // Convert tables to content blocks
  tables.forEach((tableData) => {
    const tableBlock: ContentBlock = {
      type: "table",
      text: `Table with ${tableData.table.headers.length} columns`,
      tableData: tableData.table,
    }
    lastSection.blocks.push(tableBlock)
  })

  return updatedContent
}

/**
 * Export the core parseDocument function for backward compatibility
 */
export { parseDocumentCore as parseDocument }
