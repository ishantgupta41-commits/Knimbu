/**
 * Knowledge Hub Template Component
 * 
 * Renders a product page layout matching the Knowledge Hub reference design
 * NOT a document preview - this is a full product page with:
 * - Hero banner
 * - Search bar
 * - Filter panel
 * - Card-based content grid
 * - Feature UI elements
 * - Section blocks
 * 
 * Layout is controlled by template selection, NOT by document structure
 */

"use client"

import { DocumentContent, TemplateConfig, Features, Sections } from "@/lib/types/document"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import {
  Search,
  Filter,
  Globe,
  Download,
  Bookmark,
  Share2,
  ChevronDown,
  X,
  Calendar,
  Users,
  Tag,
  FileText,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Pause
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface KnowledgeHubTemplateProps {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
  features: Features
  sections: Sections
  onClose?: () => void
}

export function KnowledgeHubTemplate({
  documentContent,
  templateConfig,
  features,
  sections,
  onClose
}: KnowledgeHubTemplateProps) {
  // Validate documentContent structure with detailed logging
  if (!documentContent) {
    console.error("documentContent is null/undefined:", documentContent)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Template</h1>
          <p className="text-gray-600">The template data is missing.</p>
        </div>
      </div>
    )
  }
  
  if (!documentContent.document) {
    console.error("documentContent.document is missing:", {
      documentContent,
      keys: Object.keys(documentContent || {}),
      type: typeof documentContent
    })
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Template</h1>
          <p className="text-gray-600">The template document structure is invalid.</p>
          <p className="text-sm text-gray-500 mt-2">Please check the console for details.</p>
        </div>
      </div>
    )
  }
  
  // Ensure content array exists
  if (!documentContent.content || !Array.isArray(documentContent.content)) {
    console.warn("documentContent.content is missing or not an array, initializing empty array")
    documentContent.content = []
  }
  
  // Ensure document has required fields
  if (!documentContent.document.title) {
    console.warn("Document missing title, using default")
    documentContent.document.title = "Untitled Document"
  }
  
  // Ensure document.collections exists
  if (!documentContent.document.collections || !Array.isArray(documentContent.document.collections)) {
    documentContent.document.collections = []
  }
  
  // Ensure document.authors exists
  if (!documentContent.document.authors || !Array.isArray(documentContent.document.authors)) {
    documentContent.document.authors = []
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<keyof Sections | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      // Cleanup: stop any ongoing speech when component unmounts
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Handle read aloud functionality
  const handleReadAloud = () => {
    if (!synthRef.current) {
      alert("Your browser doesn't support text-to-speech")
      return
    }

    if (isPlaying && !isPaused) {
      // Pause
      synthRef.current.pause()
      setIsPaused(true)
    } else if (isPaused) {
      // Resume
      synthRef.current.resume()
      setIsPaused(false)
    } else {
      // Start reading
      const textToRead = [
        documentContent.document.title,
        documentContent.document.subtitle || "",
        ...(documentContent.content || []).map(section => 
          `${section.heading || ""}. ${(section.blocks || []).map(block => 
            block.type === "paragraph" ? block.text : 
            block.type === "list" && block.items ? block.items.join(". ") : ""
          ).filter(Boolean).join(" ")}`
        )
      ].filter(Boolean).join(". ")

      const utterance = new SpeechSynthesisUtterance(textToRead)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setIsPaused(false)
      }

      utteranceRef.current = utterance
      synthRef.current.speak(utterance)
      setIsPlaying(true)
      setIsPaused(false)
    }
  }

  // Stop reading
  const stopReading = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopReading()
    }
  }, [])

  // Handle PDF download
  const handleDownloadPDF = () => {
    // Create a simple HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${documentContent.document.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #628F07; font-size: 32px; margin-bottom: 10px; }
            h2 { color: #628F07; font-size: 24px; margin-top: 30px; margin-bottom: 15px; }
            h3 { color: #628F07; font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
            p { line-height: 1.6; margin-bottom: 15px; }
            ul { margin-left: 20px; margin-bottom: 15px; }
            li { margin-bottom: 8px; }
            .metadata { color: #666; font-size: 14px; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <h1>${documentContent.document.title}</h1>
          ${documentContent.document.subtitle ? `<h2>${documentContent.document.subtitle}</h2>` : ''}
          <div class="metadata">
            ${documentContent.document.authors.length > 0 ? `<p><strong>Authors:</strong> ${documentContent.document.authors.map(a => a.name).join(", ")}</p>` : ''}
            ${documentContent.document.publicationDate ? `<p><strong>Publication Date:</strong> ${documentContent.document.publicationDate}</p>` : ''}
          </div>
          ${(documentContent.content || []).map(section => `
            <h${section.level}>${section.heading || "Section"}</h${section.level}>
            ${(section.blocks || []).map(block => {
              if (block.type === "paragraph" && block.text) {
                return `<p>${block.text}</p>`
              } else if (block.type === "list" && block.items && Array.isArray(block.items)) {
                return `<ul>${block.items.map(item => `<li>${item}</li>`).join("")}</ul>`
              }
              return ""
            }).join("")}
          `).join("")}
        </body>
      </html>
    `

    // Create a blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${documentContent.document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Note: For actual PDF generation, you'd need a library like jsPDF or html2pdf
    // This creates an HTML file that can be printed to PDF
  }

  // Filter content based on search query
  const filterContentBySearch = (content: string[]) => {
    if (!searchQuery.trim()) return content
    const query = searchQuery.toLowerCase()
    return content.filter(item => item.toLowerCase().includes(query))
  }

  // Extract content for sections - Word document content is intelligently mapped
  // Content has already been enriched and mapped by the knowledge extractor
  const getSectionContent = (sectionKey: keyof Sections) => {
    if (!sections[sectionKey]) return []
    
    // Ensure content array exists
    if (!documentContent.content || !Array.isArray(documentContent.content)) {
      console.warn("documentContent.content is not available for section:", sectionKey)
      return []
    }
    
    // Find matching section in document content (by title or key)
    const sectionTitles: Record<keyof Sections, string> = {
      about: "Overview",
      executiveSummary: "Executive Summary",
      additionalresources: "Key Resources",
      relatedreports: "Related Articles",
      asktheauthor: "Frequently Asked Questions",
      avlearningzone: "Learning Zone",
      casestudyexplorer: "Case Studies",
      webinarsandevents: "Webinars and Events",
    }

    const targetTitle = sectionTitles[sectionKey]
    
    // Find section by title match
    const matchingSection = documentContent.content.find(
      (section) => section && section.heading && (
        section.heading.toLowerCase().includes(targetTitle.toLowerCase()) ||
        targetTitle.toLowerCase().includes(section.heading.toLowerCase())
      )
    )

    if (matchingSection) {
      // Extract content from matching section
      const content: string[] = []
      matchingSection.blocks.forEach((block) => {
        if (block.type === "list" && block.items) {
          content.push(...block.items)
        } else if (block.type === "paragraph") {
          content.push(block.text)
        }
      })
      return content.slice(0, 8) // Limit to 8 items
    }

    // Fallback: use first available content from document
    // NEVER return empty - always provide meaningful content
    const fallbackContent: string[] = []
    if (documentContent.content && Array.isArray(documentContent.content)) {
      documentContent.content.forEach((section) => {
        if (section && section.blocks && Array.isArray(section.blocks)) {
          section.blocks.forEach((block) => {
            if (block.type === "list" && block.items && Array.isArray(block.items)) {
              fallbackContent.push(...block.items.slice(0, 3))
            } else if (block.type === "paragraph" && block.text && block.text.length > 20) {
              fallbackContent.push(block.text.substring(0, 120))
            }
          })
        }
      })
    }

    const content = fallbackContent.slice(0, 8)
    return filterContentBySearch(content)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* HEADER WITH FEATURES */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#628F07] rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Knimbu</span>
            </div>

            {/* Feature UI Elements - Only render if feature is enabled */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Feature UI Element */}
              {features.languageSwitcher && (
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-foreground">EN</span>
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                </button>
              )}

              {/* Download Feature - Feature UI Element */}
              {features.downloadPDF && (
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#628F07] text-white rounded-lg hover:bg-[#628F07]/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download PDF</span>
                </button>
              )}

              {/* Read Aloud Feature - Feature UI Element */}
              {features.audioNarration && (
                <button 
                  onClick={handleReadAloud}
                  className={`p-2 rounded-lg transition-colors ${
                    isPlaying ? "bg-[#628F07]/10 text-[#628F07]" : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title={isPlaying ? (isPaused ? "Resume reading" : "Pause reading") : "Read aloud"}
                >
                  {isPlaying && !isPaused ? (
                    <Pause className="h-5 w-5" />
                  ) : isPaused ? (
                    <Play className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
              )}

              {/* Bookmark Feature - Feature UI Element */}
              {features.aiChatbot && (
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Bookmark">
                  <Bookmark className="h-5 w-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO BANNER - Mandatory for Knowledge Hub */}
      <section className="bg-gradient-to-r from-[#628F07] to-[#7ab317] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              {documentContent.document.title}
            </h1>
            {documentContent.document.subtitle && (
              <p className="text-xl text-white/90 mb-6">
                {documentContent.document.subtitle}
              </p>
            )}
            
            {/* Metadata in Hero */}
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              {documentContent.document.authors.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {documentContent.document.authors.map(a => a.name).join(", ")}
                  </span>
                </div>
              )}
              {documentContent.document.publicationDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{documentContent.document.publicationDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR - Mandatory for Knowledge Hub */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content, resources, articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#628F07] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* FILTER PANEL - Mandatory for Knowledge Hub */}
          <aside className="w-64 flex-shrink-0">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#628F07]" />
                  <CardTitle className="text-sm font-bold">Filters</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Collections Filter */}
                {documentContent.document.collections.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Collections</h3>
                    <div className="space-y-2">
                      {documentContent.document.collections.map((collection) => (
                        <button
                          key={collection.id}
                          onClick={() => setSelectedCollection(
                            selectedCollection === collection.name ? null : collection.name
                          )}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCollection === collection.name
                              ? "bg-[#628F07]/10 text-[#628F07] font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{collection.name}</span>
                            {selectedCollection === collection.name && (
                              <X className="h-3 w-3" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Authors Filter */}
                {documentContent.document.authors.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-600 uppercase mb-2">Authors</h3>
                    <div className="space-y-2">
                      {documentContent.document.authors.map((author) => (
                        <button
                          key={author.id}
                          onClick={() => setSelectedAuthor(
                            selectedAuthor === author.name ? null : author.name
                          )}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedAuthor === author.name
                              ? "bg-[#628F07]/10 text-[#628F07] font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {author.image && (
                              <Image
                                src={author.image}
                                alt={author.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            )}
                            <span>{author.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* CONTENT GRID - Card-based layout */}
          <main className="flex-1">
            <div className="space-y-8">
              {/* Section Navigation - Clickable sections */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(sections).map(([key, enabled]) => {
                  if (!enabled) return null
                  const sectionNames: Record<string, string> = {
                    about: "Overview",
                    executiveSummary: "Executive Summary",
                    additionalresources: "Key Resources",
                    relatedreports: "Related Articles",
                    asktheauthor: "FAQs",
                    avlearningzone: "Learning Zone",
                    casestudyexplorer: "Case Studies",
                    webinarsandevents: "Webinars & Events",
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedSection(selectedSection === key ? null : key as keyof Sections)
                        // Stop reading when switching sections
                        if (isPlaying) stopReading()
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedSection === key
                          ? "bg-[#628F07] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sectionNames[key] || key}
                    </button>
                  )
                })}
              </div>

              {/* Filter content based on selected filters */}
              {(() => {
                // Safely filter content if it exists
                if (!documentContent.content || !Array.isArray(documentContent.content)) {
                  return null
                }
                
                const filteredContent = documentContent.content.filter(section => {
                  if (selectedCollection) {
                    const collections = documentContent.document?.collections || []
                    const hasCollection = collections.some(
                      (c: any) => c.name === selectedCollection
                    )
                    if (!hasCollection) return false
                  }
                  if (selectedAuthor) {
                    const authors = documentContent.document?.authors || []
                    const hasAuthor = authors.some(
                      (a: any) => a.name === selectedAuthor
                    )
                    if (!hasAuthor) return false
                  }
                  return true
                })
                return null // Filters are applied to the sections display, not content filtering
              })()}

              {/* Show selected section in one box, or show all sections */}
              {selectedSection ? (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-[#628F07]" />
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedSection === "about" ? "Overview" :
                       selectedSection === "executiveSummary" ? "Executive Summary" :
                       selectedSection === "additionalresources" ? "Key Resources" :
                       selectedSection === "relatedreports" ? "Related Articles" :
                       selectedSection === "asktheauthor" ? "Frequently Asked Questions" :
                       selectedSection === "avlearningzone" ? "Learning Zone" :
                       selectedSection === "casestudyexplorer" ? "Case Studies" :
                       selectedSection === "webinarsandevents" ? "Webinars and Events" : selectedSection}
                    </h2>
                  </div>
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {getSectionContent(selectedSection).map((item, index) => (
                          <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                            <div className="w-2 h-2 rounded-full bg-[#628F07] mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-foreground leading-6 flex-1">{item}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              ) : (
                <>
                  {/* Overview Section */}
                  {sections.about && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-[#628F07]" />
                        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
                      </div>
                      <Card className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {getSectionContent("about").map((item, index) => (
                              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-[#628F07] mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-foreground leading-6 flex-1">{item}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}

                  {/* Executive Summary Section */}
                  {sections.executiveSummary && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-[#628F07]" />
                        <h2 className="text-2xl font-bold text-foreground">Executive Summary</h2>
                      </div>
                      <Card className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {getSectionContent("executiveSummary").map((item, index) => (
                              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                <CheckCircle2 className="h-5 w-5 text-[#628F07] flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-foreground leading-6 flex-1">{item}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}

                  {/* Key Resources Section */}
                  {sections.additionalresources && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Tag className="h-5 w-5 text-[#628F07]" />
                        <h2 className="text-2xl font-bold text-foreground">Key Resources</h2>
                      </div>
                      <Card className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {getSectionContent("additionalresources").slice(0, 6).map((item, index) => (
                              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-[#628F07] mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-foreground leading-6 flex-1">{item}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}

                  {/* Related Articles Section */}
                  {sections.relatedreports && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-[#628F07]" />
                        <h2 className="text-2xl font-bold text-foreground">Related Articles</h2>
                      </div>
                      <Card className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {getSectionContent("relatedreports").slice(0, 6).map((item, index) => (
                              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-[#628F07] mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-foreground leading-6 flex-1">{item}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}

                  {/* FAQs Section */}
                  {sections.asktheauthor && (
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-[#628F07]" />
                        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
                      </div>
                      <Card className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {getSectionContent("asktheauthor").slice(0, 5).map((item, index) => (
                              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                                <div className="w-6 h-6 bg-[#628F07]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-[#628F07]">Q</span>
                                </div>
                                <p className="text-sm text-foreground leading-6 flex-1">{item}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-[#628F07] text-white rounded-lg hover:bg-[#628F07]/90 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <X className="h-4 w-4" />
            Close Preview
          </button>
        </div>
      )}
    </div>
  )
}
