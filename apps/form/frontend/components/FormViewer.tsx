
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FormsAPI } from '../services/storage';
import { Form, FormField, FieldType, FormStatus } from '../types';
import { Icons } from './ui/Icons';
import clsx from 'clsx';

// Theme Configuration Map
const THEMES: Record<string, { bg: string, card: string, text: string, primary: string, border: string, input: string }> = {
  modern: { bg: 'bg-gray-50', card: 'bg-white shadow-sm border-gray-200', text: 'text-gray-800', primary: 'bg-gray-900 text-white', border: 'border-gray-200', input: 'border-gray-200 focus:border-gray-400' },
  glass: { bg: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100', card: 'bg-white/60 backdrop-blur-xl border-white/50 shadow-xl', text: 'text-indigo-900', primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30', border: 'border-white/50', input: 'bg-white/50 border-white/50 focus:bg-white' },
  'neo-dark': { bg: 'bg-slate-900', card: 'bg-slate-800 border-slate-700 shadow-2xl', text: 'text-slate-100', primary: 'bg-indigo-500 text-white', border: 'border-slate-700', input: 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' },
  aqua: { bg: 'bg-cyan-50', card: 'bg-white shadow-sm border-cyan-100', text: 'text-cyan-900', primary: 'bg-cyan-600 text-white', border: 'border-cyan-100', input: 'border-cyan-200 focus:border-cyan-500' },
  sunset: { bg: 'bg-orange-50', card: 'bg-white shadow-sm border-orange-100', text: 'text-orange-900', primary: 'bg-orange-500 text-white', border: 'border-orange-100', input: 'border-orange-200 focus:border-orange-500' },
  minimal: { bg: 'bg-white', card: 'bg-transparent', text: 'text-gray-900', primary: 'bg-black text-white', border: 'border-transparent', input: 'border-b border-gray-200 focus:border-black rounded-none px-0' },
};

const FormViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      const data = FormsAPI.get(id);
      setForm(data || null);
    }
  }, [id]);

  // Dynamically load font
  useEffect(() => {
    if (form?.fontFamily && form.fontFamily !== 'Inter') {
       const linkId = `font-${form.fontFamily.replace(/\s+/g, '-')}`;
       if (!document.getElementById(linkId)) {
          const link = document.createElement('link');
          link.id = linkId;
          link.href = `https://fonts.googleapis.com/css2?family=${form.fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
       }
    }
  }, [form?.fontFamily]);

  const handleChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
        setErrors(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleMultiChoiceChange = (fieldId: string, value: string, checked: boolean) => {
      const current = (answers[fieldId] as string[]) || [];
      if (checked) {
          handleChange(fieldId, [...current, value]);
      } else {
          handleChange(fieldId, current.filter(v => v !== value));
      }
  };

  const isFieldVisible = (field: FormField) => {
      if (!field.logic) return true;
      const { triggerFieldId, value } = field.logic;
      const triggerValue = answers[triggerFieldId];
      
      // Basic strict equality check. 
      // If the trigger is multi-choice, we might need 'includes', but for now assume single value match
      return triggerValue === value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate
    const newErrors: Record<string, boolean> = {};
    let isValid = true;
    
    // Filter fields to save: only visible ones
    const visibleFields = form.fields.filter(isFieldVisible);
    
    visibleFields.forEach(field => {
        if (field.required) {
            const val = answers[field.id];
            if (val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
                newErrors[field.id] = true;
                isValid = false;
            }
        }
    });

    if (!isValid) {
        setErrors(newErrors);
        const firstError = document.querySelector('.error-field');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Only submit answers for visible fields
    const formattedAnswers = visibleFields
        .filter(f => answers[f.id] !== undefined)
        .map(f => ({
            fieldId: f.id,
            value: answers[f.id]
        }));
    
    FormsAPI.submitResponse(form.id, formattedAnswers);
    setSubmitted(true);
  };

  if (!form) return <div className="min-h-screen flex items-center justify-center text-gray-500">Form not found</div>;
  if (form.status !== FormStatus.ACTIVE) return <div className="min-h-screen flex items-center justify-center text-gray-500">This form is closed.</div>;

  const themeName = form.themeColor || 'modern';
  const theme = THEMES[themeName] || THEMES.modern;
  
  // Calculate font family style
  const fontStyle = form.fontFamily ? { fontFamily: `'${form.fontFamily}', sans-serif` } : {};

  if (submitted) {
      return (
          <div className={clsx("min-h-screen flex items-center justify-center p-4", theme.bg)} style={fontStyle}>
              <div className={clsx("p-12 rounded-2xl max-w-md w-full text-center border", theme.card, theme.text)}>
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Icons.Check size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Submitted!</h2>
                  <p className="opacity-70 mb-8">Your response has been recorded successfully.</p>
                  <Link to="/" className="font-medium hover:underline opacity-50 text-sm">Create your own form</Link>
              </div>
          </div>
      )
  }

  return (
    <div className={clsx("min-h-screen py-12 px-4 transition-colors duration-500", theme.bg)} style={fontStyle}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card */}
        <div className={clsx("rounded-2xl p-10 border text-center", theme.card, theme.text)}>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">{form.title}</h1>
            <p className="text-lg opacity-70 whitespace-pre-wrap">{form.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map(field => {
                // Conditional Rendering Check
                if (!isFieldVisible(field)) return null;

                return (
                    <div key={field.id} className={clsx(
                        "p-8 rounded-2xl border transition-all animate-fade-in-up",
                        theme.card,
                        errors[field.id] ? "ring-2 ring-red-400 error-field" : theme.border
                    )}>
                        <label className={clsx("block font-medium text-lg mb-4", theme.text)}>
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>

                        {/* Inputs */}
                        {field.type === FieldType.SHORT_TEXT && (
                            <input 
                                type="text" 
                                className={clsx("w-full p-3 rounded-lg border outline-none transition-all", theme.input)}
                                placeholder="Type here..."
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                        )}

                        {field.type === FieldType.LONG_TEXT && (
                            <textarea 
                                className={clsx("w-full p-3 rounded-lg border outline-none transition-all resize-none", theme.input)}
                                placeholder="Type your answer..."
                                rows={4}
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                        )}

                        {field.type === FieldType.NUMBER && (
                            <input 
                                type="number" 
                                className={clsx("w-full p-3 rounded-lg border outline-none transition-all", theme.input)}
                                placeholder="0"
                                value={answers[field.id] || ''}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                        )}

                        {(field.type === FieldType.SINGLE_CHOICE || field.type === FieldType.MULTI_CHOICE) && (
                            <div className="space-y-3">
                                {field.options?.map(opt => {
                                    const isChecked = field.type === FieldType.SINGLE_CHOICE 
                                        ? answers[field.id] === opt.label
                                        : (answers[field.id] as string[] || []).includes(opt.label);
                                    
                                    return (
                                        <label key={opt.id} className={clsx(
                                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-black/5",
                                            isChecked ? "bg-black/5 border-black/10" : "border-transparent"
                                        )}>
                                            <div className={clsx(
                                                "w-5 h-5 border flex items-center justify-center",
                                                field.type === FieldType.SINGLE_CHOICE ? "rounded-full" : "rounded",
                                                isChecked ? "bg-current border-current" : "border-gray-400",
                                                theme.text
                                            )}>
                                                {isChecked && <Icons.Check size={12} className={themeName === 'neo-dark' ? 'text-black' : 'text-white'} />}
                                            </div>
                                            <input 
                                                type={field.type === FieldType.SINGLE_CHOICE ? "radio" : "checkbox"}
                                                name={field.id} 
                                                value={opt.label}
                                                checked={isChecked}
                                                onChange={(e) => field.type === FieldType.SINGLE_CHOICE ? handleChange(field.id, opt.label) : handleMultiChoiceChange(field.id, opt.label, e.target.checked)}
                                                className="hidden" 
                                            />
                                            <span className={clsx("font-medium", theme.text)}>{opt.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}

                        {field.type === FieldType.DROPDOWN && (
                            <div className="relative">
                                <select
                                    className={clsx("w-full p-3 rounded-lg border outline-none appearance-none", theme.input)}
                                    value={answers[field.id] || ''}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                >
                                    <option value="">Select an option</option>
                                    {field.options?.map(opt => (
                                        <option key={opt.id} value={opt.label}>{opt.label}</option>
                                    ))}
                                </select>
                                <Icons.ChevronDown className={clsx("absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50", theme.text)} size={20} />
                            </div>
                        )}
                        
                        {field.type === FieldType.RATING && (
                            <div className="flex flex-wrap gap-2">
                                {[1,2,3,4,5].map(val => (
                                    <button
                                    type="button"
                                    key={val}
                                    onClick={() => handleChange(field.id, val)}
                                    className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all",
                                        answers[field.id] === val 
                                            ? "bg-black/80 text-white scale-110 shadow-lg" 
                                            : "bg-black/5 hover:bg-black/10",
                                        themeName === 'neo-dark' && answers[field.id] === val ? "bg-white text-black" : "",
                                        themeName === 'neo-dark' && answers[field.id] !== val ? "bg-white/10 text-white hover:bg-white/20" : ""
                                    )}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="pt-8 flex justify-center">
                <button 
                    type="submit"
                    className={clsx(
                        "px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all active:scale-95",
                        theme.primary
                    )}
                >
                    Submit Response
                </button>
            </div>
        </form>
        
        <div className="text-center pb-8 opacity-40">
           <span className="text-xs font-semibold uppercase tracking-widest">Powered by Darevel Form</span>
        </div>
      </div>
    </div>
  );
};

export default FormViewer;
