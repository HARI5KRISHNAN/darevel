import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { EditorToolbar } from './EditorToolbar';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent?: any;
  onSave?: (content: any) => void;
}

export function CollaborativeEditor({
  documentId,
  initialContent,
  onSave,
}: CollaborativeEditorProps) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable history since Yjs handles it
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: localStorage.getItem('user_name') || 'Anonymous',
          color: generateUserColor(),
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  useEffect(() => {
    // Initialize WebSocket connection for real-time collaboration
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8087';
    const wsProvider = new WebsocketProvider(
      wsUrl,
      `/ws/docs/${documentId}`,
      ydoc,
      {
        params: {
          token: localStorage.getItem('access_token') || '',
        },
      }
    );

    wsProvider.on('status', (event: any) => {
      setStatus(event.status);
    });

    setProvider(wsProvider);

    // Auto-save every 30 seconds
    const saveInterval = setInterval(() => {
      if (editor && onSave) {
        onSave(editor.getJSON());
      }
    }, 30000);

    return () => {
      clearInterval(saveInterval);
      wsProvider.destroy();
    };
  }, [documentId, ydoc]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Connection Status */}
      <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {status === 'connected'
              ? 'Connected'
              : status === 'connecting'
              ? 'Connecting...'
              : 'Disconnected'}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Auto-save enabled
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Content */}
      <div className="p-6 min-h-[600px] bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Generate a consistent color for the user
function generateUserColor() {
  const userId = localStorage.getItem('user_id') || 'anonymous';
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return colors[Math.abs(hash) % colors.length];
}
