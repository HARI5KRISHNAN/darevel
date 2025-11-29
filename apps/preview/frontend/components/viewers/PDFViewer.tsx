import React from 'react';
import { FileMetadata } from '../../types';

interface PDFViewerProps {
  file: FileMetadata;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file }) => {
  const pageCount = file.pageCount ?? 1;
  const textContent = file.textContent || 'No preview text is available for this PDF document.';
  const pageSnippets = textContent.split(/\n|\.\s/).filter(Boolean);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-slate-100 p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl border border-slate-200">
        {Array.from({ length: pageCount }).map((_, index) => (
          <div key={index} className="min-h-[640px] px-12 py-10 border-b border-slate-100">
            <div className="text-center text-xs text-slate-400 tracking-[0.2em] uppercase mb-6">Page {index + 1}</div>
            <div className="space-y-4 text-slate-700 leading-relaxed text-[15px]">
              {pageSnippets.slice(index * 4, index * 4 + 4).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFViewer;
