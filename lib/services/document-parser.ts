/**
 * Document Parser Service
 * Handles Word document parsing with AI assistance
 */

import mammoth from "mammoth"
import { DocumentContent, DocumentSection, ContentBlock } from "@/lib/types/document"
import { makeContentConcise, limitSectionContent } from "@/lib/services/content-summarizer"

/**
 * Enhanced AI Prompt for intelligent document parsing with concise content extraction
 */
export const DOCUMENT_PARSING_PROMPT = `You are an expert document parsing assistant specializing in extracting structured, concise content from Word documents. Your task is to intelligently analyze the document and create a well-organized hierarchical structure with ONLY essential information.

ANALYSIS GUIDELINES:
1. HEADING DETECTION - Identify headings using multiple signals:
   - Text formatting patterns (all caps, bold, larger text)
   - Numbering patterns (1., 1.1, 1.1.1, Chapter X, Section X)
   - Positional context (appears before paragraphs, standalone lines)
   - Length patterns (H1: typically 3-80 chars, H2: 3-100 chars, H3: 3-120 chars)
   - Common heading words (Introduction, Summary, Conclusion, Chapter, Section, Part)

2. CONTENT EXTRACTION - Extract ONLY KEY INFORMATION IN BULLET POINT FORMAT:
   - For each section, extract MAXIMUM 2-3 key points or main ideas
   - Convert ALL paragraphs into concise bullet points (format: "• key point")
   - Focus ONLY on main concepts, findings, conclusions, and actionable items
   - Skip ALL repetitive content, examples, and verbose explanations
   - Each bullet point should be MAXIMUM 100 characters
   - Preserve important facts, numbers, dates, and key statements only

3. CONTENT ORGANIZATION:
   - Group key points under their nearest preceding heading
   - Maintain strict document order - never reorder content
   - Limit to MAXIMUM 2-3 content blocks per section (excluding headings)
   - Keep only the MOST essential information

4. TEXT PROCESSING:
   - Clean up formatting artifacts (extra spaces, line breaks)
   - Condense verbose paragraphs into essential points
   - Remove filler words and redundant phrases
   - Extract key facts, statistics, and important statements
   - Preserve important data (numbers, percentages, dates)

5. STRUCTURE RULES:
   - H1 (Level 1): Main chapters/sections (usually numbered 1, 2, 3 or Chapter X)
   - H2 (Level 2): Subsections (usually numbered 1.1, 1.2 or under main sections)
   - H3 (Level 3): Sub-subsections (usually numbered 1.1.1, 1.1.2)
   - If a line is ALL CAPS and short, it's likely H1
   - If a line starts with number pattern (X.Y), it's likely H2
   - If a line starts with number pattern (X.Y.Z), it's likely H3

6. CONTENT CONDENSATION RULES - ALL CONTENT AS BULLET POINTS:
   - ALL paragraphs: Convert to 1-2 bullet points maximum
   - Each bullet point: MAXIMUM 100 characters
   - Long paragraphs (>200 chars): Extract ONLY 2 key points
   - Medium paragraphs (100-200 chars): Convert to 1 concise bullet point
   - Short paragraphs (<100 chars): Convert to 1 bullet point (truncate if needed)
   - Multiple similar paragraphs: Combine into single bullet point
   - Examples and case studies: Skip or summarize in one bullet point
   - Lists: Keep only top 2-3 items maximum

7. WHAT TO INCLUDE:
   - Main findings and conclusions
   - Key statistics and data points
   - Important recommendations
   - Critical information and facts
   - Action items and next steps

8. WHAT TO EXCLUDE:
   - Repetitive explanations
   - Verbose descriptions
   - Multiple examples of the same concept
   - Background information that's not essential
   - Filler content and transitions

Return ONLY valid JSON in this exact structure:
{
  "sections": [
    {
      "id": "section-1",
      "heading": "Exact Heading Text",
      "level": 1,
      "blocks": [
        { "type": "list", "items": ["Key point 1 (max 100 chars)"] },
        { "type": "list", "items": ["Key point 2 (max 100 chars)"] },
        { "type": "heading", "text": "Subheading text", "level": 2 }
      ]
    }
  ]
}

CRITICAL: 
- ALL content must be in bullet point format (use "list" type with items array)
- Each bullet point should be MAXIMUM 100 characters
- Extract ONLY 2-3 key points per section maximum
- Format: Use { "type": "list", "items": ["bullet point 1", "bullet point 2"] }
- Return ONLY the JSON object, no additional text or explanation.`

