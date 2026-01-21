/**
 * API Route: /api/preview
 * Handles document parsing and preview generation
 */

import { NextRequest, NextResponse } from "next/server"
import { parseDocxDocument } from "@/lib/services/docx-parser"
import { renderTemplatePreview } from "@/lib/services/template-renderer"
import { DocumentContent } from "@/lib/types/document"
import { getTemplateConfig, getTemplateIdFromName } from "@/lib/templates/template-registry"
import OpenAI from "openai"

// Initialize OpenAI client (optional - only if API key is provided)
const getAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

/**
 * API Route: /api/preview
 * 
 * Handles the complete Create button flow:
 * 1. Receives form data (metadata, template, file)
 * 2. Uses docxParser to extract structured content (headings, paragraphs, lists, tables)
 * 3. Uses templateMapper to map content to template layout
 * 4. Uses templateRenderer to generate preview
 * 5. Returns preview data for frontend rendering
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const title = formData.get("title") as string
    const subtitle = formData.get("subtitle") as string
    const publicationDate = formData.get("publicationDate") as string
    const templateName = formData.get("templateName") as string
    const file = formData.get("file") as File | null

    // Debug: Log file info
    if (file) {
      console.log("File received:", {
        name: file.name,
        size: file.size,
        type: file.type,
        isFile: file instanceof File,
      })
    }

    // Parse JSON fields
    const authorsJson = formData.get("authors") as string
    const collectionsJson = formData.get("collections") as string
    const featuresJson = formData.get("features") as string
    const sectionsJson = formData.get("sections") as string
    const acceleratorsJson = formData.get("accelerators") as string
    const publicationOptionsJson = formData.get("publicationOptions") as string

    const authors = authorsJson ? JSON.parse(authorsJson) : []
    const collections = collectionsJson ? JSON.parse(collectionsJson) : []
    const features = featuresJson ? JSON.parse(featuresJson) : {}
    const sections = sectionsJson ? JSON.parse(sectionsJson) : {}
    const accelerators = acceleratorsJson ? JSON.parse(acceleratorsJson) : {}
    const publicationOptions = publicationOptionsJson ? JSON.parse(publicationOptionsJson) : {}

    // Validate required fields
    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    // Get template ID
    const templateId = getTemplateIdFromName(templateName) || "knowledge-hub"
    const templateConfig = getTemplateConfig(templateId)

    if (!templateConfig) {
      return NextResponse.json({ success: false, error: "Invalid template" }, { status: 400 })
    }

    // Parse document if file provided
    let content: DocumentContent["content"] = []
    if (file && file.size > 0) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
      ]
      const fileType = file.type || ""
      const fileName = file.name || ""
      const isValidType =
        validTypes.includes(fileType) ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")

      if (!isValidType) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Please upload a .docx or .doc file." },
          { status: 400 }
        )
      }

      // Verify file is actually a File instance
      if (!(file instanceof File) && !(file instanceof Blob)) {
        console.error("File is not a File or Blob instance:", typeof file, file)
        return NextResponse.json(
          { success: false, error: "Invalid file object received" },
          { status: 400 }
        )
      }

      const aiClient = getAIClient()
      const useAI = process.env.ENABLE_AI_PARSING === "true" && !!aiClient

      try {
        console.log("Starting document parsing with enhanced parser...", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        })
        // STEP 2: Use enhanced docx parser that extracts:
        // - Headings (H1, H2, H3) with proper hierarchy
        // - Paragraphs (converted to concise bullet points)
        // - Lists (bulleted and numbered)
        // - Tables (headers and rows)
        content = await parseDocxDocument(file, useAI, aiClient)
        console.log("Document parsed successfully, sections:", content.length)
      } catch (error) {
        console.error("Document parsing error:", error)
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred"
        return NextResponse.json(
          { success: false, error: "Failed to parse document: " + errorMessage },
          { status: 500 }
        )
      }
    } else {
      // Create empty document structure
      content = [
        {
          id: "section-1",
          heading: "Introduction",
          level: 1,
          blocks: [
            {
              type: "paragraph",
              text: "Document content will appear here after uploading a Word document.",
            },
          ],
        },
      ]
    }

    // Merge user metadata with document content
    const documentContent: DocumentContent = {
      document: {
        title,
        subtitle: subtitle || undefined,
        publicationDate: publicationDate || undefined,
        authors,
        collections,
      },
      content,
    }

    // STEP 3 & 4: Use template renderer which internally:
    // - Maps content to template structure (templateMapper)
    // - Filters sections based on template navigation levels
    // - Applies template-specific transformations
    // - Validates content matches template requirements
    // - Generates preview ready for rendering
    const renderedPreview = renderTemplatePreview(documentContent, templateId)

    // Generate preview response
    const previewResponse = {
      success: true,
      preview: renderedPreview.documentContent,
      templateId,
      templateConfig: renderedPreview.templateConfig,
    }

    return NextResponse.json(previewResponse)
  } catch (error) {
    console.error("Preview generation error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error: " + (error as Error).message },
      { status: 500 }
    )
  }
}
