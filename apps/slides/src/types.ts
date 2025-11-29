
export interface Slide {
  id: string;
  content: string; // HTML content of the slide
  thumbnail?: string; // Optional preview
  note?: string; // Speaker notes
}

export interface DocumentState {
  title: string;
  lastSaved: Date;
  slideCount: number;
  currentSlideIndex: number;
}

export enum EditorMode {
  EDIT = 'EDIT',
  VIEW = 'VIEW',
  PRESENT = 'PRESENT'
}

export interface AIResponse {
  text: string;
  isError: boolean;
}

export enum LeftPanelType {
  NONE = 'NONE',
  NAVIGATOR = 'NAVIGATOR',
  INSERT = 'INSERT',
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
  SETTINGS = 'SETTINGS',
  ANIMATION = 'ANIMATION',
  DESIGN = 'DESIGN',
  TRANSITIONS = 'TRANSITIONS',
  LAYOUTS = 'LAYOUTS',
  NOTES = 'NOTES'
}
