/**
 * Knowledge Extractor Service
 * 
 * Extracts meaningful knowledge from parsed document content:
 * - Key topics and themes
 * - Facts, definitions, and explanations
 * - Steps, processes, and methodologies
 * - Related content groupings
 * 
 * CRITICAL: The document MUST contribute content - never ignore it
 */

import { DocumentContent, DocumentSection, ContentBlock } from "@/lib/types/document"

export interface ExtractedKnowledge {
  topics: string[]
  facts: string[]
  definitions: string[]
  steps: string[]
  summaries: string[]
  relatedContent: Array<{
    topic: string
    content: string[]
  }>
}

/**
 * Extract knowledge from document content
 * This is MANDATORY - document content must be understood and structured
 */
export function extractKnowledge(documentContent: DocumentContent): ExtractedKnowledge {
  const knowledge: ExtractedKnowledge = {
    topics: [],
    facts: [],
    definitions: [],
    steps: [],
    summaries: [],
    relatedContent: [],
  }

  // Process each section to extract knowledge
  documentContent.content.forEach((section) => {
    extractFromSection(section, knowledge)
  })

  // ALWAYS extract fallback knowledge to ensure we have content
  // This guarantees sections are never empty - document MUST contribute
  if (knowledge.topics.length === 0 && knowledge.facts.length === 0 && knowledge.summaries.length === 0) {
    extractFallbackKnowledge(documentContent, knowledge)
  }

  // Final safeguard: if still no knowledge, use document metadata
  // NEVER return empty knowledge - document must always contribute
  if (knowledge.topics.length === 0 && knowledge.facts.length === 0 && knowledge.summaries.length === 0) {
    // Use title and subtitle as knowledge
    if (documentContent.document.title) {
      knowledge.topics.push(documentContent.document.title)
      knowledge.summaries.push(`Document: ${documentContent.document.title}`)
    }
    if (documentContent.document.subtitle) {
      knowledge.summaries.push(documentContent.document.subtitle)
    }
    // Add any available text from content
    documentContent.content.forEach((section) => {
      section.blocks.forEach((block) => {
        if (block.type === "paragraph" && block.text.length > 10) {
          knowledge.summaries.push(block.text.substring(0, 150))
        }
      })
    })
  }

  return knowledge
}

/**
 * Extract knowledge from a document section
 */
function extractFromSection(section: DocumentSection, knowledge: ExtractedKnowledge) {
  const sectionText = section.heading.toLowerCase()
  
  // Extract topics from headings
  if (section.heading && section.heading.length > 3) {
    knowledge.topics.push(section.heading)
  }

  // Process blocks to extract different types of knowledge
  section.blocks.forEach((block) => {
    if (block.type === "list" && block.items) {
      // Lists often contain facts, steps, or definitions
      block.items.forEach((item) => {
        const itemLower = item.toLowerCase()
        
        if (isDefinition(item)) {
          knowledge.definitions.push(item)
        } else if (isStep(item)) {
          knowledge.steps.push(item)
        } else if (isFact(item)) {
          knowledge.facts.push(item)
        } else {
          // General knowledge point
          knowledge.facts.push(item)
        }
      })
    } else if (block.type === "paragraph") {
      // Extract knowledge from paragraphs
      const text = block.text
      if (text.length > 20) {
        // Check if it's a definition
        if (isDefinition(text)) {
          knowledge.definitions.push(text)
        } else if (isFact(text)) {
          knowledge.facts.push(text)
        } else {
          // Create summary point
          const summary = summarizeText(text, 120)
          if (summary) {
            knowledge.summaries.push(summary)
          }
        }
      }
    } else if (block.type === "heading") {
      // Headings are topics
      if (block.text && block.text.length > 3) {
        knowledge.topics.push(block.text)
      }
    } else if (block.type === "table" && block.tableData) {
      // Extract knowledge from tables
      extractFromTable(block.tableData, knowledge)
    }
  })

  // Group related content by section
  if (section.blocks.length > 0) {
    const sectionContent: string[] = []
    section.blocks.forEach((block) => {
      if (block.type === "list" && block.items) {
        sectionContent.push(...block.items)
      } else if (block.type === "paragraph") {
        sectionContent.push(block.text)
      }
    })

    if (sectionContent.length > 0) {
      knowledge.relatedContent.push({
        topic: section.heading,
        content: sectionContent,
      })
    }
  }
}

/**
 * Extract knowledge from table data
 */
function extractFromTable(tableData: { headers: string[]; rows: string[][] }, knowledge: ExtractedKnowledge) {
  // Headers are topics
  knowledge.topics.push(...tableData.headers.filter(h => h.length > 2))

  // Extract facts from table cells
  tableData.rows.forEach((row) => {
    row.forEach((cell) => {
      if (cell.length > 10 && cell.length < 200) {
        knowledge.facts.push(cell)
      }
    })
  })
}

/**
 * Check if text is a definition (contains "is", "means", "refers to", etc.)
 */
function isDefinition(text: string): boolean {
  const definitionPatterns = [
    /\b(is|are|means|refers to|defined as|can be defined)\b/i,
    /^[A-Z][^.]*:\s/, // Pattern: "Term: definition"
  ]
  return definitionPatterns.some(pattern => pattern.test(text))
}

/**
 * Check if text is a step (contains numbers, "first", "then", etc.)
 */
function isStep(text: string): boolean {
  const stepPatterns = [
    /^\d+[\.\)]\s/, // "1. " or "1) "
    /\b(first|second|third|then|next|finally|step|process)\b/i,
  ]
  return stepPatterns.some(pattern => pattern.test(text))
}

/**
 * Check if text is a fact (contains numbers, statistics, dates)
 */
function isFact(text: string): boolean {
  const factPatterns = [
    /\d+/, // Contains numbers
    /\b(percent|%|million|billion|thousand|year|date)\b/i,
  ]
  return factPatterns.some(pattern => pattern.test(text))
}

/**
 * Summarize text to a concise point (max length)
 */
function summarizeText(text: string, maxLength: number): string | null {
  if (text.length <= maxLength) {
    return text
  }

  // Extract first sentence or key phrase
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length > 0) {
    const firstSentence = sentences[0].trim()
    if (firstSentence.length <= maxLength) {
      return firstSentence
    }
    // Truncate intelligently
    return firstSentence.substring(0, maxLength - 3) + "..."
  }

  // Fallback: truncate
  return text.substring(0, maxLength - 3) + "..."
}

/**
 * Extract fallback knowledge when document is sparse
 * NEVER leave knowledge empty - always extract something meaningful
 */
function extractFallbackKnowledge(documentContent: DocumentContent, knowledge: ExtractedKnowledge) {
  // Use document title as main topic
  if (documentContent.document.title) {
    knowledge.topics.push(documentContent.document.title)
  }

  // Extract from subtitle
  if (documentContent.document.subtitle) {
    knowledge.summaries.push(documentContent.document.subtitle)
  }

  // Extract from any available content
  documentContent.content.forEach((section) => {
    section.blocks.forEach((block) => {
      if (block.type === "paragraph" && block.text) {
        const summary = summarizeText(block.text, 150)
        if (summary) {
          knowledge.summaries.push(summary)
        }
      } else if (block.type === "list" && block.items) {
        knowledge.facts.push(...block.items.slice(0, 3))
      }
    })
  })
}
