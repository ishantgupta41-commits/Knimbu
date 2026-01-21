"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, X, Check, Info, FileText, BookOpen, Zap, Layers, Grid3x3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { PreviewModal } from "@/components/preview-modal"
import { DocumentContent, TemplateConfig } from "@/lib/types/document"
import { DashboardDocument } from "@/lib/types/dashboard"
import { getTemplateConfig } from "@/lib/templates/template-registry"
import { toast } from "sonner"

interface CreateDocumentViewProps {
  onBack: () => void
  onDocumentCreated?: (document: DashboardDocument) => void
}

const CUSTOM_TEMPLATES = [
  {
    id: 1,
    name: "Knowledge Hub",
    description: "Our organizational standard template. Recommended for reports 20-80 pages long.",
    tags: ["Single sidebar", "H1-H2", "Modern feel"],
    image: "/knowledge-hub-template.jpg",
    clickable: true,
  },
  {
    id: 2,
    name: "Global Economic Prospects",
    description: "Template optimized for reports in the Global Economic Prospects series",
    tags: ["Single sidebar", "H1", "Professional feel"],
    image: "/global-economic-template.jpg",
    clickable: false,
  },
]

const KNIMBU_TEMPLATES = [
  {
    id: 3,
    name: "Academic papers",
    description: "Optimized for academic publications and papers",
    tags: ["Single sidebar", "H1-H2", "Academic feel"],
    image: "/academic-papers-template.jpg",
    clickable: false,
  },
  {
    id: 4,
    name: "In-depth report",
    description: "Optimized for lengthy (80+ page) reports",
    tags: ["Double Sidebar", "H1-H3", "Modern feel"],
    image: "/indepth-report-template.jpg",
    clickable: false,
  },
]

const AUTHORS = [
  { id: 1, name: "Albert Einstein", image: "/albert-einstein-portrait.png" },
  { id: 2, name: "Isaac Newton", image: "/isaac-newton.jpg" },
  { id: 3, name: "Leonardo DaVinci", image: "/leonardo-davinci.jpg" },
  { id: 4, name: "Nikola Tesla", image: "/nikola-tesla.png" },
]

const COLLECTIONS = [
  { id: 1, name: "Technology", icon: Zap },
  { id: 2, name: "Transport", icon: FileText },
  { id: 3, name: "Climate", icon: Grid3x3 },
  { id: 4, name: "Health", icon: Layers },
  { id: 5, name: "Education", icon: BookOpen },
]

const FEATURES = [
  {
    id: "languageSwitcher",
    label: "Language Switcher",
    description: "Allow users to switch between multiple languages",
  },
  { id: "aiChatbot", label: "Knostradamus AI Chatbot", description: "Enable AI-powered Q&A chatbot for document" },
  {
    id: "audioNarration",
    label: "Read Aloud Audio Narration",
    description: "Add audio narration capability to content",
  },
  { id: "complexitySlider", label: "Complexity Slider", description: "Let readers adjust content complexity level" },
  { id: "downloadPDF", label: "Download Print-Ready PDF Button", description: "Enable PDF download option" },
]

const SECTIONS = [
  { name: "About", info: "Learn more about the authors and organization" },
  { name: "Executive Summary", info: "A concise overview of the main findings" },
  { name: "A/V Learning Zone", info: "Multimedia content for enhanced learning" },
  { name: "Case Study Explorer", info: "Real-world case studies and examples" },
  { name: "Webinars and Events", info: "Related webinars and event information" },
  { name: "Ask the Author", info: "Direct Q&A with the document authors" },
  { name: "Additional Resources", info: "External links and supplementary materials" },
  { name: "Related Reports", info: "Other related documents and publications" },
]

const PUBLICATION_OPTIONS = [
  { id: "immediatePublish", label: "Publish immediately", description: "Make this knimbu available right away" },
  { id: "schedulePublish", label: "Schedule publication", description: "Set a specific date and time to publish" },
  { id: "draftOnly", label: "Save as draft", description: "Keep this knimbu private until ready" },
]

