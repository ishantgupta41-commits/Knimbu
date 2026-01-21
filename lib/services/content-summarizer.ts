/**
 * Content Summarizer Service
 * Converts long paragraphs into concise bullet points
 */

import { ContentBlock } from "@/lib/types/document"

/**
 * Summarize a paragraph into key points
 * Extracts main ideas and converts to bullet points
 */
export function summarizeParagraph(text: string, maxPoints: number = 2): string[] {
  if (!text || text.trim().length === 0) return []
  
  // If text is already short (less than 100 chars), return as single point (truncated)
  if (text.length < 100) {
    return [text.trim().substring(0, 100)]
  }
  
  // Check if text already contains bullet points or list markers
  if (text.includes('•') || text.includes('-') || text.includes('*') || /^\d+\./.test(text.trim())) {
    // Extract list items
    const items = text.split(/[•\-\*]|\d+\./).filter(item => item.trim().length > 10)
    if (items.length > 0 && items.length <= maxPoints + 1) {
      return items.map(item => item.trim()).filter(item => item.length > 0).slice(0, maxPoints)
    }
  }
  
  // Split by sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15)
  
  // If few sentences, return as bullet points (limit length)
  if (sentences.length <= maxPoints) {
    return sentences
      .map(s => s.trim().substring(0, 150)) // Limit each point to 150 chars
      .filter(s => s.length > 0)
  }
  
  // Extract key sentences (prioritize sentences with numbers, key words, or longer sentences)
  const scoredSentences = sentences.map((s, i) => {
    const trimmed = s.trim()
    let score = trimmed.length
    
    // Boost score for sentences with numbers, dates, percentages
    if (/\d+/.test(trimmed)) score += 20
    if (/percent|%|million|billion|thousand/i.test(trimmed)) score += 15
    if (/important|key|main|primary|critical|essential/i.test(trimmed)) score += 10
    
    return { text: trimmed, score, index: i }
  }).filter(s => s.text.length > 0)
  
  // Sort by score and take top sentences, but maintain original order
  const topScored = scoredSentences.sort((a, b) => b.score - a.score).slice(0, maxPoints)
  const selectedIndices = new Set(topScored.map(s => s.index))
  
  const points = sentences
    .map((s, i) => ({ text: s.trim().substring(0, 150), index: i }))
    .filter((s, i) => selectedIndices.has(i) && s.text.length > 0)
    .map(s => s.text)
  
  return points.length > 0 ? points : [text.substring(0, 150) + "..."]
}

/**
 * Convert content blocks to concise format
 * ALL paragraphs are converted to bullet points - NO PARAGRAPHS ALLOWED
 * Enterprise-grade: Information-dense, bullet-oriented content only
 */
export function makeContentConcise(blocks: ContentBlock[]): ContentBlock[] {
  const conciseBlocks: ContentBlock[] = []
  
  for (const block of blocks) {
    if (block.type === "heading") {
      // Keep headings as-is for structure
      conciseBlocks.push(block)
    } else if (block.type === "paragraph") {
      // CRITICAL: Convert ALL paragraphs to bullet points (NO PARAGRAPHS)
      // This ensures enterprise-grade, bullet-oriented content
      const text = block.text || ""
      
      if (text.trim().length === 0) {
        continue // Skip empty paragraphs
      }
      
      // Always convert to bullet points - even single sentences become bullets
      const points = summarizeParagraph(text, 2) // Max 2 points per paragraph
      
      if (points.length === 0) {
        // If no points extracted, create a single bullet from the text
        const singlePoint = text.trim().substring(0, 120)
        conciseBlocks.push({
          type: "list",
          items: [singlePoint],
        })
      } else {
        points.forEach((point) => {
          conciseBlocks.push({
            type: "list",
            items: [point.trim()],
          })
        })
      }
    } else if (block.type === "list") {
      // Keep lists but limit items for information density
      conciseBlocks.push({
        ...block,
        items: block.items?.slice(0, 5) || [], // Max 5 items per list for density
      })
    } else if (block.type === "table") {
      // Keep tables as-is (already visual and information-dense)
      conciseBlocks.push(block)
    } else {
      // Keep other block types as-is
      conciseBlocks.push(block)
    }
  }
  
  return conciseBlocks
}

/**
 * Limit content per section
 * Enterprise-grade: Information-dense - show more content blocks per section
 * Maximum 6 content blocks per section (excluding headings) for information density
 */
export function limitSectionContent(blocks: ContentBlock[], maxBlocks: number = 6): ContentBlock[] {
  // Always keep headings
  const headings = blocks.filter(b => b.type === "heading")
  const nonHeadings = blocks.filter(b => b.type !== "heading")
  
  // Limit non-heading blocks to max 3
  const limitedNonHeadings = nonHeadings.slice(0, maxBlocks)
  
  // Reconstruct maintaining order
  const result: ContentBlock[] = []
  let nonHeadingIndex = 0
  
  for (const block of blocks) {
    if (block.type === "heading") {
      result.push(block)
    } else {
      if (nonHeadingIndex < maxBlocks) {
        result.push(block)
        nonHeadingIndex++
      }
    }
  }
  
  return result
}
