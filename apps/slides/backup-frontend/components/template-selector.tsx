"use client"

import { useState } from "react"
import { type Template, TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from "@/lib/templates"
import { Check, Palette } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TemplateSelectorProps {
  onSelect: (template: Template) => void
  selectedId?: string
}

export default function TemplateSelector({ onSelect, selectedId }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("All")

  const filteredTemplates = selectedCategory === "All"
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Design Templates</h3>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TemplateCategory)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto text-[10px]">
          {TEMPLATE_CATEGORIES.slice(0, 3).map((category) => (
            <TabsTrigger key={category} value={category} className="text-[10px] px-1 py-1">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid w-full grid-cols-3 h-auto mt-1 text-[10px]">
          {TEMPLATE_CATEGORIES.slice(3).map((category) => (
            <TabsTrigger key={category} value={category} className="text-[10px] px-1 py-1">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Template Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`group relative rounded-lg overflow-hidden transition-all text-left ${
              selectedId === template.id
                ? "ring-2 ring-primary shadow-lg"
                : "ring-1 ring-border hover:ring-primary/50 hover:shadow-md"
            }`}
          >
            {/* Template Preview */}
            <div
              className="h-16 flex items-center justify-center relative overflow-hidden"
              style={{ background: template.thumbnail }}
            >
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Template Name on Hover */}
              <div className="relative z-10 text-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs font-bold text-white drop-shadow-lg">
                  {template.name}
                </div>
              </div>

              {/* Selected Check Mark */}
              {selectedId === template.id && (
                <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5 shadow-lg">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-1.5 bg-card border-t border-border">
              <div className="text-[10px] font-medium text-foreground line-clamp-1">
                {template.name}
              </div>

              {/* Color Palette Preview */}
              <div className="flex gap-1 mt-1">
                <div
                  className="w-2.5 h-2.5 rounded-full border border-border"
                  style={{ backgroundColor: template.styles.backgroundColor }}
                  title="Background"
                />
                <div
                  className="w-2.5 h-2.5 rounded-full border border-border"
                  style={{ backgroundColor: template.styles.textColor }}
                  title="Text"
                />
                <div
                  className="w-2.5 h-2.5 rounded-full border border-border"
                  style={{ backgroundColor: template.styles.accentColor }}
                  title="Accent"
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Template Count */}
      <p className="text-[10px] text-muted-foreground text-center">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
