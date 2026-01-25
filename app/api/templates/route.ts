/**
 * API Route: /api/templates
 * Handles template storage and retrieval with user-based access control
 */

import { NextRequest, NextResponse } from "next/server"
import { DocumentContent, TemplateConfig } from "@/lib/types/document"
import { getTemplateConfig } from "@/lib/templates/template-registry"
import { saveTemplate, getAllTemplates, StoredTemplate } from "@/lib/storage/template-store"
import { randomUUID } from "crypto"

/**
 * GET /api/templates
 * Get all templates for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from auth (dummy for now - replace with real auth)
    // In production, get from session/JWT token
    const userId = request.headers.get("x-user-id") || "default-user"
    
    // Get all templates for user
    const userTemplates = await getAllTemplates(userId)
    const templatesWithoutUserId = userTemplates.map(({ userId, ...template }) => template) // Remove userId from response
    
    return NextResponse.json({
      success: true,
      templates: templatesWithoutUserId
    })
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/templates
 * Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth (dummy for now - replace with real auth)
    const userId = request.headers.get("x-user-id") || "default-user"
    
    const body = await request.json()
    const { documentContent, templateId, features, sections } = body

    if (!documentContent || !templateId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const templateConfig = getTemplateConfig(templateId)
    if (!templateConfig) {
      return NextResponse.json(
        { success: false, error: "Invalid template ID" },
        { status: 400 }
      )
    }

    // Generate pure UUID
    const id = randomUUID()
    const now = new Date().toISOString()

    // Create template object
    const template: StoredTemplate = {
      id,
      userId,
      documentContent,
      templateConfig,
      features: features || {},
      sections: sections || {},
      createdAt: now,
      updatedAt: now
    }

    // Store template
    await saveTemplate(template)

    // Return template without userId
    const { userId: _, ...templateData } = template

    return NextResponse.json({
      success: true,
      template: templateData
    })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 }
    )
  }
}
