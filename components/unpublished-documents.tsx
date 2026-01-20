"use client"

import { Edit, Layers, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { DashboardDocument } from "@/lib/types/dashboard"
import { formatDistanceToNow } from "date-fns"

interface UnpublishedDocumentsProps {
  documents?: DashboardDocument[]
}

// Default mock data for when no documents are provided
const defaultUnpublishedDocs = [
  {
    id: "1",
    title: "2026 World Development Report",
    lastEdited: "30 minutes ago",
    template: "WDR",
    collections: ["Technology", "Digital"],
    image: "/world-development-report-technology.jpg",
    createdAt: new Date().toISOString(),
    status: "draft" as const,
    templateId: "knowledge-hub",
  },
  {
    id: "2",
    title: "Commercial Motorcycle Safety Toolkit",
    lastEdited: "2 hours ago",
    template: "Knowledge Hub",
    collections: ["Transport"],
    image: "/motorcycle-safety-transport.jpg",
    createdAt: new Date().toISOString(),
    status: "draft" as const,
    templateId: "knowledge-hub",
  },
]

export function UnpublishedDocuments({ documents = defaultUnpublishedDocs }: UnpublishedDocumentsProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Drafts</h2>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No drafts yet. Create your first document to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {documents.map((doc) => {
            const lastEdited = doc.lastEdited || (doc.createdAt ? formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true }) : "Just now")
            
            return (
              <Card key={doc.id} className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] p-0">
                <div className="flex flex-col h-full">
                  <div className="relative h-24 w-full bg-muted">
                    <Image src={doc.image || "/placeholder.svg"} alt={doc.title} fill className="object-cover" />
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <div className="mb-3">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-card-foreground line-clamp-2">{doc.title}</h3>

                        <div className="mb-2 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {doc.template}
                            </span>
                          </div>

                          {doc.collections && doc.collections.length > 0 && (
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
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">Last edited {lastEdited}</div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full text-xs bg-transparent hover:bg-secondary mt-auto"
                      style={{
                        borderColor: "#628F07",
                        color: "#628F07",
                      }}
                    >
                      <Edit className="mr-1 h-3 w-3" style={{ color: "#628F07" }} />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
