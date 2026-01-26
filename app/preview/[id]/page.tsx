"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DocumentPreview } from "@/components/document-preview"
import { AIChatbot } from "@/components/ai-chatbot"
import { DocumentContent, TemplateConfig, Features, Sections } from "@/lib/types/document"
import { Loader2, Rocket, CheckCircle2, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [template, setTemplate] = useState<{
    documentContent: DocumentContent
    templateConfig: TemplateConfig
    features: Features
    sections: Sections
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDeployed, setIsDeployed] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  
  // State for AI-modified template
  const [currentContent, setCurrentContent] = useState<DocumentContent | null>(null)
  const [currentFeatures, setCurrentFeatures] = useState<Features | null>(null)
  const [currentSections, setCurrentSections] = useState<Sections | null>(null)

  useEffect(() => {
    // Fetch template - no authentication required for published templates
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        
        // Fetch without authentication - published templates are public
        const response = await fetch(`/api/templates/${params.id}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Template not found")
          } else if (response.status === 403) {
            setError("You don't have access to this template")
          } else {
            setError("Failed to load template")
          }
          return
        }

        const data = await response.json()
        if (data.success && data.template) {
          // Validate and ensure documentContent structure is correct
          const template = data.template
          
          // Ensure documentContent has the correct structure
          if (!template.documentContent || !template.documentContent.document) {
            console.error("Invalid template structure:", template)
            setError("Template data is invalid or corrupted")
            return
          }
          
          setTemplate(template)
          // Initialize current state with template data
          setCurrentContent(template.documentContent)
          setCurrentFeatures(template.features || {})
          setCurrentSections(template.sections || {})
        } else {
          setError(data.error || "Failed to load template")
        }
      } catch (err) {
        console.error("Error fetching template:", err)
        setError("Failed to load template")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#628F07]" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#628F07] text-white rounded-lg hover:bg-[#628F07]/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleDeploy = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    try {
      setIsDeploying(true)
      const userId = localStorage.getItem("knimbu_user_id") || "default-user"
      
      const response = await fetch(`/api/templates/${params.id}/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        }
      })

      const data = await response.json()

      if (data.success) {
        setIsDeployed(true)
        setDeployedUrl(data.deployedUrl || window.location.href)
        toast.success("Template deployed successfully!")
      } else {
        toast.error(data.error || "Failed to deploy template")
      }
    } catch (err) {
      console.error("Error deploying template:", err)
      toast.error("Failed to deploy template")
    } finally {
      setIsDeploying(false)
    }
  }

  const handleTemplateChange = (
    updatedContent: DocumentContent,
    updatedFeatures: Features,
    updatedSections: Sections
  ) => {
    setCurrentContent(updatedContent)
    setCurrentFeatures(updatedFeatures)
    setCurrentSections(updatedSections)
    // Force re-render of DocumentPreview
    setTemplate({
      documentContent: updatedContent,
      templateConfig: template!.templateConfig,
      features: updatedFeatures,
      sections: updatedSections,
    })
  }

  const handleRepublish = async (
    updatedContent: DocumentContent,
    updatedFeatures: Features,
    updatedSections: Sections
  ) => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    try {
      const userId = localStorage.getItem("knimbu_user_id") || "default-user"
      
      // Update the template in the backend
      const response = await fetch(`/api/templates/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          documentContent: updatedContent,
          features: updatedFeatures,
          sections: updatedSections,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Template republished successfully!")
        // Reload the page to show updated template
        window.location.reload()
      } else {
        toast.error(data.error || "Failed to republish template")
      }
    } catch (error) {
      console.error("Error republishing template:", error)
      toast.error("Failed to republish template")
    }
  }

  const handleDiscard = () => {
    if (template) {
      setCurrentContent(template.documentContent)
      setCurrentFeatures(template.features)
      setCurrentSections(template.sections)
      setTemplate({
        documentContent: template.documentContent,
        templateConfig: template.templateConfig,
        features: template.features,
        sections: template.sections,
      })
      toast.info("Changes discarded")
    }
  }

  if (!template || !currentContent || !currentFeatures || !currentSections) {
    return null
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Action Buttons Bar - Sticky at top */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-[#628F07] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button
              onClick={async () => {
                // Republish current template state
                await handleRepublish(currentContent, currentFeatures, currentSections)
              }}
              className="bg-[#628F07] hover:bg-[#628F07]/90 text-white"
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Republish
            </Button>
          )}
          {isAuthenticated && (
            <>
              {isDeployed ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Deployed</span>
                </div>
              ) : (
                <Button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  variant="outline"
                  size="sm"
                  className="border-[#628F07] text-[#628F07] hover:bg-[#628F07]/10"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-3 w-3 mr-2" />
                      Deploy
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Document Preview with current state */}
      <DocumentPreview
        key={JSON.stringify(currentContent)} // Force re-render when content changes
        documentContent={currentContent}
        templateConfig={template.templateConfig}
        features={currentFeatures}
        sections={currentSections}
      />

      {/* AI Chatbot - Only show if authenticated */}
      {isAuthenticated && (
        <AIChatbot
          documentContent={template.documentContent}
          templateConfig={template.templateConfig}
          features={template.features}
          sections={template.sections}
          onTemplateChange={handleTemplateChange}
          onRepublish={handleRepublish}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  )
}
