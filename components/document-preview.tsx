/**
 * Document Preview Component
 * Renders document preview based on template configuration
 */

"use client"

import { DocumentContent, TemplateConfig } from "@/lib/types/document"
import { generateNavigation } from "@/lib/services/preview-generator"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface DocumentPreviewProps {
  documentContent: DocumentContent
  templateConfig: TemplateConfig
  onClose?: () => void
}

export function DocumentPreview({ documentContent, templateConfig, onClose }: DocumentPreviewProps) {
  const navigation = generateNavigation(documentContent.content, templateConfig.layout.navigationLevels)

  const renderMetadata = (placement: "header" | "sidebar" | "footer") => {
    if (templateConfig.metadataPlacement.authors !== placement) return null

    return (
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Authors</h3>
        <div className="flex flex-wrap gap-2">
          {documentContent.document.authors.map((author) => (
            <div key={author.id} className="flex items-center gap-2">
              {author.image && (
                <Image
                  src={author.image}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-sm">{author.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDate = (placement: "header" | "sidebar" | "footer") => {
    if (templateConfig.metadataPlacement.date !== placement || !documentContent.document.publicationDate) return null

    return (
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">Published: {documentContent.document.publicationDate}</span>
      </div>
    )
  }

  const renderCollections = (placement: "header" | "sidebar" | "footer") => {
    if (templateConfig.metadataPlacement.collections !== placement) return null

    return (
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Collections</h3>
        <div className="flex flex-wrap gap-2">
          {documentContent.document.collections.map((collection) => (
            <span key={collection.id} className="text-xs px-2 py-1 bg-gray-100 rounded">
              {collection.name}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const getHeadingClass = (level: number) => {
    if (level === 1) return templateConfig.typography.headingHierarchy[0]
    if (level === 2) return templateConfig.typography.headingHierarchy[1]
    return templateConfig.typography.headingHierarchy[2] || templateConfig.typography.headingHierarchy[1]
  }

  const sidebarWidth = templateConfig.layout.sidebar === "double" ? "w-64" : "w-48"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        {templateConfig.layout.header && (
          <header className="border-b pb-6 mb-8">
            <h1 className={`${getHeadingClass(1)} font-bold mb-2`}>{documentContent.document.title}</h1>
            {documentContent.document.subtitle && (
              <h2 className="text-xl text-muted-foreground mb-4">{documentContent.document.subtitle}</h2>
            )}
            {renderMetadata("header")}
            {renderDate("header")}
            {renderCollections("header")}
          </header>
        )}

        {/* Main Content Area */}
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          {templateConfig.layout.sidebar !== "none" && (
            <aside className={`${sidebarWidth} flex-shrink-0 border-r pr-6`}>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <nav className="sticky top-4">
                  <h3 className="text-sm font-semibold mb-4">Contents</h3>
                  <div className="space-y-1">
                    {navigation.map((item) => {
                      const indent = item.level === 1 ? "" : item.level === 2 ? "ml-4" : "ml-8"
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block py-2 ${indent} text-sm hover:text-[#628F07] transition-colors`}
                        >
                          {item.title}
                        </a>
                      )
                    })}
                  </div>
                  {renderMetadata("sidebar")}
                  {renderDate("sidebar")}
                  {renderCollections("sidebar")}
                </nav>
              </ScrollArea>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 prose max-w-none">
            {documentContent.content.map((section) => {
              return (
                <section key={section.id} id={section.id} className="mb-12 scroll-mt-8">
                  <h2
                    className={`${getHeadingClass(section.level)} font-bold mb-6 ${
                      section.level === 1 ? "border-b pb-2" : ""
                    }`}
                  >
                    {section.heading}
                  </h2>
                  <div className="space-y-4">
                    {section.blocks.map((block, blockIndex) => {
                      if (block.type === "heading") {
                        const blockHeadingClass = getHeadingClass(block.level || 2)
                        return (
                          <h3 key={blockIndex} className={`${blockHeadingClass} font-bold mt-6 mb-4`}>
                            {block.text}
                          </h3>
                        )
                      }
                      if (block.type === "paragraph") {
                        return (
                          <p
                            key={blockIndex}
                            className={`mb-4 ${templateConfig.typography.bodyFont} leading-relaxed text-foreground`}
                          >
                            {block.text}
                          </p>
                        )
                      }
                      return null
                    })}
                  </div>
                </section>
              )
            })}
          </main>
        </div>

        {/* Footer Metadata */}
        {(templateConfig.metadataPlacement.authors === "footer" ||
          templateConfig.metadataPlacement.date === "footer" ||
          templateConfig.metadataPlacement.collections === "footer") && (
          <footer className="border-t pt-6 mt-12">
            {renderMetadata("footer")}
            {renderDate("footer")}
            {renderCollections("footer")}
          </footer>
        )}

        {/* Close Button */}
        {onClose && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#628F07] text-white rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Close Preview
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
