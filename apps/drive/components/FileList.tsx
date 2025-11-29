import React from 'react';
import { FileItem, ViewMode } from '../types';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  FileCode,
  Film,
  MoreVertical,
  Star,
  Users,
  Share2,
  Download,
  Edit3,
  Archive,
  Table,
  Presentation
} from 'lucide-react';
import { formatSize } from '../services/storageService';

interface FileListProps {
  files: FileItem[];
  viewMode: ViewMode;
  onNavigate: (folderId: string) => void;
  onSelect: (file: FileItem) => void;
  selectedFileId: string | null;
}

// Enterprise Icon Mapper
const FileIcon = ({ type, className }: { type: string, className?: string }) => {
  const props = { className: className || "h-6 w-6" };
  switch (type) {
    case 'folder': return <Folder {...props} className={`${props.className} fill-blue-500 text-blue-500`} />;
    case 'image': return <ImageIcon {...props} className={`${props.className} text-indigo-500`} />;
    case 'pdf': return <FileText {...props} className={`${props.className} text-red-500`} />;
    case 'doc': return <FileText {...props} className={`${props.className} text-blue-600`} />;
    case 'sheet': return <Table {...props} className={`${props.className} text-emerald-600`} />;
    case 'slide': return <Presentation {...props} className={`${props.className} text-orange-500`} />;
    case 'video': return <Film {...props} className={`${props.className} text-rose-500`} />;
    case 'code': return <FileCode {...props} className={`${props.className} text-slate-700`} />;
    case 'archive': return <Archive {...props} className={`${props.className} text-amber-600`} />;
    default: return <FileText {...props} className={`${props.className} text-gray-400`} />;
  }
};

export const FileList: React.FC<FileListProps> = ({
  files,
  viewMode,
  onNavigate,
  onSelect,
  selectedFileId
}) => {

  const handleItemClick = (file: FileItem) => {
    onSelect(file);
    if (file.type === 'folder') {
      onNavigate(file.id);
    }
  };

  const stopProp = (e: React.MouseEvent) => {
      e.stopPropagation();
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="p-6 bg-slate-50 rounded-full mb-4 ring-1 ring-slate-100 shadow-inner">
            <Folder className="h-16 w-16 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No files found</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
          This folder is empty. Drag and drop files to upload or create a new document.
        </p>
      </div>
    );
  }

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <div className="min-w-full inline-block align-middle">
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80 backdrop-blur">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Owner</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Modified</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {files.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => handleItemClick(file)}
                  className={`group cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedFileId === file.id ? 'bg-blue-50/80' : ''}`}
                >
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                        <FileIcon type={file.type} className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{file.name}</div>
                        {file.starred && <div className="flex items-center mt-0.5"><Star className="h-3 w-3 text-orange-400 fill-orange-400 mr-1"/><span className="text-[10px] text-gray-400">Starred</span></div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    <div className="flex items-center">
                        <div className={`h-6 w-6 rounded-full ${file.owner.color || 'bg-gray-300'} flex items-center justify-center text-xs font-medium text-white ring-2 ring-white`}>
                            {file.owner.name.charAt(0)}
                        </div>
                        <span className="ml-2 text-slate-600">{file.owner.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell font-mono">
                    {file.type === 'folder' ? '-' : formatSize(file.size)}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => handleItemClick(file)}
          className={`group relative bg-white border rounded-2xl p-4 cursor-pointer hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between aspect-[4/5] ${
            selectedFileId === file.id
              ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
              : 'border-gray-200'
          }`}
        >
          {/* Quick Actions Overlay (on hover) */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start z-10">
             <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={stopProp} className="p-1.5 bg-white/90 backdrop-blur text-gray-500 hover:text-blue-600 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200" title="Share">
                   <Share2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={stopProp} className="p-1.5 bg-white/90 backdrop-blur text-gray-500 hover:text-blue-600 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200" title="Download">
                   <Download className="h-3.5 w-3.5" />
                </button>
             </div>
             <button onClick={stopProp} className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
               <MoreVertical className="h-4 w-4 text-gray-500" />
             </button>
          </div>

          <div className="flex-1 flex items-center justify-center w-full my-2">
            <div className={`
                p-5 rounded-2xl transition-transform duration-300 group-hover:scale-110
                ${file.type === 'folder' ? 'bg-blue-50/50' : 'bg-slate-50/50'}
            `}>
                <FileIcon type={file.type} className="h-14 w-14 shadow-sm" />
            </div>
          </div>

          <div className="w-full mt-2">
            <div className="flex items-center justify-center space-x-1 mb-1">
               <p className="text-sm font-semibold text-slate-700 truncate w-full text-center px-1" title={file.name}>
                 {file.name}
               </p>
               {file.starred && <Star className="h-3 w-3 text-orange-400 fill-orange-400 flex-shrink-0"/>}
            </div>

            <div className="flex justify-between items-center px-2 mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center -space-x-2 overflow-hidden">
                    {file.type === 'folder' && file.collaborators ? (
                         file.collaborators.slice(0,3).map(u => (
                             <div key={u.id} className={`inline-block h-5 w-5 rounded-full ring-2 ring-white ${u.color}`} title={u.name}></div>
                         ))
                    ) : (
                        <div className={`inline-block h-5 w-5 rounded-full ring-2 ring-white ${file.owner.color}`} title={file.owner.name}>
                             <span className="text-[8px] text-white flex items-center justify-center h-full w-full">{file.owner.name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                  {file.type === 'folder' ? 'Folder' : formatSize(file.size)}
                </span>
            </div>
          </div>

          {file.shared && (
             <div className="absolute top-2 right-2 bg-indigo-50 p-1 rounded-md">
                 <Users className="h-3 w-3 text-indigo-400" />
             </div>
          )}
        </div>
      ))}
    </div>
  );
};
