"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Filter, ChevronDown, Layers, Grid3x3, Eye, Calendar, ChevronLeft, ChevronRight, Search, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { DashboardDocument } from "@/lib/types/dashboard"

interface MyLibraryProps {
  documents?: DashboardDocument[]
  onPreview?: (document: DashboardDocument) => void
}

// Default mock data for when no documents are provided
const defaultDocuments: DashboardDocument[] = [
  {
    id: "1",
    title: "2025 Infrastructure Report",
    published: "Jan 15, 2025",
    views: 1243,
    template: "Annual Report",
    templateId: "knowledge-hub",
    collections: ["Infrastructure", "Economy"],
    image: "/infrastructure-report.jpg",
    createdAt: new Date("2025-01-15").toISOString(),
    status: "published",
  },
  {
    id: "2",
    title: "Urban Mobility Guidelines",
    published: "Jan 10, 2025",
    views: 892,
    template: "Policy Brief",
    templateId: "knowledge-hub",
    collections: ["Transport", "Urban"],
    image: "/urban-mobility.jpg",
    createdAt: new Date("2025-01-10").toISOString(),
    status: "published",
  },
  {
    id: "3",
    title: "Climate Action Framework",
    published: "Jan 5, 2025",
    views: 2156,
    template: "Framework",
    templateId: "knowledge-hub",
    collections: ["Climate", "Environment"],
    image: "/climate-action.jpg",
    createdAt: new Date("2025-01-05").toISOString(),
    status: "published",
  },
  {
    id: "4",
    title: "Digital Economy Strategy",
    published: "Dec 28, 2024",
    views: 1567,
    template: "Strategy",
    templateId: "knowledge-hub",
    collections: ["Digital", "Economy"],
    image: "/digital-economy.jpg",
    createdAt: new Date("2024-12-28").toISOString(),
    status: "published",
  },
  {
    id: "5",
    title: "Education Sector Review",
    published: "Dec 20, 2024",
    views: 934,
    template: "Sector Review",
    templateId: "knowledge-hub",
    collections: ["Education", "Social"],
    image: "/education-review.jpg",
    createdAt: new Date("2024-12-20").toISOString(),
    status: "published",
  },
  {
    id: "6",
    title: "Healthcare Innovation Report",
    published: "Dec 15, 2024",
    views: 1789,
    template: "Innovation Report",
    templateId: "knowledge-hub",
    collections: ["Healthcare", "Technology"],
    image: "/healthcare-innovation.jpg",
    createdAt: new Date("2024-12-15").toISOString(),
    status: "published",
  },
  {
    id: "7",
    title: "Financial Inclusion Study",
    published: "Dec 10, 2024",
    views: 1234,
    template: "Research Study",
    templateId: "knowledge-hub",
    collections: ["Finance", "Inclusion"],
    image: "/financial-inclusion.jpg",
    createdAt: new Date("2024-12-10").toISOString(),
    status: "published",
  },
  {
    id: "8",
    title: "Agriculture Modernization Guide",
    published: "Dec 5, 2024",
    views: 876,
    template: "Implementation Guide",
    templateId: "knowledge-hub",
    collections: ["Agriculture", "Rural"],
    image: "/agriculture-guide.jpg",
    createdAt: new Date("2024-12-05").toISOString(),
    status: "published",
  },
]

export function MyLibrary({ documents = defaultDocuments, onPreview }: MyLibraryProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState("my") // "my" or "all"
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 8

  const handleViewTemplate = (doc: DashboardDocument) => {
    // If document has an ID (published template), navigate to preview page
    // Otherwise, show preview
    if (doc.id) {
      router.push(`/preview/${doc.id}`)
    } else if (onPreview) {
      onPreview(doc)
    }
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.collections.some((col) => col.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex)

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Published</h2>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page when searching
            }}
            className="pl-9 bg-background"
          />
        </div>

        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <ChevronDown className="h-4 w-4" />
          Sort by: Recent
        </Button>

        <div className="ml-auto flex items-center gap-2 rounded-full bg-secondary p-1">
          <button
            onClick={() => setViewMode("my")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "my"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Content
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Content
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {currentDocuments.map((doc) => (
          <Card 
            key={doc.id} 
            className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] p-0 cursor-pointer"
            onClick={() => handleViewTemplate(doc)}
          >
            <div className="flex flex-col h-full">
              <div className="relative h-24 w-full bg-muted">
                <Image src={doc.image || "/placeholder.svg"} alt={doc.title} fill className="object-cover" />
              </div>

              <div className="p-3 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="mb-2 text-sm font-semibold text-card-foreground line-clamp-2">{doc.title}</h3>

                  <div className="mb-2 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-muted-foreground" />
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {doc.template}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Grid3x3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <div className="flex gap-1 flex-wrap">
                        {doc.collections.map((collection, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-foreground"
                          >
                            {collection}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {doc.published && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Published {doc.published}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{(doc.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-xs bg-transparent hover:bg-secondary mt-auto"
                  style={{
                    borderColor: "#628F07",
                    color: "#628F07",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewTemplate(doc)
                  }}
                >
                  {doc.id ? (
                    <>
                      <ExternalLink className="mr-1 h-3 w-3" style={{ color: "#628F07" }} />
                      View Preview
                    </>
                  ) : (
                    <>
                      <Eye className="mr-1 h-3 w-3" style={{ color: "#628F07" }} />
                      Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-[#628F07] hover:bg-[#628F07]/90" : ""}
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