/**
 * Parse Word document using mammoth with HTML extraction for better structure
 * This function is used in Next.js API routes (Node.js environment)
 * Mammoth requires { buffer: Buffer } in Node.js
 */
export async function parseWordDocument(file: File | Blob): Promise<string> {
  // Convert file to ArrayBuffer first
  let arrayBuffer: ArrayBuffer
  if (file instanceof File || file instanceof Blob) {
    arrayBuffer = await file.arrayBuffer()
  } else {
    throw new Error("Invalid file type. Expected File or Blob.")
  }
  
  // Ensure we have a valid buffer
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("Invalid file: empty or corrupted")
  }
  
  // Convert ArrayBuffer to Buffer for Node.js
  // Mammoth in Node.js requires { buffer: Buffer }, not { arrayBuffer: ArrayBuffer }
  if (typeof Buffer === "undefined") {
    throw new Error("Buffer is not available. This function requires Node.js environment.")
  }
  
  const buffer = Buffer.from(arrayBuffer)
  if (!buffer || buffer.length === 0) {
    throw new Error("Failed to convert file to Buffer")
  }
  
  // Try to extract HTML first for better structure detection, fallback to raw text
  let result
  try {
    // Extract HTML which preserves more structure
    const htmlResult = await mammoth.convertToHtml({ buffer })
    if (htmlResult.value) {
      // Convert HTML to text while preserving structure
      // This helps identify headings better
      const htmlText = htmlResult.value
      // Extract text from HTML, preserving line breaks for headings
      const textWithStructure = htmlText
        .replace(/<h1[^>]*>/gi, '\n\n#HEADING1# ')
        .replace(/<h2[^>]*>/gi, '\n\n#HEADING2# ')
        .replace(/<h3[^>]*>/gi, '\n\n#HEADING3# ')
        .replace(/<h4[^>]*>/gi, '\n\n#HEADING3# ')
        .replace(/<h5[^>]*>/gi, '\n\n#HEADING3# ')
        .replace(/<h6[^>]*>/gi, '\n\n#HEADING3# ')
        .replace(/<p[^>]*>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '') // Remove remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        .trim()
      
      result = { value: textWithStructure, messages: htmlResult.messages }
    } else {
      // Fallback to raw text extraction
      result = await mammoth.extractRawText({ buffer })
    }
  } catch (error) {
    console.warn("HTML extraction failed, falling back to raw text:", error)
    // Fallback to raw text extraction
    result = await mammoth.extractRawText({ buffer })
  }
  
  // Check for mammoth errors/warnings
  if (result.messages && result.messages.length > 0) {
    const errors = result.messages.filter(m => m.type === "error")
    if (errors.length > 0) {
      const errorMessages = errors.map(e => e.message).join("; ")
      console.warn("Mammoth parsing warnings:", errorMessages)
    }
  }
  
  return result.value
}

/**
 * Extract structured content from raw text using enhanced deterministic parsing
 */
