export interface DocumentState {
  title: string;
  lastSaved: Date;
  wordCount: number;
}

export enum EditorMode {
  EDIT = 'EDIT',
  VIEW = 'VIEW'
}

export interface AIResponse {
  text: string;
  isError: boolean;
}

export enum LeftPanelType {
  NONE = 'NONE',
  NAVIGATOR = 'NAVIGATOR',
  SEARCH = 'SEARCH',
  AI = 'AI',
  MEDIA = 'MEDIA',
  SNIPPETS = 'SNIPPETS',
  COLLAB = 'COLLAB',
  INSIGHTS = 'INSIGHTS'
}

export enum RightPanelType {
  NONE = 'NONE',
  COMMENTS = 'COMMENTS',
  HISTORY = 'HISTORY',
  FORMATTING = 'FORMATTING',
  SETTINGS = 'SETTINGS'
}