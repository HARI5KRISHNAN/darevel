import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI } from '../lib/api';
import { CollaborativeEditor } from '../components/CollaborativeEditor';
import { ArrowLeft, Save, Users } from 'lucide-react';

export function DocumentEditorPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    try {
      const response = await documentAPI.get(documentId!);
      setDocument(response.data);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async (content: any) => {
    try {
      setSaving(true);
      await documentAPI.update(documentId!, { content });
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateTitle = async (title: string) => {
    try {
      await documentAPI.update(documentId!, { title });
      setDocument({ ...document, title });
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Document not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <button
              onClick={() => navigate('/')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={document.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="text-lg font-medium border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Untitled Document"
            />
          </div>
          <div className="flex items-center gap-4">
            {saving && (
              <div className="flex items-center text-sm text-gray-500">
                <Save className="w-4 h-4 mr-1 animate-pulse" />
                Saving...
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              {document.activeCollaborators?.length || 0} online
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <CollaborativeEditor
          documentId={documentId!}
          initialContent={document.content}
          onSave={saveDocument}
        />
      </main>
    </div>
  );
}
