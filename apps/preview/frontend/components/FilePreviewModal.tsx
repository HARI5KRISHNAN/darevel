import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FileMetadata, FileType, SheetData, SlideData } from '../types';
import { getExcelData, getFileDetails, getSlideData } from '../services/mockData';
import PreviewToolbar from './PreviewToolbar';
import PDFViewer from './viewers/PDFViewer';
import DocViewer from './viewers/DocViewer';
import SlideViewer from './viewers/SlideViewer';
import ExcelViewer from './viewers/ExcelViewer';
import MediaViewer from './viewers/MediaViewer';
import AIContextPanel from './AIContextPanel';

interface FilePreviewModalProps {
  fileId: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ fileId, onClose }) => {
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [sheetData, setSheetData] = useState<SheetData[] | undefined>();
  const [slideData, setSlideData] = useState<SlideData[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSheetData(undefined);
        setSlideData(undefined);

        const fileDetails = await getFileDetails(fileId);
        if (!isMounted) return;
        setFile(fileDetails);

        if (fileDetails.type === FileType.XLSX) {
          const sheets = await getExcelData(fileId);
          if (isMounted) setSheetData(sheets);
        }

        if (fileDetails.type === FileType.PPTX) {
          const slides = await getSlideData(fileId);
          if (isMounted) setSlideData(slides);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load preview.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadFile();

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  const viewer = useMemo(() => {
    if (!file) return null;

    switch (file.type) {
      case FileType.PDF:
        return <PDFViewer file={file} />;
      case FileType.DOCX:
        return <DocViewer file={file} />;
      case FileType.PPTX:
        return <SlideViewer slides={slideData} isLoading={isLoading && !slideData} />;
      case FileType.XLSX:
        return <ExcelViewer sheets={sheetData} isLoading={isLoading && !sheetData} />;
      case FileType.IMAGE:
      case FileType.VIDEO:
        return <MediaViewer file={file} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-slate-400">
            Preview for this file type is not implemented yet.
          </div>
        );
    }
  }, [file, slideData, sheetData, isLoading]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center px-6 py-10">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[1400px] h-full max-h-[900px] flex flex-col overflow-hidden">
        <PreviewToolbar file={file} onClose={onClose} onToggleAI={() => setShowAI(prev => !prev)} isAIEnabled={showAI} isLoading={isLoading} />

        <div className="flex-1 flex overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <div className="flex items-center space-x-3 text-slate-500">
                <Loader2 className="animate-spin" />
                <span>Preparing preview...</span>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-rose-500 space-y-3">
              <AlertCircle size={48} />
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className={`flex-1 ${showAI && file ? 'mr-[400px]' : ''}`}>{viewer}</div>
              {file && <AIContextPanel file={file} isOpen={showAI} onClose={() => setShowAI(false)} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
