
export enum FieldType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  NUMBER = 'NUMBER',
  SINGLE_CHOICE = 'SINGLE_CHOICE', // Radio
  MULTI_CHOICE = 'MULTI_CHOICE',   // Checkbox
  DROPDOWN = 'DROPDOWN',
  RATING = 'RATING',
  DATE = 'DATE'
}

export interface FormOption {
  id: string;
  label: string;
}

export interface FormFieldLogic {
  triggerFieldId: string;
  condition: 'equals'; // Extendable for 'contains', 'greater_than' etc later
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: FormOption[]; // For choice types
  placeholder?: string;
  logic?: FormFieldLogic; // Conditional visibility
}

export enum FormStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED'
}

export interface Form {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  themeColor: string;
  fontFamily?: string; // e.g. 'Inter', 'Playfair Display'
}

export interface FormResponseAnswer {
  fieldId: string;
  value: string | number | string[]; // string[] for multi-choice
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: string;
  answers: FormResponseAnswer[];
}

export interface AIAnalysisResult {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  keyThemes: string[];
}
