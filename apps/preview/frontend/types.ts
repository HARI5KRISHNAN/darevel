export enum FileType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  PPTX = 'PPTX',
  XLSX = 'XLSX',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export enum PreviewStatus {
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
}

export interface FileMetadata {
  id: string;
  name: string;
  type: FileType;
  size: string;
  updatedAt: string;
  status: PreviewStatus;
  owner: string;
  pageCount?: number;
  slideCount?: number;
  sheetNames?: string[];
  duration?: string;
  textContent?: string;
}

export interface SheetData {
  name: string;
  rows: string[][];
}

export interface SlideData {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
}
