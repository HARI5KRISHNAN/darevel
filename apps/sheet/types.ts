
export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
}

export interface Cell {
  id: string; // e.g., "A1"
  value: string;
  formula?: string;
  style?: CellStyle;
}

export interface Sheet {
  id: string;
  name: string;
  data: Record<string, Cell>; // Map "A1": Cell
  remoteId?: number;
}

export interface SheetSummary {
  id: number;
  name: string;
  lastSavedAt?: string;
  updatedAt?: string;
}

export interface DocumentState {
  title: string;
  lastSaved: Date;
  activeSheetId: string;
  activeCell: string | null; // e.g., "B2"
  selectionRange: string[] | null;
}

export enum EditorMode {
  EDIT = 'EDIT',
  VIEW = 'VIEW'
}

export enum LeftPanelType {
  NONE = 'NONE',
  FUNCTIONS = 'FUNCTIONS',
  INSERT = 'INSERT',
  SEARCH = 'SEARCH',
  AI = 'AI',
  DATA = 'DATA',
  SNIPPETS = 'SNIPPETS',
  TEMPLATES = 'TEMPLATES',
  COLLABORATION = 'COLLABORATION'
}

export enum RightPanelType {
  NONE = 'NONE',
  COMMENTS = 'COMMENTS',
  FORMATTING = 'FORMATTING',
  SETTINGS = 'SETTINGS',
  CHART = 'CHART',
  DATA_VALIDATION = 'DATA_VALIDATION'
}
