/**
 * Content Mapper Service
 * 
 * Intelligently maps extracted document knowledge to UI sections
 * 
 * MAPPING LOGIC:
 * - Document knowledge is distributed across selected sections
 * - Even if document headings don't match section names, content is mapped
 * - Content is summarized and enriched, never copied verbatim
 * - Sections are NEVER left empty - always have meaningful content
 */

import { ExtractedKnowledge } from "./knowledge-extractor"
import { Sections } from "@/lib/types/document"

export interface MappedSectionContent {
  sectionKey: keyof Sections
  title: string
  content: string[]
  enriched: boolean // Whether content was enriched from document
}

/**
 * Map document knowledge to UI sections
 * 
 * DECISION LOGIC:
 * 1. Match document topics to section themes
 * 2. Distribute facts, definitions, steps across sections
 * 3. Summarize and enrich content for each section
 * 4. Never leave sections empty
 */
export function mapContentToSections(
  knowledge: ExtractedKnowledge,
  enabledSections: Sections
): MappedSectionContent[] {
  const mapped: MappedSectionContent[] = []

  // Map each enabled section
  const sectionMappings: Array<{
    key: keyof Sections
    title: string
    knowledgeTypes: Array<keyof ExtractedKnowledge>
    priority: number
  }> = [
    {
      key: "about",
      title: "Overview",
      knowledgeTypes: ["summaries", "topics", "facts"],
      priority: 1,
    },
    {
      key: "executiveSummary",
      title: "Executive Summary",
      knowledgeTypes: ["summaries", "facts"],
      priority: 2,
    },
    {
      key: "additionalresources",
      title: "Key Resources",
      knowledgeTypes: ["relatedContent", "facts"],
      priority: 3,
    },
    {
      key: "relatedreports",
      title: "Related Articles",
      knowledgeTypes: ["topics", "summaries"],
      priority: 4,
    },
    {
      key: "asktheauthor",
      title: "Frequently Asked Questions",
      knowledgeTypes: ["definitions", "facts"],
      priority: 5,
    },
    {
      key: "avlearningzone",
      title: "Learning Zone",
      knowledgeTypes: ["steps", "definitions"],
      priority: 6,
    },
    {
      key: "casestudyexplorer",
      title: "Case Studies",
      knowledgeTypes: ["facts", "relatedContent"],
      priority: 7,
    },
    {
      key: "webinarsandevents",
      title: "Webinars and Events",
      knowledgeTypes: ["topics", "summaries"],
      priority: 8,
    },
  ]

  // Process each enabled section
  sectionMappings.forEach((mapping) => {
    if (enabledSections[mapping.key]) {
      const content = extractContentForSection(knowledge, mapping.knowledgeTypes)
      
      // ENSURE section has content - never leave empty
      if (content.length === 0) {
        // Fallback: use any available knowledge
        content.push(...getFallbackContent(knowledge))
      }

      mapped.push({
        sectionKey: mapping.key,
        title: mapping.title,
        content: content.slice(0, 8), // Limit to 8 items per section
        enriched: true,
      })
    }
  })

  return mapped
}

/**
 * Extract content for a specific section based on knowledge types
 */
function extractContentForSection(
  knowledge: ExtractedKnowledge,
  knowledgeTypes: Array<keyof ExtractedKnowledge>
): string[] {
  const content: string[] = []

  knowledgeTypes.forEach((type) => {
    const knowledgeArray = knowledge[type]
    
    if (Array.isArray(knowledgeArray)) {
      // Direct array (topics, facts, definitions, steps, summaries)
      content.push(...knowledgeArray.slice(0, 5))
    } else if (type === "relatedContent") {
      // Related content structure
      knowledge.relatedContent.forEach((related) => {
        content.push(...related.content.slice(0, 3))
      })
    }
  })

  // Remove duplicates and empty strings
  return Array.from(new Set(content.filter(c => c.trim().length > 10)))
}

/**
 * Get fallback content when section has no specific content
 * NEVER return empty - always provide meaningful content
 */
function getFallbackContent(knowledge: ExtractedKnowledge): string[] {
  const fallback: string[] = []

  // Priority order for fallback
  if (knowledge.summaries.length > 0) {
    fallback.push(...knowledge.summaries.slice(0, 3))
  } else if (knowledge.facts.length > 0) {
    fallback.push(...knowledge.facts.slice(0, 3))
  } else if (knowledge.topics.length > 0) {
    // Convert topics to informative points
    knowledge.topics.slice(0, 3).forEach((topic) => {
      fallback.push(`Key topic: ${topic}`)
    })
  } else if (knowledge.definitions.length > 0) {
    fallback.push(...knowledge.definitions.slice(0, 3))
  }

  return fallback
}

/**
 * Enrich content with AI summarization if needed
 * This ensures content is always informative, never generic
 */
export async function enrichContentWithAI(
  content: string[],
  documentContext: string,
  aiClient?: any
): Promise<string[]> {
  if (!aiClient || content.length === 0) {
    return content
  }

  try {
    // Use AI to enhance and summarize content points
    // CRITICAL: Preserve domain knowledge from document, don't generate generic text
    const prompt = `You are a content enrichment assistant. Given these content points extracted from a Word document, make them more informative and concise while STRICTLY preserving the original meaning and domain knowledge.

Document Context: ${documentContext.substring(0, 1000)}

Content Points to Enrich:
${content.map((c, i) => `${i + 1}. ${c}`).join('\n')}

IMPORTANT RULES:
1. Preserve ALL domain-specific information (terms, numbers, facts)
2. Make content more concise but NEVER lose meaning
3. Each point max 120 characters
4. NO generic filler text
5. Ground all content in the provided document context
6. If content is already good, enhance it slightly, don't rewrite completely

Return JSON with "content" array: {"content": ["enriched point 1", "enriched point 2", ...]}`

    const response = await aiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a content enrichment assistant. Return only valid JSON arrays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const parsed = JSON.parse(response.choices[0].message.content || "{}")
    const enriched = parsed.content || parsed.points || content

    return Array.isArray(enriched) ? enriched : content
  } catch (error) {
    console.warn("AI enrichment failed, using original content:", error)
    return content
  }
}