export function CreateDocumentView({ onBack, onDocumentCreated }: CreateDocumentViewProps) {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [listedPublicationDate, setListedPublicationDate] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedAuthors, setSelectedAuthors] = useState<number[]>([])
  const [selectedCollections, setSelectedCollections] = useState<number[]>([])
  const [authorSearchQuery, setAuthorSearchQuery] = useState("")
  const [selectedAuthorLetter, setSelectedAuthorLetter] = useState<string | null>(null)

  const [features, setFeatures] = useState({
    languageSwitcher: true,
    aiChatbot: true,
    audioNarration: true,
    complexitySlider: true,
    downloadPDF: true,
  })

  const [sections, setSections] = useState({
    about: true,
    executiveSummary: true,
    avlearningzone: true,
    casestudyexplorer: true,
    webinarsandevents: true,
    asktheauthor: true,
    additionalresources: true,
    relatedreports: true,
  })

  const [accelerators, setAccelerators] = useState({
    prePopulateChapterBanners: true,
    prePopulateSubchapterImages: true,
  })

  const [publicationOption, setPublicationOption] = useState("immediatePublish")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const [publishOnOrgWebsite, setPublishOnOrgWebsite] = useState(false)
  const [publishOnKnimbu, setPublishOnKnimbu] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<{
    documentContent: DocumentContent
    templateConfig: TemplateConfig
  } | null>(null)

  // Debug: Log state changes
  useEffect(() => {
    console.log("Preview state changed:", {
      showPreview,
      hasPreviewData: !!previewData,
      isGeneratingPreview,
    })
  }, [showPreview, previewData, isGeneratingPreview])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 20 * 1024 * 1024) {
      setUploadedFile(file)
    }
  }

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAuthor = (authorId: number) => {
    setSelectedAuthors((prev) => (prev.includes(authorId) ? prev.filter((id) => id !== authorId) : [...prev, authorId]))
  }

  const toggleCollection = (collectionId: number) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId) ? prev.filter((id) => id !== collectionId) : [...prev, collectionId],
    )
  }

  const toggleAccelerator = (key: keyof typeof accelerators) => {
    setAccelerators((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  /**
   * Handle Create button click
   * 
   * Flow:
   * 1. Parse and validate all form inputs using formDataParser service
   * 2. Convert to FormData and send to API
   * 3. API uses docxParser to extract content (headings, paragraphs, lists, tables)
   * 4. API uses templateMapper to map content to selected template layout
   * 5. API uses templateRenderer to generate preview
   * 6. Display preview in modal without page reload
   */
  const handleCreate = async () => {
    setIsGeneratingPreview(true)

    try {
      // STEP 1: Use formDataParser service to parse and validate all form inputs
      // This service handles: title, subtitle, date, authors, collections, features,
      // sections, accelerators, publication options, template selection, and file upload
      const { parseFormData, toFormData } = await import("@/lib/services/form-data-parser")
      
      const formInputs = {
        title,
        subtitle,
        listedPublicationDate,
        selectedTemplate: selectedTemplate || "",
        selectedAuthors,
        selectedCollections,
        features,
        sections,
        accelerators,
        publicationOption,
        publishOnOrgWebsite,
        publishOnKnimbu,
        uploadedFile,
      }

      // Parse and validate form data (throws error if validation fails)
      // Validation includes: required fields, file type/size, template selection
      let parsedData
      try {
        parsedData = parseFormData(formInputs, AUTHORS, COLLECTIONS)
      } catch (validationError) {
        const errorMessage = validationError instanceof Error ? validationError.message : "Validation failed"
        toast.error(errorMessage)
        setIsGeneratingPreview(false)
        return
      }
      
      // Convert parsed data to FormData for API submission
      const formData = toFormData(parsedData)

      // Call API
      const response = await fetch("/api/preview", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = "Failed to generate preview"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}: Failed to generate preview`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("API Response:", result)

      if (result.success) {
        // Get template config
        const templateConfig = getTemplateConfig(result.templateId)
        if (!templateConfig) {
          throw new Error("Invalid template configuration")
        }

        // Set preview data and show modal immediately
        const previewDataToSet = {
          documentContent: result.preview,
          templateConfig,
        }
        
        console.log("Setting preview data:", {
          hasPreviewData: !!previewDataToSet,
          hasDocumentContent: !!result.preview,
          hasTemplateConfig: !!templateConfig,
          templateId: result.templateId,
          title: result.preview?.document?.title,
        })
        
        setPreviewData(previewDataToSet)
        
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          setShowPreview(true)
          console.log("Modal should now be visible")
        })

        toast.success("Preview generated successfully!")

        // Create dashboard document and save it (but don't navigate away yet - let preview show first)
        if (onDocumentCreated) {
          const dashboardDoc: DashboardDocument = {
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: result.preview.document.title,
            subtitle: result.preview.document.subtitle,
            template: templateConfig.name,
            templateId: result.templateId,
            collections: result.preview.document.collections.map((c: any) => c.name),
            createdAt: new Date().toISOString(),
            status: publicationOption === "immediatePublish" ? "published" : "draft",
            documentContent: result.preview,
            image: "/placeholder.jpg", // Default placeholder, can be enhanced later
            views: 0, // Initialize views to 0 for new documents
          }
          // Save document but don't navigate - preview will show
          onDocumentCreated(dashboardDoc)
        }
      } else {
        throw new Error(result.error || "Failed to generate preview")
      }
    } catch (error) {
      console.error("Error generating preview:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to generate preview"
      toast.error(errorMessage)
      console.error("Full error details:", {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      })
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const filteredAuthors = AUTHORS.filter((author) => {
    const matchesSearch = author.name.toLowerCase().includes(authorSearchQuery.toLowerCase())
    const matchesLetter = !selectedAuthorLetter || author.name.charAt(0).toUpperCase() === selectedAuthorLetter
    return matchesSearch && matchesLetter
  })

  const uniqueLetters = Array.from(new Set(AUTHORS.map((a) => a.name.charAt(0).toUpperCase()))).sort()

  const SectionTooltip = ({ description }: { description: string }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    return (
      <div className="relative inline-block">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="ml-1 inline-block"
          type="button"
        >
          <Info className="h-3 w-3 text-gray-400" />
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 rounded-md bg-gray-800 px-2 py-1 text-xs text-white whitespace-nowrap z-10">
            {description}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create New Knimbu</h1>
        <p className="text-muted-foreground">These properties can be adjusted prior to publishing</p>
      </div>

      {/* 1. Document Details */}
      <Card>
        <CardHeader>
          <CardTitle>1. Document Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              placeholder="Enter subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Listed Publication Date</Label>
            <Input
              id="date"
              type="date"
              value={listedPublicationDate}
              onChange={(e) => setListedPublicationDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Collections Section */}
      <Card>
        <CardHeader>
          <CardTitle>2. Collections</CardTitle>
          <CardDescription>
            Select collections for this knimbu. New collections can be created in the Collections section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((collection) => {
              const IconComponent = collection.icon
              return (
                <div
                  key={collection.id}
                  onClick={() => toggleCollection(collection.id)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedCollections.includes(collection.id) ? "border-[#628F07] bg-green-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <p className="font-medium text-sm">{collection.name}</p>
                  </div>
                  {selectedCollections.includes(collection.id) && <Check className="mt-2 h-4 w-4 text-[#628F07]" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Authors Section */}
      <Card>
        <CardHeader>
          <CardTitle>3. Authors</CardTitle>
          <CardDescription>
            Select the author/s of this knimbu. New Authors can be created in the Authors section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Search authors..."
              value={authorSearchQuery}
              onChange={(e) => setAuthorSearchQuery(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedAuthorLetter(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedAuthorLetter === null ? "bg-[#628F07] text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                All
              </button>
              {uniqueLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedAuthorLetter(letter)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedAuthorLetter === letter ? "bg-[#628F07] text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredAuthors.map((author) => (
              <div
                key={author.id}
                onClick={() => toggleAuthor(author.id)}
                className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                  selectedAuthors.includes(author.id) ? "border-[#628F07] bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="mb-3 flex justify-center">
                  <Image
                    src={author.image || "/placeholder.svg"}
                    alt={author.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                </div>
                <p className="font-medium text-sm">{author.name}</p>
                {selectedAuthors.includes(author.id) && <Check className="mx-auto mt-2 h-4 w-4 text-[#628F07]" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Select Template */}
      <Card>
        <CardHeader>
          <CardTitle>4. Select Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplateModal(true)}
            className="w-full justify-start border-2 border-dashed hover:border-[#628F07] hover:text-[#628F07]"
          >
            {selectedTemplate ? `Selected: ${selectedTemplate}` : "Click to select a template"}
          </Button>
          {showTemplateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="max-h-[80vh] w-full max-w-3xl overflow-y-auto">
                <CardHeader className="sticky top-0 flex flex-row items-center justify-between bg-background">
                  <CardTitle>Template Library</CardTitle>
                  <button onClick={() => setShowTemplateModal(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* My Organization's Templates */}
                  <div>
                    <h3 className="mb-4 font-semibold text-foreground">My Organization's Templates</h3>
                    <div className="space-y-3">
                      {CUSTOM_TEMPLATES.map((template) => (
                        <div
                          key={template.id}
                          className={`cursor-pointer rounded-lg border-2 p-4 transition-colors overflow-hidden ${
                            template.clickable
                              ? "border-gray-200 hover:border-[#628F07]"
                              : "border-gray-100 opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (template.clickable) {
                              setSelectedTemplate(template.name)
                              setShowTemplateModal(false)
                            }
                          }}
                        >
                          <div className="flex gap-4">
                            <Image
                              src={template.image || "/placeholder.svg"}
                              alt={template.name}
                              width={150}
                              height={120}
                              className="rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{template.name}</p>
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {template.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {template.clickable && selectedTemplate === template.name && (
                              <Check className="h-5 w-5 text-[#628F07]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Knimbu Templates */}
                  <div>
                    <h3 className="mb-4 font-semibold text-foreground">Knimbu Templates</h3>
                    <div className="space-y-3">
                      {KNIMBU_TEMPLATES.map((template) => (
                        <div key={template.id} className="rounded-lg border-2 border-gray-100 p-4 opacity-50">
                          <div className="flex gap-4">
                            <Image
                              src={template.image || "/placeholder.svg"}
                              alt={template.name}
                              width={150}
                              height={120}
                              className="rounded-md object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{template.name}</p>
                              <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {template.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Features */}
      <Card>
        <CardHeader>
          <CardTitle>5. Features</CardTitle>
          <CardDescription>Select which features to include in your knimbu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {FEATURES.map(({ id, label, description }) => (
              <div key={id} className="flex items-start space-x-2">
                <Checkbox
                  id={id}
                  checked={features[id as keyof typeof features]}
                  onCheckedChange={() => toggleFeature(id as keyof typeof features)}
                />
                <div className="flex items-center gap-1">
                  <Label htmlFor={id} className="cursor-pointer">
                    {label}
                  </Label>
                  <SectionTooltip description={description} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. Sections */}
      <Card>
        <CardHeader>
          <CardTitle>6. Sections</CardTitle>
          <CardDescription>
            Select which sections to include in your knimbu (in addition to the main content)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {SECTIONS.map(({ name, info }) => {
              const sectionKey = name.toLowerCase().replace(/\s+/g, "") as keyof typeof sections
              return (
                <div key={name} className="flex items-center space-x-2">
                  <Checkbox
                    id={name}
                    checked={sections[sectionKey] ?? true}
                    onCheckedChange={() => toggleSection(sectionKey)}
                  />
                  <div className="flex items-center gap-1">
                    <Label htmlFor={name} className="cursor-pointer">
                      {name}
                    </Label>
                    <SectionTooltip description={info} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 7. Accelerators */}
      <Card>
        <CardHeader>
          <CardTitle>7. Accelerators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pre-Populate Text from Word Document */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground">Pre-Populate text from a Microsoft Word document</h3>
              <span className="text-xs font-medium text-[#628F07]">Highly recommended</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Pre-populate headers, body text, and boxes using a formatted Microsoft Word document.
            </p>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#628F07] transition-colors cursor-pointer">
              <label htmlFor="acceleratorUpload" className="cursor-pointer">
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Click to upload document</p>
                <p className="text-xs text-gray-500">DOCX or DOC files up to 20MB</p>
                <input
                  id="acceleratorUpload"
                  type="file"
                  accept=".doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploadedFile && <p className="text-sm text-green-600 font-medium">{uploadedFile.name} uploaded</p>}
            <a href="#" className="flex items-center gap-2 text-sm text-[#628F07] hover:underline">
              <Info className="h-4 w-4" />
              Tutorial: Correctly formatting your Word document
            </a>
          </div>

          {/* Pre-Populate Images */}
          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold text-foreground">Pre-Populate images</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bannerImages"
                  checked={accelerators.prePopulateChapterBanners}
                  onCheckedChange={() => toggleAccelerator("prePopulateChapterBanners")}
                />
                <Label htmlFor="bannerImages" className="cursor-pointer text-sm">
                  Auto-insert banner images for each chapter (H1)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="regularImages"
                  checked={accelerators.prePopulateSubchapterImages}
                  onCheckedChange={() => toggleAccelerator("prePopulateSubchapterImages")}
                />
                <Label htmlFor="regularImages" className="cursor-pointer text-sm">
                  Auto-insert regular images for each sub-chapter (H2)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8. Publication Options */}
      <Card>
        <CardHeader>
          <CardTitle>8. Publication Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publishOrgWebsite"
              checked={publishOnOrgWebsite}
              onCheckedChange={(checked) => setPublishOnOrgWebsite(checked as boolean)}
            />
            <Label htmlFor="publishOrgWebsite" className="cursor-pointer">
              Publish on organizational website
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publishKnimbu"
              checked={publishOnKnimbu}
              onCheckedChange={(checked) => setPublishOnKnimbu(checked as boolean)}
            />
            <Label htmlFor="publishKnimbu" className="cursor-pointer">
              Publish on knimbu.com
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Create Button - Centered */}
      <div className="flex justify-center">
        <Button
          size="lg"
          style={{ backgroundColor: "#628F07" }}
          className="px-12 text-white hover:opacity-90"
          disabled={isGeneratingPreview || !title.trim()}
          onClick={handleCreate}
        >
          {isGeneratingPreview ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Preview...
            </>
          ) : (
            "Create"
          )}
        </Button>
      </div>

      {/* Preview Modal - Always render when previewData exists, control visibility with open prop */}
      {previewData && (
        <PreviewModal
          open={showPreview}
          onOpenChange={(open) => {
            console.log("PreviewModal onOpenChange:", open)
            setShowPreview(open)
          }}
          documentContent={previewData.documentContent}
          templateConfig={previewData.templateConfig}
        />
      )}
    </div>
  )
}