export function extractContentDeterministic(rawText: string): DocumentContent["content"] {
  // Check for heading markers from HTML extraction
  const hasHeadingMarkers = rawText.includes('#HEADING1#') || rawText.includes('#HEADING2#') || rawText.includes('#HEADING3#')
  
  let lines: string[] = []
  
  if (hasHeadingMarkers) {
    // Process text with heading markers
    const parts = rawText.split(/(#HEADING\d+#)/)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.match(/#HEADING\d+#/)) {
        // This is a heading marker, next part is the heading text
        if (parts[i + 1]) {
          lines.push(part + parts[i + 1].trim())
          i++ // Skip next part as we've already included it
        }
      } else if (part.trim()) {
        // Regular content
        const contentLines = part.split('\n').filter(l => l.trim())
        lines.push(...contentLines)
      }
    }
  } else {
    // Standard line-by-line processing
    lines = rawText.split("\n").filter((line) => line.trim().length > 0)
  }
  
  const sections: DocumentSection[] = []
  let currentSection: DocumentSection | null = null
  let sectionCounter = 1

  for (const line of lines) {
    const trimmed = line.trim()
    
    // Check for heading markers first
    let headingLevel: number | null = null
    let headingText = trimmed
    
    if (trimmed.includes('#HEADING1#')) {
      headingLevel = 1
      headingText = trimmed.replace('#HEADING1#', '').trim()
    } else if (trimmed.includes('#HEADING2#')) {
      headingLevel = 2
      headingText = trimmed.replace('#HEADING2#', '').trim()
    } else if (trimmed.includes('#HEADING3#')) {
      headingLevel = 3
      headingText = trimmed.replace('#HEADING3#', '').trim()
    }

    // Detect headings based on enhanced patterns
    const isLikelyH1 = headingLevel === 1 || (
      trimmed.length > 0 && trimmed.length < 100 &&
      (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 80 ||
        /^(Chapter|Part|Section)\s+\d+/i.test(trimmed) ||
        /^\d+\.?\s+[A-Z]/.test(trimmed) ||
        /^[A-Z][A-Z\s]{2,79}$/.test(trimmed)) &&
      !trimmed.endsWith('.') && !trimmed.endsWith(',')
    )

    const isLikelyH2 = headingLevel === 2 || (
      trimmed.length > 0 && trimmed.length < 150 &&
      (/^\d+\.\d+\s/.test(trimmed) ||
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,10}$/.test(trimmed) && !trimmed.includes('.') && trimmed.length < 100)
    )

    const isLikelyH3 = headingLevel === 3 || (
      trimmed.length > 0 && trimmed.length < 200 &&
      /^\d+\.\d+\.\d+\s/.test(trimmed)
    )

    if (headingLevel === 1 || isLikelyH1) {
      // Save current section if exists
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        id: `section-${sectionCounter++}`,
        heading: headingText || trimmed,
        level: 1,
        blocks: [],
      }
    } else if (headingLevel === 2 || (isLikelyH2 && currentSection)) {
      // Subsection under current section
      if (headingLevel === 2) {
        currentSection.blocks.push({
          type: "heading",
          text: headingText || trimmed,
          level: 2,
        })
      } else {
        // Convert to subsection if we detect H2 pattern
        if (currentSection.blocks.length === 0) {
          // If section has no content, it might be a misidentified H2
          currentSection.heading = trimmed
        } else {
          currentSection.blocks.push({
            type: "heading",
            text: trimmed,
            level: 2,
          })
        }
      }
    } else if (headingLevel === 3 || (isLikelyH3 && currentSection)) {
      // Sub-subsection
      currentSection.blocks.push({
        type: "heading",
        text: headingText || trimmed,
        level: 3,
      })
    } else if (currentSection) {
      // Regular paragraph - ALWAYS convert to list/bullets (NO PARAGRAPHS)
      // Enterprise-grade: All content must be bullet-oriented
      if (trimmed.length > 0) {
        // Extract key sentences and convert to bullet points
        const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 15)
        if (sentences.length > 0) {
          // Limit to 2-3 key sentences, convert each to a bullet point
          const keySentences = sentences.slice(0, 3)
          keySentences.forEach((sentence) => {
            if (currentSection.blocks.filter(b => b.type === "list").length < 5) {
              currentSection.blocks.push({
                type: "list",
                items: [sentence.trim().substring(0, 120)],
              })
            }
          })
        } else {
          // If no sentences found, create single bullet from text
          if (currentSection.blocks.filter(b => b.type === "list").length < 5) {
            currentSection.blocks.push({
              type: "list",
              items: [trimmed.substring(0, 120)],
            })
          }
        }
      }
    } else {
      // No section yet, create one
      currentSection = {
        id: `section-${sectionCounter++}`,
        heading: trimmed.length < 100 ? trimmed : "Introduction",
        level: 1,
        blocks: trimmed.length >= 100 ? [{
          type: "paragraph",
          text: trimmed,
        }] : [],
      }
    }
  }

  // Add final section
  if (currentSection) {
    sections.push(currentSection)
  }

  // If no sections created, create a default one
  if (sections.length === 0) {
    sections.push({
      id: "section-1",
      heading: "Document Content",
      level: 1,
      blocks: lines.slice(0, 5).map((line) => ({
        type: "paragraph",
        text: line.trim().substring(0, 200), // Limit length
      })),
    })
  }

  // Limit content per section before returning (max 6 blocks per section for information density)
  return sections.map((section) => ({
    ...section,
    blocks: limitSectionContent(makeContentConcise(section.blocks), 6),
  }))
}

