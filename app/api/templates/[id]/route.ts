/**
 * API Route: /api/templates/[id]
 * Handles individual template retrieval with user-based access control
 */

import { NextRequest, NextResponse } from "next/server"
import { getTemplate, saveTemplate } from "@/lib/storage/template-store"

/**
 * GET /api/templates/[id]
 * Get a specific template (only if user owns it)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user ID from auth (dummy for now - replace with real auth)
    // In production, get from session/JWT token
    const userId = request.headers.get("x-user-id") || "default-user"
    
    // Pass userId in case table has composite key
    const template = await getTemplate(id, userId)

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }

    // Check if user owns this template
    if (template.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    // Log template structure for debugging
    console.log("Template retrieved:", {
      hasDocumentContent: !!template.documentContent,
      hasDocument: !!template.documentContent?.document,
      documentContentKeys: template.documentContent ? Object.keys(template.documentContent) : [],
      documentKeys: template.documentContent?.document ? Object.keys(template.documentContent.document) : []
    })

    // Validate and fix template structure if needed
    if (!template.documentContent) {
      console.error("Template missing documentContent:", template)
      return NextResponse.json(
        { success: false, error: "Template data is corrupted: missing documentContent" },
        { status: 500 }
      )
    }

    // If documentContent exists but document is missing, try to fix it
    if (!template.documentContent.document) {
      console.warn("Template missing document structure, attempting to reconstruct")
      // Check if documentContent has the data at root level
      if (template.documentContent.title) {
        template.documentContent = {
          document: {
            title: template.documentContent.title,
            subtitle: template.documentContent.subtitle,
            authors: template.documentContent.authors || [],
            collections: template.documentContent.collections || [],
            publicationDate: template.documentContent.publicationDate
          },
          content: template.documentContent.content || []
        }
      } else {
        console.error("Cannot reconstruct template structure:", template.documentContent)
        return NextResponse.json(
          { success: false, error: "Template data is corrupted: invalid structure" },
          { status: 500 }
        )
      }
    }
    
    // Ensure content array exists
    if (!template.documentContent.content || !Array.isArray(template.documentContent.content)) {
      console.warn("Template missing content array, initializing empty array")
      template.documentContent.content = []
    }
    
    // Ensure document.collections exists
    if (!template.documentContent.document.collections || !Array.isArray(template.documentContent.document.collections)) {
      template.documentContent.document.collections = []
    }
    
    // Ensure document.authors exists
    if (!template.documentContent.document.authors || !Array.isArray(template.documentContent.document.authors)) {
      template.documentContent.document.authors = []
    }

    // Remove userId from response
    const { userId: _, ...templateData } = template

    return NextResponse.json({
      success: true,
      template: templateData
    })
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch template" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/templates/[id]
 * Update a template (only if user owns it)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user ID from auth
    const userId = request.headers.get("x-user-id") || "default-user"
    
    // Pass userId in case table has composite key
    const template = await getTemplate(id, userId)

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 }
      )
    }

    // Check if user owns this template
    if (template.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      )
    }

    // Get updated data from request body
    const body = await request.json()
    const { documentContent, features, sections } = body

    // Update template
    const updatedTemplate = {
      ...template,
      documentContent: documentContent || template.documentContent,
      features: features || template.features,
      sections: sections || template.sections,
      updatedAt: new Date().toISOString(),
    }

    // Save updated template
    await saveTemplate(updatedTemplate)

    // Remove userId from response
    const { userId: _, ...templateData } = updatedTemplate

    return NextResponse.json({
      success: true,
      template: templateData
    })
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update template" },
      { status: 500 }
    )
  }
}
