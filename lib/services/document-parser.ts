/**
 * Document Parser Service
 * Handles Word document parsing with AI assistance
 */

import mammoth from "mammoth"
import { DocumentContent, DocumentSection, ContentBlock } from "@/lib/types/document"

/**
 * AI Prompt for document parsing
 */
export const DOCUMENT_PARSING_PROMPT = `You are a document parsing assistant. Your task is to analyze extracted Word document content and structure it into a clean, hierarchical format.

RULES:
1. Identify headings (H1, H2, H3) based on formatting, size, and context
2. Group paragraphs under their nearest heading
3. Preserve document order strictly
4. Do NOT invent content - only use what's provided
5. Do NOT change meaning or add sections
6. Clean up formatting artifacts but preserve text content
7. Ignore images and tables for now

Return a JSON structure:
{
  "sections": [
    {
      "id": "section-1",
      "heading": "Section Title",
      "level": 1,
      "blocks": [
        { "type": "paragraph", "text": "..." }
      ]
    }
  ]
}

If no clear headings exist, create a single section with all content as paragraphs.`

/**
 * Parse Word document using mammoth
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
  
  // Parse with mammoth using Buffer (Node.js format)
  const result = await mammoth.extractRawText({ buffer })
  
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
 * Extract structured content from raw text using deterministic parsing
 */
export function extractContentDeterministic(rawText: string): DocumentContent["content"] {
  const lines = rawText.split("\n").filter((line) => line.trim().length > 0)
  const sections: DocumentSection[] = []
  let currentSection: DocumentSection | null = null
  let sectionCounter = 1

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect headings based on patterns
    // H1: Usually all caps, short, or starts with number
    // H2: Starts with number or is short capitalized
    // H3: Indented or shorter lines

    const isLikelyH1 =
      trimmed.length < 100 &&
      (trimmed === trimmed.toUpperCase() ||
        /^\d+\.?\s+[A-Z]/.test(trimmed) ||
        /^Chapter\s+\d+/i.test(trimmed))

    const isLikelyH2 =
      trimmed.length < 150 &&
      (/^\d+\.\d+/.test(trimmed) || /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmed))

    const isLikelyH3 = trimmed.length < 200 && /^\d+\.\d+\.\d+/.test(trimmed)

    if (isLikelyH1) {
      // Save current section if exists
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        id: `section-${sectionCounter++}`,
        heading: trimmed,
        level: 1,
        blocks: [],
      }
    } else if (isLikelyH2 && currentSection) {
      // Subsection under current section
      currentSection.blocks.push({
        type: "heading",
        text: trimmed,
        level: 2,
      })
    } else if (isLikelyH3 && currentSection) {
      // Sub-subsection
      currentSection.blocks.push({
        type: "heading",
        text: trimmed,
        level: 3,
      })
    } else if (currentSection) {
      // Regular paragraph
      currentSection.blocks.push({
        type: "paragraph",
        text: trimmed,
      })
    } else {
      // No section yet, create one
      currentSection = {
        id: `section-${sectionCounter++}`,
        heading: "Introduction",
        level: 1,
        blocks: [
          {
            type: "paragraph",
            text: trimmed,
          },
        ],
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
      blocks: lines.map((line) => ({
        type: "paragraph",
        text: line.trim(),
      })),
    })
  }

  return sections
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
    // Use AI to improve structure detection
    const response = await aiClient.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4 for better accuracy
      messages: [
        {
          role: "system",
          content: DOCUMENT_PARSING_PROMPT,
        },
        {
          role: "user",
          content: `Parse this document:\n\n${rawText.substring(0, 8000)}`, // Limit token usage
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistency
    })

    const parsed = JSON.parse(response.choices[0].message.content || "{}")
    return parsed.sections || extractContentDeterministic(rawText)
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

  if (useAI && aiClient) {
    return enhanceWithAI(rawText, aiClient)
  }

  return extractContentDeterministic(rawText)
}