/**
 * Enhance parsing with AI (optional, for better accuracy)
 */
export async function enhanceWithAI(
  rawText: string,
  aiClient?: any
): Promise<DocumentContent["content"]> {
  if (!aiClient) {
    // Fallback to deterministic parsing
    return extractContentDeterministic(rawText)
  }

  try {
    // Split document into chunks if too long (max 12000 chars per chunk for better context)
    const maxChunkSize = 12000
    const chunks: string[] = []
    
    if (rawText.length <= maxChunkSize) {
      chunks.push(rawText)
    } else {
      // Split by sections/paragraphs to maintain context
      const paragraphs = rawText.split(/\n\n+/)
      let currentChunk = ""
      
      for (const para of paragraphs) {
        if (currentChunk.length + para.length > maxChunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk)
          currentChunk = para
        } else {
          currentChunk += (currentChunk ? "\n\n" : "") + para
        }
      }
      if (currentChunk) chunks.push(currentChunk)
    }

    // Process first chunk with AI (most important for structure)
    const firstChunk = chunks[0]
    const response = await aiClient.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o for better accuracy if available
      messages: [
        {
          role: "system",
          content: DOCUMENT_PARSING_PROMPT,
        },
        {
          role: "user",
          content: `Parse this document section. Extract ALL content and structure it properly:\n\n${firstChunk}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Slightly higher for better understanding
      max_tokens: 4000, // Allow more tokens for detailed parsing
    })

    const parsed = JSON.parse(response.choices[0].message.content || "{}")
    const aiSections = parsed.sections || []
    
    // If we have multiple chunks, process remaining with deterministic parsing
    if (chunks.length > 1) {
      const remainingText = chunks.slice(1).join("\n\n")
      const remainingSections = extractContentDeterministic(remainingText)
      // Merge sections, ensuring proper ordering
      return [...aiSections, ...remainingSections]
    }
    
    return aiSections.length > 0 ? aiSections : extractContentDeterministic(rawText)
  } catch (error) {
    console.error("AI parsing failed, falling back to deterministic:", error)
    return extractContentDeterministic(rawText)
  }
}

/**
 * Main parsing function
 */
export async function parseDocument(
  file: File,
  useAI: boolean = false,
  aiClient?: any
): Promise<DocumentContent["content"]> {
  const rawText = await parseWordDocument(file)

  let content: DocumentContent["content"]
  
  if (useAI && aiClient) {
    content = await enhanceWithAI(rawText, aiClient)
  } else {
    content = extractContentDeterministic(rawText)
  }

  // Make content concise - convert to bullet points and limit content (max 6 blocks per section for information density)
  const conciseContent = content.map((section) => ({
    ...section,
    blocks: limitSectionContent(makeContentConcise(section.blocks), 6),
  }))

  return conciseContent
}
