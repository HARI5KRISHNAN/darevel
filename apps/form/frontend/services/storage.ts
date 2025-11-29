import { Form, FormResponse, FormStatus, FormField, FieldType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock Data Service
const STORAGE_KEYS = {
  FORMS: 'gemini_forms_data',
  RESPONSES: 'gemini_forms_responses'
};

const getForms = (): Form[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FORMS);
  return data ? JSON.parse(data) : [];
};

const saveForms = (forms: Form[]) => {
  localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
};

const getResponses = (): FormResponse[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RESPONSES);
  return data ? JSON.parse(data) : [];
};

const saveResponses = (responses: FormResponse[]) => {
  localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
};

export const FormsAPI = {
  list: (): Form[] => {
    return getForms().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  get: (id: string): Form | undefined => {
    return getForms().find(f => f.id === id);
  },

  create: (title: string, description: string): Form => {
    const newForm: Form = {
      id: uuidv4(),
      title,
      description,
      status: FormStatus.DRAFT,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      themeColor: 'purple',
      fontFamily: 'Inter'
    };
    const forms = getForms();
    saveForms([...forms, newForm]);
    return newForm;
  },

  update: (id: string, updates: Partial<Form>): Form => {
    const forms = getForms();
    const index = forms.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Form not found');
    
    const updatedForm = { ...forms[index], ...updates, updatedAt: new Date().toISOString() };
    forms[index] = updatedForm;
    saveForms(forms);
    return updatedForm;
  },

  delete: (id: string) => {
    const forms = getForms().filter(f => f.id !== id);
    saveForms(forms);
  },

  // Response Methods
  submitResponse: (formId: string, answers: any): FormResponse => {
    const responses = getResponses();
    const newResponse: FormResponse = {
      id: uuidv4(),
      formId,
      submittedAt: new Date().toISOString(),
      answers
    };
    saveResponses([...responses, newResponse]);
    return newResponse;
  },

  getFormResponses: (formId: string): FormResponse[] => {
    return getResponses().filter(r => r.formId === formId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
};