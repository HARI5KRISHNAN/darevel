"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Plus,
  Presentation,
  Loader2,
  ArrowLeft,
  Trash2,
  Edit,
  FileText,
  Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  layout: string;
  backgroundColor: string;
  textColor: string;
}

interface PresentationData {
  id: number;
  title: string;
  content: string; // JSON string of slides
  thumbnailUrl?: string;
  isShared: boolean;
  sharedWith?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SlidesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [presentations, setPresentations] = useState<PresentationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPresentationTitle, setNewPresentationTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/api/auth/signin");
    }
  }, [status]);

  // Load presentations
  useEffect(() => {
    if (status === "authenticated") {
      loadPresentations();
    }
  }, [status]);

  const loadPresentations = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8081/api/slides", {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load presentations");
      }

      const result = await response.json();
      setPresentations(result.data || []);
    } catch (err: any) {
      console.error("Error loading presentations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePresentation = async () => {
    if (!newPresentationTitle.trim()) {
      setError("Please enter a presentation title");
      return;
    }

    try {
      setCreating(true);
      setError("");

      // Create default slide structure
      const defaultSlides: Slide[] = [
        {
          id: "1",
          title: "Welcome",
          subtitle: "Your presentation starts here",
          layout: "title",
          backgroundColor: "#1e293b",
          textColor: "#ffffff",
        },
      ];

      const response = await fetch("http://localhost:8081/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          title: newPresentationTitle,
          content: JSON.stringify(defaultSlides),
          isShared: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create presentation");
      }

      const result = await response.json();
      setPresentations([result.data, ...presentations]);
      setCreateDialogOpen(false);
      setNewPresentationTitle("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePresentation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this presentation?")) return;

    try {
      const response = await fetch(`http://localhost:8081/api/slides/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete presentation");
      }

      setPresentations(presentations.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting presentation:", err);
      alert("Failed to delete presentation: " + err.message);
    }
  };

  const handleOpenPresentation = (presentation: PresentationData) => {
    // For now, just show an alert. In the future, this would open the editor
    alert(`Opening "${presentation.title}"\n\nEditor coming soon! For now, you can create and list presentations.`);
  };

  const getSlideCount = (content: string): number => {
    try {
      const slides = JSON.parse(content);
      return Array.isArray(slides) ? slides.length : 1;
    } catch {
      return 1;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Presentation className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Darevel Slides
              </h1>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              New Presentation
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            My Presentations
          </h2>
          <p className="text-gray-600">
            Create and manage your presentations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Presentations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New Presentation Card */}
          <Card
            className="group cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-purple-300 hover:border-purple-500"
            onClick={() => setCreateDialogOpen(true)}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                New Presentation
              </h3>
              <p className="text-xs text-gray-600 text-center">
                Start with a blank presentation
              </p>
            </CardContent>
          </Card>

          {/* Existing Presentations */}
          {presentations.map((presentation) => (
            <Card
              key={presentation.id}
              className="group cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
              onClick={() => handleOpenPresentation(presentation)}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-purple-800 to-pink-900 flex items-center justify-center">
                  <div className="text-center p-4">
                    <FileText className="h-12 w-12 text-purple-200 mx-auto mb-2" />
                    <p className="text-xs text-purple-100">
                      {getSlideCount(presentation.content)} slide
                      {getSlideCount(presentation.content) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {presentation.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(presentation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {presentation.isShared && (
                      <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        Shared
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDeletePresentation(presentation.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {presentations.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Presentation className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No presentations yet
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Create your first presentation to get started
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Create Presentation
            </Button>
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Presentation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Presentation Title</Label>
              <Input
                id="title"
                value={newPresentationTitle}
                onChange={(e) => setNewPresentationTitle(e.target.value)}
                placeholder="e.g., Q1 Marketing Strategy"
                disabled={creating}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !creating) {
                    handleCreatePresentation();
                  }
                }}
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreatePresentation}
                disabled={creating}
                className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewPresentationTitle("");
                  setError("");
                }}
                disabled={creating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
