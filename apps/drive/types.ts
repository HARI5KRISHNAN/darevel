export type FileType = 'folder' | 'image' | 'pdf' | 'doc' | 'sheet' | 'slide' | 'video' | 'code' | 'archive' | 'unknown';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface FileVersion {
  id: string;
  version: number;
  updatedAt: string;
  modifier: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface FileItem {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  size: number; // in bytes
  updatedAt: string;
  owner: User;
  shared?: boolean;
  starred?: boolean;
  content?: string; // Mock content for AI analysis
  collaborators?: User[];
  tags?: string[];
  versions?: FileVersion[];
  activity?: ActivityLog[];
}

export type ViewMode = 'grid' | 'list';

export type SortField = 'name' | 'updatedAt' | 'size';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface Breadcrumb {
  id: string;
  name: string;
}
