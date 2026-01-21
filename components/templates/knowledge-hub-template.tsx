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
  CheckCircle2
} from "lucide-react"
import { useState } from "react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)

  // Extract content for sections - Word document content is intelligently mapped
  // Content has already been enriched and mapped by the knowledge extractor
  const getSectionContent = (sectionKey: keyof Sections) => {
    if (!sections[sectionKey]) return []
    
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
      (section) => section.heading.toLowerCase().includes(targetTitle.toLowerCase()) ||
                   targetTitle.toLowerCase().includes(section.heading.toLowerCase())
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
    documentContent.content.forEach((section) => {
      section.blocks.forEach((block) => {
        if (block.type === "list" && block.items) {
          fallbackContent.push(...block.items.slice(0, 3))
        } else if (block.type === "paragraph" && block.text.length > 20) {
          fallbackContent.push(block.text.substring(0, 120))
        }
      })
    })

    return fallbackContent.slice(0, 8)
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
                <button className="flex items-center gap-2 px-4 py-2 bg-[#628F07] text-white rounded-lg hover:bg-[#628F07]/90 transition-colors">
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-medium">Download PDF</span>
                </button>
              )}

              {/* Bookmark Feature - Feature UI Element */}
              {features.aiChatbot && (
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Bookmark">
                  <Bookmark className="h-5 w-5 text-gray-600" />
                </button>
              )}

              {/* Share Feature - Feature UI Element */}
              {features.audioNarration && (
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Share">
                  <Share2 className="h-5 w-5 text-gray-600" />
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
              {/* Overview Section */}
              {sections.about && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-[#628F07]" />
                    <h2 className="text-2xl font-bold text-foreground">Overview</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getSectionContent("about").map((item, index) => (
                      <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#628F07] mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-foreground leading-6">{item}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                      <ul className="space-y-3">
                        {getSectionContent("executiveSummary").map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-[#628F07] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-foreground leading-6">{item}</span>
                          </li>
                        ))}
                      </ul>
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {getSectionContent("additionalresources").slice(0, 6).map((item, index) => (
                      <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow group">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base font-semibold text-foreground">
                              Resource {index + 1}
                            </CardTitle>
                            {/* Accelerator Badge */}
                            {index < 2 && (
                              <span className="px-2 py-1 text-xs font-medium bg-[#628F07]/10 text-[#628F07] rounded-md">
                                Featured
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{item}</p>
                          <button className="flex items-center gap-2 text-sm text-[#628F07] font-medium group-hover:gap-3 transition-all">
                            Learn more
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* Related Articles Section */}
              {sections.relatedreports && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-[#628F07]" />
                    <h2 className="text-2xl font-bold text-foreground">Related Articles</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {getSectionContent("relatedreports").slice(0, 6).map((item, index) => (
                      <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-[#628F07]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-[#628F07]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground leading-6 mb-2">{item}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>5 min read</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQs Section */}
              {sections.asktheauthor && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-[#628F07]" />
                    <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
                  </div>
                  <div className="space-y-3">
                    {getSectionContent("asktheauthor").slice(0, 5).map((item, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-[#628F07]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[#628F07]">Q</span>
                            </div>
                            <p className="text-sm text-foreground leading-6">{item}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
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
