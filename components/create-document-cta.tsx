"use client"

import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreateDocumentCTA() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-8 md:p-12">
      <div className="relative z-10">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Create a New Web Doc</h2>
        <p className="mb-6 max-w-2xl text-lg text-muted-foreground">
          Start building your next document with our powerful editor and templates. Choose from professionally designed
          layouts and customize to match your brand.
        </p>
        <Button size="lg" className="gap-2 text-base">
          <Plus className="h-5 w-5" />
          Create New Document
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
    </div>
  )
}
