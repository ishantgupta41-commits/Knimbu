/**
 * API Route: /api/ai-chat
 * Handles AI chat interactions for template modification and Q&A
 */

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { DocumentContent, TemplateConfig, Features, Sections } from "@/lib/types/document"

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

/**
 * POST /api/ai-chat
 * Handles chat messages and template modifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      message,
      messages,
      documentContent,
      templateConfig,
      features,
      sections,
    } = body

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }

    const client = getOpenAIClient()
    if (!client) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      )
    }

    // Determine if this is a modification request or a question
    const isModificationRequest = 
      message.toLowerCase().includes("change") ||
      message.toLowerCase().includes("modify") ||
      message.toLowerCase().includes("update") ||
      message.toLowerCase().includes("edit") ||
      message.toLowerCase().includes("add") ||
      message.toLowerCase().includes("remove") ||
      message.toLowerCase().includes("replace") ||
      message.toLowerCase().includes("make") ||
      message.toLowerCase().includes("set") ||
      message.toLowerCase().includes("adjust")

    // Build system prompt
    const systemPrompt = isModificationRequest
      ? `You are an AI assistant that helps modify web templates. You can:
1. Modify document content (title, subtitle, sections, text, authors, collections)
2. Enable/disable features (languageSwitcher, aiChatbot, audioNarration, complexitySlider, downloadPDF)
3. Enable/disable sections (about, executiveSummary, avlearningzone, casestudyexplorer, webinarsandevents, asktheauthor, additionalresources, relatedreports)

IMPORTANT: You MUST respond with valid JSON only. Use this exact format:

For modifications:
{
  "response": "A friendly message explaining what you changed",
  "updatedContent": { ...full documentContent object with your changes },
  "updatedFeatures": { ...full features object with your changes },
  "updatedSections": { ...full sections object with your changes }
}

For questions only:
{
  "response": "Your answer to the question"
}

Current template structure:
- Title: ${documentContent.document.title}
- Subtitle: ${documentContent.document.subtitle || "None"}
- Template: ${templateConfig.name}
- Features: ${JSON.stringify(features)}
- Sections: ${JSON.stringify(sections)}

When modifying content, preserve the structure. For example:
- documentContent.document.title (string)
- documentContent.document.subtitle (string or undefined)
- documentContent.document.authors (array of {id: number, name: string, image?: string})
- documentContent.document.collections (array of {id: number, name: string})
- documentContent.content (array of sections with heading, level, blocks)

Always return the COMPLETE updated objects, not just the changed parts.`
      : `You are an AI assistant that helps answer questions about web templates. 
Answer questions about the template, its content, features, or sections.
Be helpful and concise.

IMPORTANT: You MUST respond with valid JSON only:
{
  "response": "Your answer to the question"
}

Current template:
- Title: ${documentContent.document.title}
- Subtitle: ${documentContent.document.subtitle || "None"}
- Template: ${templateConfig.name}
- Features: ${JSON.stringify(features)}
- Sections: ${JSON.stringify(sections)}`

    // Build conversation history
    const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4" for better quality
      messages: conversationMessages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    })

    const responseText = completion.choices[0]?.message?.content || ""
    
    try {
      const parsedResponse = JSON.parse(responseText)
      
      // Validate and return response
      return NextResponse.json({
        success: true,
        response: parsedResponse.response || responseText,
        updatedContent: parsedResponse.updatedContent || null,
        updatedFeatures: parsedResponse.updatedFeatures || null,
        updatedSections: parsedResponse.updatedSections || null,
      })
    } catch (parseError) {
      // If response is not JSON, treat it as a simple text response
      return NextResponse.json({
        success: true,
        response: responseText,
      })
    }
  } catch (error) {
    console.error("Error in AI chat:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
