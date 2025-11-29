import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { WorkflowService, PREBUILT_TEMPLATES } from '../services/api';
import { GeminiService } from '../services/gemini';
import { Workflow, TriggerType, ActionType, WorkflowStatus } from '../types';
import { ArrowDown, Plus, Save, Sparkles, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

const INITIAL_WORKFLOW: Workflow = {
  id: '',
  name: 'Untitled Workflow',
  description: '',
  status: WorkflowStatus.DRAFT,
  createdAt: new Date().toISOString(),
  runCount: 0,
  trigger: { type: TriggerType.FORM_SUBMIT, conditions: {} },
  actions: [],
};

export const WorkflowBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [workflow, setWorkflow] = useState<Workflow>(INITIAL_WORKFLOW);
  const [loading, setLoading] = useState(!!id && id !== 'new');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ type: 'trigger' | 'action'; index?: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (id && id !== 'new') {
        const wf = await WorkflowService.getWorkflowById(id);
        if (wf) setWorkflow(wf);
        setLoading(false);
      } else if (templateId) {
        const tpl = PREBUILT_TEMPLATES.find(t => t.id === templateId);
        if (tpl) {
          setWorkflow({
            ...tpl,
            id: `wf-${Date.now()}`,
            status: WorkflowStatus.DRAFT,
            createdAt: new Date().toISOString(),
            runCount: 0,
            actions: tpl.actions.map((a, i) => ({ ...a, id: `act-${Date.now()}-${i}` })),
          });
        } else {
          setWorkflow(prev => ({ ...prev, id: `wf-${Date.now()}` }));
        }
      } else {
        setWorkflow(prev => ({ ...prev, id: `wf-${Date.now()}` }));
      }
    };
    loadData();
  }, [id, templateId]);

  const handleSave = async () => {
    await WorkflowService.saveWorkflow(workflow);
    navigate('/workflows');
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const generated = await GeminiService.generateWorkflowFromPrompt(aiPrompt);
      setWorkflow(prev => ({
        ...prev,
        name: generated.name || prev.name,
        description: generated.description || prev.description,
        trigger: generated.trigger,
        actions: generated.actions.map((a: any, idx: number) => ({ ...a, id: `act-${Date.now()}-${idx}` })),
      }));
      setAiPrompt('');
    } catch (e) {
      alert('Failed to generate workflow. Please check your API key or try a different prompt.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addAction = () => {
    const newAction = {
      id: `act-${Date.now()}`,
      type: ActionType.CREATE_TASK,
      config: {},
    };
    setWorkflow(prev => ({ ...prev, actions: [...prev.actions, newAction] }));
    setSelectedNode({ type: 'action', index: workflow.actions.length });
  };

  const removeAction = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
    if (selectedNode?.index === index) setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/workflows')} className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                value={workflow.name}
                onChange={e => setWorkflow({ ...workflow, name: e.target.value })}
                className="font-bold text-slate-800 focus:outline-none focus:border-b-2 border-indigo-500 bg-transparent placeholder-slate-400"
                placeholder="Workflow Name"
              />
              <input
                value={workflow.description}
                onChange={e => setWorkflow({ ...workflow, description: e.target.value })}
                className="block text-xs text-slate-500 w-full mt-1 focus:outline-none bg-transparent"
                placeholder="Add description..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </button>
          </div>
        </div>

        <div className="bg-indigo-50 border-b border-indigo-100 p-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <input
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="Ask AI to build it: 'When I get an email from VIP, slack the team and create a high priority task'"
            className="flex-1 bg-white border-none rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300"
            onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
          />
          <button
            onClick={handleAiGenerate}
            disabled={isAiLoading}
            className="text-xs font-bold text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded"
          >
            {isAiLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
            <div
              onClick={() => setSelectedNode({ type: 'trigger' })}
              className={`
                        w-64 p-4 rounded-xl border-2 cursor-pointer transition-all relative group bg-white shadow-sm
                        ${selectedNode?.type === 'trigger' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-indigo-300'}
                    `}
            >
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trigger</div>
              <div className="font-semibold text-slate-800">{workflow.trigger.type}</div>
              <div className="text-xs text-slate-500 mt-1 truncate">
                {Object.keys(workflow.trigger.conditions).length > 0
                  ? JSON.stringify(workflow.trigger.conditions)
                  : 'No conditions set'}
              </div>
            </div>

            <ArrowDown className="text-slate-300" />

            {workflow.actions.map((action, idx) => (
              <React.Fragment key={action.id}>
                <div
                  onClick={() => setSelectedNode({ type: 'action', index: idx })}
                  className={`
                                w-64 p-4 rounded-xl border-2 cursor-pointer transition-all relative group bg-white shadow-sm
                                ${selectedNode?.type === 'action' && selectedNode.index === idx ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200 hover:border-indigo-300'}
                            `}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Action {idx + 1}</div>
                    <button
                      onClick={e => removeAction(idx, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-semibold text-slate-800">{action.type}</div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {Object.keys(action.config).length > 0 ? JSON.stringify(action.config) : 'Not configured'}
                  </div>
                </div>
                <ArrowDown className="text-slate-300" />
              </React.Fragment>
            ))}

            <button
              onClick={addAction}
              className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 hover:scale-110 transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 font-semibold text-slate-700">
          {selectedNode ? (selectedNode.type === 'trigger' ? 'Configure Trigger' : 'Configure Action') : 'Select a node'}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {!selectedNode && (
            <div className="text-center text-slate-400 mt-10">
              <p>Click on a block in the canvas to edit its properties.</p>
            </div>
          )}

          {selectedNode?.type === 'trigger' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trigger Type</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  value={workflow.trigger.type}
                  onChange={e => setWorkflow({
                    ...workflow,
                    trigger: { ...workflow.trigger, type: e.target.value as TriggerType },
                  })}
                >
                  {Object.values(TriggerType).map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conditions (JSON)</label>
                <textarea
                  className="w-full p-2 border border-slate-300 rounded-md text-sm font-mono h-32"
                  value={JSON.stringify(workflow.trigger.conditions, null, 2)}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setWorkflow({ ...workflow, trigger: { ...workflow.trigger, conditions: parsed } });
                    } catch (err) {
                      // ignore invalid json while typing
                    }
                  }}
                />
                <p className="text-xs text-slate-400 mt-1">Enter valid JSON object.</p>
              </div>
            </div>
          )}

          {selectedNode?.type === 'action' && selectedNode.index !== undefined && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action Type</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  value={workflow.actions[selectedNode.index].type}
                  onChange={e => {
                    const newActions = [...workflow.actions];
                    newActions[selectedNode.index!] = {
                      ...newActions[selectedNode.index!],
                      type: e.target.value as ActionType,
                    };
                    setWorkflow({ ...workflow, actions: newActions });
                  }}
                >
                  {Object.values(ActionType).map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Configuration (JSON)</label>
                <textarea
                  className="w-full p-2 border border-slate-300 rounded-md text-sm font-mono h-32"
                  value={JSON.stringify(workflow.actions[selectedNode.index].config, null, 2)}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      const newActions = [...workflow.actions];
                      newActions[selectedNode.index!] = {
                        ...newActions[selectedNode.index!],
                        config: parsed,
                      };
                      setWorkflow({ ...workflow, actions: newActions });
                    } catch (err) {
                      // ignore
                    }
                  }}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Use <code>{'{{trigger.field}}'}</code> for dynamic data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
