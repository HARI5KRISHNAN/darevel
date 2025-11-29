
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FormsAPI } from '../services/storage';
import { generateFormSchema } from '../services/geminiService';
import { Form, FormField, FieldType, FormStatus } from '../types';
import { Icons } from './ui/Icons';
import { v4 as uuidv4 } from 'uuid';
import clsx from 'clsx';

// --- Configuration ---
const THEME_PRESETS = [
  { id: 'modern', label: 'Modern', color: 'from-gray-100 to-gray-200' },
  { id: 'glass', label: 'Glass', color: 'from-purple-100 to-blue-100' },
  { id: 'neo-dark', label: 'Neo Dark', color: 'from-gray-800 to-gray-900' },
  { id: 'aqua', label: 'Aqua', color: 'from-cyan-100 to-blue-100' },
  { id: 'sunset', label: 'Sunset', color: 'from-orange-100 to-rose-100' },
  { id: 'minimal', label: 'Minimal', color: 'bg-white' },
];

// Available Google Fonts
const AVAILABLE_FONTS = [
  { label: 'Inter (Default)', value: 'Inter', family: "'Inter', sans-serif" },
  { label: 'Playfair Display', value: 'Playfair Display', family: "'Playfair Display', serif" },
  { label: 'Montserrat', value: 'Montserrat', family: "'Montserrat', sans-serif" },
  { label: 'Roboto Mono', value: 'Roboto Mono', family: "'Roboto Mono', monospace" },
  { label: 'Lato', value: 'Lato', family: "'Lato', sans-serif" },
  { label: 'Oswald', value: 'Oswald', family: "'Oswald', sans-serif" },
  { label: 'Merriweather', value: 'Merriweather', family: "'Merriweather', serif" },
  { label: 'Space Grotesk', value: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
];

const FIELD_TYPES = [
  { type: FieldType.SHORT_TEXT, icon: Icons.Type, label: 'Short Text' },
  { type: FieldType.LONG_TEXT, icon: Icons.FileText, label: 'Long Text' },
  { type: FieldType.NUMBER, icon: Icons.Hash, label: 'Number' },
  { type: FieldType.SINGLE_CHOICE, icon: Icons.CircleDot, label: 'Single Choice' },
  { type: FieldType.MULTI_CHOICE, icon: Icons.CheckSquare, label: 'Multiple Choice' },
  { type: FieldType.DROPDOWN, icon: Icons.List, label: 'Dropdown' },
  { type: FieldType.RATING, icon: Icons.Star, label: 'Rating' },
  { type: FieldType.DATE, icon: Icons.Calendar, label: 'Date' },
];

// --- Components ---

const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'build' | 'settings'>('build');

  // History State for Undo/Redo
  const [history, setHistory] = useState<Form[]>([]);
  const [future, setFuture] = useState<Form[]>([]);

  useEffect(() => {
    if (id) {
      const data = FormsAPI.get(id);
      if (data) setForm(data);
    }
  }, [id]);

  // Inject font for preview in the builder
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

  const saveForm = (updatedForm: Form) => {
    if (!form) return;
    
    // Push current state to history before updating
    setHistory(prev => [...prev, form]);
    setFuture([]); // Clear future on new change

    setForm(updatedForm);
    setIsSaving(true);
    FormsAPI.update(updatedForm.id, updatedForm);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleUndo = () => {
    if (history.length === 0 || !form) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setFuture(prev => [form, ...prev]);
    setForm(previous);
    setHistory(newHistory);
    
    // Sync with backend (without pushing to history again)
    setIsSaving(true);
    FormsAPI.update(previous.id, previous);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleRedo = () => {
    if (future.length === 0 || !form) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setHistory(prev => [...prev, form]);
    setForm(next);
    setFuture(newFuture);

    // Sync with backend
    setIsSaving(true);
    FormsAPI.update(next.id, next);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleAddField = (type: FieldType) => {
    if (!form) return;
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: type === FieldType.RATING ? 'How would you rate this?' : 'Untitled Question',
      required: false,
      options: [FieldType.SINGLE_CHOICE, FieldType.MULTI_CHOICE, FieldType.DROPDOWN].includes(type) 
        ? [{ id: uuidv4(), label: 'Option 1' }, { id: uuidv4(), label: 'Option 2' }] 
        : undefined
    };
    saveForm({ ...form, fields: [...form.fields, newField] });
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!form) return;
    const newFields = form.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    saveForm({ ...form, fields: newFields });
  };

  const deleteField = (fieldId: string) => {
    if (!form) return;
    saveForm({ ...form, fields: form.fields.filter(f => f.id !== fieldId) });
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !form) return;
    setIsGenerating(true);
    try {
      const generatedFields = await generateFormSchema(aiPrompt);
      saveForm({ ...form, fields: [...form.fields, ...generatedFields] });
      setAiPrompt('');
    } catch (e) {
      alert('Failed to generate form. Please check your API Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!form) return <div className="p-10 text-center">Loading...</div>;

  const selectedField = form.fields.find(f => f.id === selectedFieldId);
  const selectedFieldTypeConfig = selectedField ? FIELD_TYPES.find(t => t.type === selectedField.type) : null;
  const SelectedFieldIcon = selectedFieldTypeConfig ? selectedFieldTypeConfig.icon : null;
  
  // Logic Helpers
  const potentialTriggerFields = form.fields.filter(f => 
    f.id !== selectedFieldId && 
    [FieldType.SINGLE_CHOICE, FieldType.DROPDOWN, FieldType.MULTI_CHOICE].includes(f.type)
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8fafc]">
      {/* Top Navigation Bar */}
      <header className="h-16 glass border-b border-white/50 flex items-center justify-between px-6 shrink-0 z-30 relative">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/50 text-gray-500 transition-colors">
            <Icons.ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block" />
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
             <span className="font-semibold text-gray-800 hidden md:block">Darevel Form</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Undo/Redo Controls */}
           <div className="flex items-center gap-1 bg-white/50 p-1 rounded-lg border border-white/60 mr-2">
             <button 
                onClick={handleUndo} 
                disabled={history.length === 0}
                className="p-1.5 rounded-md hover:bg-white text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Undo"
             >
                <Icons.Undo size={16} />
             </button>
             <button 
                onClick={handleRedo}
                disabled={future.length === 0}
                className="p-1.5 rounded-md hover:bg-white text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Redo"
             >
                <Icons.Redo size={16} />
             </button>
           </div>

          <span className="text-xs text-gray-400 font-medium hidden md:block w-20 text-right">
            {isSaving ? 'Saving...' : 'Saved'}
          </span>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
             <button 
               onClick={() => setView('build')}
               className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-all", view === 'build' ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700")}
             >
               Build
             </button>
             <button 
                onClick={() => setView('settings')}
                className={clsx("px-3 py-1.5 rounded-md text-sm font-medium transition-all", view === 'settings' ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700")}
             >
                Settings
             </button>
          </div>

          <Link 
            to={`/form/${form.id}`} 
            target="_blank"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <Icons.Eye size={20} />
          </Link>

          <button 
            onClick={() => saveForm({ ...form, status: form.status === FormStatus.ACTIVE ? FormStatus.DRAFT : FormStatus.ACTIVE, isPublic: true })}
            className={clsx(
              "px-5 py-2 rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30",
              form.status === FormStatus.ACTIVE 
                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                : "bg-gray-900 text-white hover:bg-black"
            )}
          >
            {form.status === FormStatus.ACTIVE ? 'Published' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar (Tools) - Only in Build mode */}
        {view === 'build' && (
          <aside className="w-16 md:w-20 glass border-r border-white/50 flex flex-col items-center py-6 gap-4 z-20 shrink-0">
             {FIELD_TYPES.map(ft => (
               <button
                 key={ft.type}
                 onClick={() => handleAddField(ft.type)}
                 className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-gray-500 hover:bg-white hover:text-purple-600 hover:shadow-md transition-all group relative"
               >
                 <ft.icon size={20} />
                 <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                   {ft.label}
                 </span>
               </button>
             ))}
             <div className="h-px w-8 bg-gray-300 my-2" />
             <div className="relative group">
                <button 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all"
                  title="AI Generator"
                >
                  <Icons.Wand2 size={20} />
                </button>
                {/* AI Popover */}
                <div className="absolute left-16 top-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-3 hidden group-hover:block hover:block z-50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Generate with AI</h4>
                    <textarea 
                      className="w-full text-sm border border-gray-200 rounded-lg p-2 mb-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      rows={3}
                      placeholder="Describe your form..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                    />
                    <button 
                      onClick={handleAiGenerate}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full bg-purple-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-purple-700"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Blocks'}
                    </button>
                </div>
             </div>
          </aside>
        )}

        {/* Center Canvas */}
        <main 
          className="flex-1 overflow-y-auto bg-slate-50/50 relative" 
          onClick={() => setSelectedFieldId(null)}
          style={{ fontFamily: AVAILABLE_FONTS.find(f => f.value === form.fontFamily)?.family || 'inherit' }}
        >
           {view === 'build' ? (
             <div className="max-w-3xl mx-auto py-12 px-8 min-h-full">
                
                {/* Form Title Block */}
                <div className="mb-12 group">
                   <input
                     type="text"
                     value={form.title}
                     onChange={(e) => saveForm({ ...form, title: e.target.value })}
                     className="text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-300 w-full"
                     placeholder="Untitled Form"
                   />
                   <input
                      type="text"
                      value={form.description}
                      onChange={(e) => saveForm({ ...form, description: e.target.value })}
                      className="mt-2 text-lg text-gray-500 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-gray-300"
                      placeholder="Add a description..."
                   />
                </div>

                {/* Form Blocks */}
                <div className="space-y-4">
                  {form.fields.map((field) => (
                    <div 
                      key={field.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id); }}
                      className={clsx(
                        "group relative rounded-xl border-2 transition-all duration-200 p-6 cursor-pointer",
                        selectedFieldId === field.id 
                          ? "bg-white border-purple-500 shadow-xl shadow-purple-500/5 ring-4 ring-purple-500/5" 
                          : "bg-white/40 border-transparent hover:bg-white hover:shadow-sm hover:border-gray-200"
                      )}
                    >
                       {/* Drag Handle (Visual only for now) */}
                       <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab p-1">
                          <Icons.GripVertical size={16} />
                       </div>

                       {/* Conditional Logic Indicator */}
                       {field.logic && (
                         <div className="absolute right-4 top-4 text-purple-600 bg-purple-50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                           <Icons.GitBranch size={12} />
                           Logic Active
                         </div>
                       )}

                       <div className="pl-6">
                          {/* Question Input */}
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className={clsx(
                              "w-full bg-transparent border-none p-0 text-lg font-medium text-gray-800 focus:ring-0 placeholder-gray-400 mb-3",
                              selectedFieldId === field.id ? "" : "pointer-events-none"
                            )}
                            placeholder="Question text"
                          />

                          {/* Preview Area */}
                          <div className="opacity-60 pointer-events-none">
                              {field.type === FieldType.SHORT_TEXT && <div className="h-10 border-b border-gray-200 bg-gray-50/50 rounded-t w-full" />}
                              {field.type === FieldType.LONG_TEXT && <div className="h-24 border-b border-gray-200 bg-gray-50/50 rounded-t w-full" />}
                              
                              {(field.type === FieldType.SINGLE_CHOICE || field.type === FieldType.MULTI_CHOICE) && (
                                <div className="space-y-2">
                                  {field.options?.map((opt, i) => (
                                    <div key={opt.id} className="flex items-center gap-3">
                                      <div className={clsx("w-4 h-4 border border-gray-300", field.type === FieldType.SINGLE_CHOICE ? "rounded-full" : "rounded")} />
                                      <span className="text-gray-500 text-sm">{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                               {field.type === FieldType.RATING && (
                                  <div className="flex gap-2 text-gray-300">
                                     {[1,2,3,4,5].map(i => <Icons.Star key={i} size={24} />)}
                                  </div>
                               )}
                          </div>
                       </div>

                       {/* Quick Actions */}
                       {selectedFieldId === field.id && (
                          <div className="absolute right-4 top-4 flex gap-1">
                             <button onClick={(e) => { e.stopPropagation(); deleteField(field.id); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Icons.Trash2 size={16} />
                             </button>
                          </div>
                       )}
                    </div>
                  ))}

                  {/* Empty State / Add Block Hint */}
                  <div 
                    onClick={() => handleAddField(FieldType.SHORT_TEXT)}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-2">
                       <Icons.Plus size={24} />
                       <span className="font-medium">Click to add a new block</span>
                    </div>
                  </div>
                </div>
             </div>
           ) : (
              // Settings View Center Placeholder
              <div className="flex items-center justify-center h-full text-gray-400">
                 <div className="text-center">
                    <Icons.Settings size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a setting from the right panel</p>
                 </div>
              </div>
           )}
        </main>

        {/* Right Property Panel (Build Mode) */}
        {view === 'build' && selectedFieldId && selectedField && (
          <aside className="w-80 glass-panel h-full overflow-y-auto p-6 flex flex-col z-20 shadow-xl shadow-gray-200/50 animate-slide-in-right shrink-0">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-gray-800">Block Properties</h3>
               <button onClick={() => setSelectedFieldId(null)} className="text-gray-400 hover:text-gray-600"><Icons.X size={18} /></button>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                   <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {SelectedFieldIcon && <SelectedFieldIcon size={18} className="text-purple-600" />}
                      <span className="text-sm font-medium text-gray-700">{selectedFieldTypeConfig?.label}</span>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</label>
                   
                   <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Required</span>
                      <button 
                        onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                        className={clsx("w-11 h-6 rounded-full transition-colors relative", selectedField.required ? "bg-purple-600" : "bg-gray-200")}
                      >
                         <div className={clsx("w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm", selectedField.required ? "left-6" : "left-1")} />
                      </button>
                   </div>
                </div>

                {/* Option Editor for Choice Fields */}
                {[FieldType.SINGLE_CHOICE, FieldType.MULTI_CHOICE, FieldType.DROPDOWN].includes(selectedField.type) && (
                   <div className="space-y-3 pt-4 border-t border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Options</label>
                      <div className="space-y-2">
                         {selectedField.options?.map((opt, idx) => (
                           <div key={opt.id} className="flex items-center gap-2 group">
                             <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                             <input 
                               value={opt.label}
                               onChange={(e) => {
                                 const newOpts = [...(selectedField.options || [])];
                                 newOpts[idx].label = e.target.value;
                                 updateField(selectedField.id, { options: newOpts });
                               }}
                               className="flex-1 bg-transparent border-b border-transparent focus:border-purple-300 focus:outline-none text-sm py-1"
                             />
                             <button 
                               onClick={() => {
                                  const newOpts = selectedField.options?.filter(o => o.id !== opt.id);
                                  updateField(selectedField.id, { options: newOpts });
                               }}
                               className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                             >
                               <Icons.X size={14} />
                             </button>
                           </div>
                         ))}
                         <button 
                            onClick={() => updateField(selectedField.id, { options: [...(selectedField.options || []), { id: uuidv4(), label: `Option ${(selectedField.options?.length || 0) + 1}` }] })}
                            className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"
                         >
                            <Icons.Plus size={14} /> Add Option
                         </button>
                      </div>
                   </div>
                )}

                {/* Conditional Logic Section */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                     <Icons.GitBranch size={16} className="text-purple-600" />
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Conditional Logic</label>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Show this field if...</label>
                       <select 
                         value={selectedField.logic?.triggerFieldId || ''}
                         onChange={(e) => {
                           const val = e.target.value;
                           if (!val) {
                             updateField(selectedField.id, { logic: undefined });
                           } else {
                             updateField(selectedField.id, { logic: { triggerFieldId: val, condition: 'equals', value: '' } });
                           }
                         }}
                         className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                       >
                         <option value="">-- Always Visible --</option>
                         {potentialTriggerFields.map(f => (
                           <option key={f.id} value={f.id}>{f.label}</option>
                         ))}
                       </select>
                     </div>

                     {selectedField.logic && (
                       <>
                        <div className="text-center text-xs text-gray-400 font-medium">EQUALS</div>
                        <div>
                           {(() => {
                              const triggerField = form.fields.find(f => f.id === selectedField.logic?.triggerFieldId);
                              if (triggerField?.options) {
                                return (
                                  <select
                                    value={selectedField.logic.value}
                                    onChange={(e) => updateField(selectedField.id, { logic: { ...selectedField.logic!, value: e.target.value } })}
                                    className="w-full text-xs p-2 rounded border border-gray-300 bg-white"
                                  >
                                    <option value="">-- Select Value --</option>
                                    {triggerField.options.map(opt => (
                                      <option key={opt.id} value={opt.label}>{opt.label}</option>
                                    ))}
                                  </select>
                                );
                              }
                              return (
                                <input 
                                  type="text"
                                  placeholder="Type value to match..."
                                  value={selectedField.logic.value}
                                  onChange={(e) => updateField(selectedField.id, { logic: { ...selectedField.logic!, value: e.target.value } })}
                                  className="w-full text-xs p-2 rounded border border-gray-300"
                                />
                              );
                           })()}
                        </div>
                       </>
                     )}
                  </div>
                </div>

             </div>
          </aside>
        )}

        {/* Settings Panel (Settings Mode) */}
        {view === 'settings' && (
           <aside className="w-96 glass-panel h-full p-6 animate-slide-in-right z-20 overflow-y-auto shrink-0">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                 <Icons.Settings size={20} /> Form Settings
              </h3>
              
              <div className="space-y-8">
                 {/* Visual Theme Section */}
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Visual Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                       {THEME_PRESETS.map(theme => (
                          <button
                             key={theme.id}
                             onClick={() => saveForm({ ...form, themeColor: theme.id })}
                             className={clsx(
                                "p-3 rounded-lg border text-left transition-all hover:scale-105",
                                form.themeColor === theme.id ? "border-purple-500 ring-2 ring-purple-500/20" : "border-gray-200 hover:border-gray-300",
                                theme.id === 'modern' && "bg-gray-100",
                                theme.id === 'glass' && "bg-gradient-to-br from-purple-100 to-blue-100",
                                theme.id === 'neo-dark' && "bg-gray-800 text-white",
                                theme.id === 'aqua' && "bg-cyan-50",
                                theme.id === 'sunset' && "bg-orange-50",
                                theme.id === 'minimal' && "bg-white"
                             )}
                          >
                             <span className="text-sm font-medium">{theme.label}</span>
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Typography Section */}
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Typography</label>
                    
                    {/* Font Selection Grid */}
                    <div className="grid grid-cols-1 gap-2 mb-4">
                       {AVAILABLE_FONTS.map(font => (
                          <button
                             key={font.value}
                             onClick={() => saveForm({ ...form, fontFamily: font.value })}
                             className={clsx(
                                "p-3 rounded-lg border text-left transition-all flex items-center justify-between group",
                                form.fontFamily === font.value ? "bg-purple-50 border-purple-500 text-purple-700" : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                             )}
                          >
                             <span style={{ fontFamily: font.family }} className="text-lg">Aa</span>
                             <span className="text-sm font-medium flex-1 ml-3">{font.label}</span>
                             {form.fontFamily === font.value && <Icons.Check size={16} />}
                          </button>
                       ))}
                    </div>

                    {/* Simulated Upload Button */}
                    <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                       <Icons.Type size={16} />
                       Upload Custom Font (Pro)
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">Supports TTF, OTF, WOFF</p>
                 </div>
              </div>
           </aside>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
