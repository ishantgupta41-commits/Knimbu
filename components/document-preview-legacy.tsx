/**
 * Document Preview Legacy Component
 * 
 * Fallback renderer for templates that haven't been converted to product page layouts
 * This maintains the document-style preview for non-Knowledge Hub templates
 */

"use client"

import { DocumentContent, TemplateConfig } from "@/lib/types/document"
import { generateNavigation } from "@/lib/services/preview-generator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { 
  FileText, 
  Calendar, 
  Users, 
  Tag, 
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  TrendingUp,
  AlertCircle
} from "lucide-react"

interface DocumentPreviewLegacyProps {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
  onClose?: () => void
}

export function DocumentPreviewLegacy({ documentContent, templateConfig, onClose }: DocumentPreviewLegacyProps) {
  const navigation = generateNavigation(documentContent.content, templateConfig.layout.navigationLevels)

  const renderMetadata = (placement: "header" | "sidebar" | "footer") => {
    if (templateConfig.metadataPlacement.authors !== placement) return null

    return (
      <div className={placement === "header" ? "mb-0" : "mb-4"}>
        {placement !== "header" && (
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-[#628F07]" />
            <h3 className="text-sm font-semibold text-foreground">Authors</h3>
          </div>
        )}
        <div className={`flex ${placement === "header" ? "flex-wrap gap-3 items-center" : "flex-col gap-2"}`}>
          {documentContent.document.authors.map((author) => (
            <div 
              key={author.id} 
              className={`flex items-center gap-2 ${placement === "header" ? "bg-gray-50 px-3 py-1.5 rounded-lg" : ""}`}
            >
              {author.image && (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={placement === "header" ? 32 : 28}
                  height={placement === "header" ? 32 : 28}
                  className="rounded-full border-2 border-[#628F07]/20"
                />
              )}
              <span className={`${placement === "header" ? "text-sm font-medium" : "text-sm"} text-foreground`}>
                {author.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDate = (placement: "header" | "sidebar" | "footer") => {
    if (templateConfig.metadataPlacement.date !== placement || !documentContent.document.publicationDate) return null

    return (
      <div className={placement === "header" ? "mb-0" : "mb-4"}>
        <div className={`flex items-center gap-2 ${placement === "header" ? "" : "mb-2"}`}>
          <Calendar className="h-4 w-4 text-[#628F07]" />
          <span className={`text-sm font-medium ${placement === "header" ? "text-foreground" : "text-foreground"}`}>
            {placement === "header" ? documentContent.document.publicationDate : `Published: ${documentContent.document.publicationDate}`}
          </span>
        </div>
      </div>
    )
  }

  const renderCollections = (placement: "header" | "sidebar" | "footer") => {
    if (templateConfig.metadataPlacement.collections !== placement) return null

    return (
      <div className={placement === "header" ? "mb-0" : "mb-4"}>
        {placement !== "header" && (
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-[#628F07]" />
            <h3 className="text-sm font-semibold text-foreground">Collections</h3>
          </div>
        )}
        <div className={`flex ${placement === "header" ? "flex-wrap gap-2" : "flex-col gap-2"}`}>
          {documentContent.document.collections.map((collection) => (
            <span 
              key={collection.id} 
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 font-medium ${
                placement === "header" 
                  ? "bg-[#628F07]/10 text-[#628F07] border border-[#628F07]/20" 
                  : "bg-gray-100 text-foreground"
              } rounded-md`}
            >
              <Tag className="h-3 w-3" />
              {collection.name}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const getHeadingClass = (level: number) => {
    if (level === 1) return templateConfig.typography.headingHierarchy[0] || "text-4xl"
    if (level === 2) return templateConfig.typography.headingHierarchy[1] || "text-3xl"
    return templateConfig.typography.headingHierarchy[2] || templateConfig.typography.headingHierarchy[1] || "text-2xl"
  }

  const sidebarWidth = templateConfig.layout.sidebar === "double" ? "w-64" : templateConfig.layout.sidebar === "single" ? "w-56" : "w-0"

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-white min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Enterprise Header with Visual Elements */}
        {templateConfig.layout.header && (
          <Card className="mb-6 border-2 border-gray-200 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-1 w-12 bg-[#628F07] rounded-full"></div>
                    <span className="text-xs font-semibold text-[#628F07] uppercase tracking-wider">Document</span>
                  </div>
                  <CardTitle className={`${getHeadingClass(1)} ${templateConfig.typography.bodyFont} font-bold mb-2 leading-tight text-foreground`}>
                    {documentContent.document.title}
                  </CardTitle>
                  {documentContent.document.subtitle && (
                    <h2 className={`text-lg ${templateConfig.typography.bodyFont} text-muted-foreground font-medium mb-4`}>
                      {documentContent.document.subtitle}
                    </h2>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-gray-100">
                {renderMetadata("header")}
                {renderDate("header")}
                {renderCollections("header")}
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Enhanced Sidebar Navigation */}
          {templateConfig.layout.sidebar !== "none" && (
            <aside className={`${sidebarWidth} flex-shrink-0`}>
              <Card className="sticky top-4 border border-gray-200 shadow-md bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#628F07]" />
                    <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Contents</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="max-h-[calc(95vh-250px)]">
                    <nav className="space-y-1 pr-2">
                      {navigation.map((item, index) => {
                        const indent = item.level === 1 ? "" : item.level === 2 ? "ml-4" : "ml-8"
                        return (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={`group flex items-center gap-2 py-2 px-2 ${indent} text-sm text-muted-foreground hover:text-[#628F07] hover:bg-[#628F07]/5 rounded-md transition-all ${
                              item.level === 1 ? "font-semibold" : ""
                            }`}
                          >
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="flex-1">{item.title}</span>
                          </a>
                        )
                      })}
                    </nav>
                  </ScrollArea>
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {renderMetadata("sidebar")}
                    {renderDate("sidebar")}
                    {renderCollections("sidebar")}
                  </div>
                </CardContent>
              </Card>
            </aside>
          )}

          {/* Main Content - Enterprise Card-Based Layout */}
          <main className={`flex-1 ${templateConfig.typography.bodyFont} max-w-none`}>
            <div className="grid gap-6">
              {documentContent.content.map((section, sectionIndex) => {
                return (
                  <Card 
                    key={section.id} 
                    id={section.id} 
                    className="border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow bg-white scroll-mt-8"
                  >
                    <CardHeader className="pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#628F07]/10 text-[#628F07] font-bold text-sm">
                          {sectionIndex + 1}
                        </div>
                        <CardTitle className={`${getHeadingClass(section.level)} ${templateConfig.typography.bodyFont} font-bold leading-tight text-foreground flex-1`}>
                          {section.heading}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {/* Information-Dense Grid Layout */}
                      <div className="grid gap-4">
                        {section.blocks.slice(0, 6).map((block, blockIndex) => {
                          // Render headings as visual separators
                          if (block.type === "heading") {
                            const blockHeadingClass = getHeadingClass(block.level || 2)
                            return (
                              <div key={blockIndex} className="mt-6 mb-4 first:mt-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                  <h3 className={`${blockHeadingClass} ${templateConfig.typography.bodyFont} font-bold leading-tight text-foreground`}>
                                    {block.text}
                                  </h3>
                                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                                </div>
                              </div>
                            )
                          }

                          // Render lists as visual bullet cards
                          if (block.type === "list") {
                            return (
                              <div key={blockIndex} className="grid gap-2">
                                {block.items?.slice(0, 5).map((item, itemIndex) => {
                                  const displayText = item.length > 120 ? item.substring(0, 120) + "..." : item
                                  return (
                                    <div
                                      key={itemIndex}
                                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#628F07]/30 hover:bg-[#628F07]/5 transition-all group"
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        <CheckCircle2 className="h-4 w-4 text-[#628F07] group-hover:scale-110 transition-transform" />
                                      </div>
                                      <span className={`${templateConfig.typography.bodyFont} text-sm leading-6 text-foreground flex-1`}>
                                        {displayText}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          }

                          // Render tables with enterprise styling
                          if (block.type === "table" && block.tableData) {
                            return (
                              <Card key={blockIndex} className="border border-gray-200 shadow-sm overflow-hidden">
                                <CardContent className="p-0">
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gradient-to-r from-[#628F07]/10 to-[#628F07]/5">
                                        <tr>
                                          {block.tableData.headers.map((header, headerIndex) => (
                                            <th
                                              key={headerIndex}
                                              className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${templateConfig.typography.bodyFont} text-foreground border-r border-gray-200 last:border-r-0`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <BarChart3 className="h-3 w-3 text-[#628F07]" />
                                                {header.length > 40 ? header.substring(0, 40) + "..." : header}
                                              </div>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-100">
                                        {block.tableData.rows.map((row, rowIndex) => (
                                          <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                            {row.map((cell, cellIndex) => (
                                              <td
                                                key={cellIndex}
                                                className={`px-4 py-3 text-sm ${templateConfig.typography.bodyFont} text-foreground border-r border-gray-100 last:border-r-0`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-[#628F07]/30"></div>
                                                  {cell.length > 80 ? cell.substring(0, 80) + "..." : cell}
                                                </div>
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          }

                          // Convert ALL paragraphs to visual bullet cards (NO PARAGRAPHS)
                          if (block.type === "paragraph") {
                            const text = block.text || ""
                            const displayText = text.length > 120 ? text.substring(0, 120) + "..." : text
                            
                            return (
                              <div
                                key={blockIndex}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#628F07]/30 hover:bg-[#628F07]/5 transition-all group"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <div className="w-2 h-2 rounded-full bg-[#628F07] group-hover:scale-125 transition-transform"></div>
                                </div>
                                <span className={`${templateConfig.typography.bodyFont} text-sm leading-6 text-foreground flex-1`}>
                                  {displayText.replace(/^[•\-\*]\s*/, '')}
                                </span>
                              </div>
                            )
                          }

                          return null
                        })}
                        
                        {/* Show more indicator if content exceeds limit */}
                        {section.blocks.length > 6 && (
                          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                            <AlertCircle className="h-3 w-3" />
                            <span>{section.blocks.length - 6} more items available</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </main>
        </div>

        {/* Footer Metadata */}
        {(templateConfig.metadataPlacement.authors === "footer" ||
          templateConfig.metadataPlacement.date === "footer" ||
          templateConfig.metadataPlacement.collections === "footer") && (
          <Card className="mt-8 border-2 border-gray-200 shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-6">
                {renderMetadata("footer")}
                {renderDate("footer")}
                {renderCollections("footer")}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Close Button */}
        {onClose && (
          <div className="fixed bottom-8 right-8 z-50">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-[#628F07] text-white rounded-lg hover:bg-[#628F07]/90 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <ArrowRight className="h-4 w-4" />
              Close Preview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
