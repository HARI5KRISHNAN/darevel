import React from 'react';
import { FileMetadata } from '../../types';

interface DocViewerProps {
  file: FileMetadata;
}

const DocViewer: React.FC<DocViewerProps> = ({ file }) => {
  const content = file.textContent || '<p>No document preview available yet.</p>';

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-100 to-white p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Microsoft Word</p>
            <h3 className="text-lg font-semibold text-slate-800">{file.name}</h3>
          </div>
          <span className="text-xs text-slate-400">Last updated {file.updatedAt}</span>
        </div>
        <div className="px-8 py-10 text-[15px] leading-relaxed text-slate-700 space-y-4" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default DocViewer;
