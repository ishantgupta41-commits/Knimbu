"use client"

import { Palette, Layout, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const templates = [
  { id: 1, name: "Modern Minimalist", color: "#628F07", usage: 12 },
  { id: 2, name: "Corporate Professional", color: "#3B82F6", usage: 8 },
  { id: 3, name: "Creative Bold", color: "#EC4899", usage: 5 },
]

const brandColors = [
  { name: "Primary", color: "#628F07" },
  { name: "Secondary", color: "#3B82F6" },
  { name: "Accent", color: "#8B5CF6" },
  { name: "Success", color: "#10B981" },
]

export function TemplatesAndBranding() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">My Templates & Branding</h2>
        <p className="text-sm text-muted-foreground">Customize templates and brand identity</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Templates */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Layout className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Document Templates</h3>
                <p className="text-xs text-muted-foreground">Pre-configured layouts</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>

          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded border border-border" style={{ backgroundColor: template.color }} />
                  <div>
                    <div className="font-medium text-card-foreground">{template.name}</div>
                    <div className="text-xs text-muted-foreground">Used in {template.usage} documents</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Brand Colors */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Brand Colors</h3>
                <p className="text-xs text-muted-foreground">Organization color palette</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {brandColors.map((brand) => (
              <div
                key={brand.name}
                className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50"
              >
                <div className="mb-3 h-16 rounded border border-border" style={{ backgroundColor: brand.color }} />
                <div className="font-medium text-card-foreground">{brand.name}</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">{brand.color}</div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-4 w-full bg-transparent">
            Customize Color Palette
          </Button>
        </Card>
      </div>
    </section>
  )
}
