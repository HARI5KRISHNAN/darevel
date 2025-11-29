import React from 'react';
import { FileMetadata, FileType } from '../../types';

interface MediaViewerProps {
  file: FileMetadata;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ file }) => {
  if (file.type === FileType.IMAGE) {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center">
        <img
          src={`https://picsum.photos/seed/${file.id}/1600/900`}
          alt={file.name}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        />
      </div>
    );
  }

  if (file.type === FileType.VIDEO) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <video
          className="max-w-full max-h-full rounded-2xl shadow-2xl"
          controls
          poster={`https://picsum.photos/seed/${file.id}-poster/1200/675`}
        >
          <source src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-slate-400">
      This file type is not supported in the media viewer.
    </div>
  );
};

export default MediaViewer;
