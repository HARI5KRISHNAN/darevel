"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { shapes2D, shapes3D } from "@/lib/shapes"

interface ShapesPanelProps {
  onShapeSelect: (shapeId: string, shapeType: "2d" | "3d") => void
}

export default function ShapesPanel({ onShapeSelect }: ShapesPanelProps) {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Add Shapes</h3>

      <Tabs defaultValue="2d" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="2d" className="text-xs">
            2D Shapes
          </TabsTrigger>
          <TabsTrigger value="3d" className="text-xs">
            3D Shapes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2d" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {shapes2D.map((shape) => (
              <button
                key={shape.id}
                onClick={() => onShapeSelect(shape.id, "2d")}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-border hover:bg-primary/10 hover:border-primary transition-all cursor-pointer group"
                title={shape.name}
              >
                <span className="text-2xl mb-1">{shape.icon}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground text-center line-clamp-1">
                  {shape.name}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="3d" className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {shapes3D.map((shape) => (
              <button
                key={shape.id}
                onClick={() => onShapeSelect(shape.id, "3d")}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-border hover:bg-primary/10 hover:border-primary transition-all cursor-pointer group"
                title={shape.name}
              >
                <span className="text-2xl mb-1">{shape.icon}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground text-center line-clamp-1">
                  {shape.name}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
