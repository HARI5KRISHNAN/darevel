import React from 'react';
import { ActionType, ResourceType } from '../types';
import { FileText, Database, FileSpreadsheet, Users, CreditCard, HardDrive, ShieldAlert, Edit, Plus, Eye, Trash2 } from 'lucide-react';

export const ActionBadge: React.FC<{ action: ActionType }> = ({ action }) => {
  const styles = {
    [ActionType.READ]: "bg-green-100 text-green-700 border-green-200",
    [ActionType.CREATE]: "bg-blue-100 text-blue-700 border-blue-200",
    [ActionType.UPDATE]: "bg-amber-100 text-amber-700 border-amber-200", // Yellow equivalent
    [ActionType.DELETE]: "bg-red-100 text-red-700 border-red-200",
    [ActionType.SECURITY]: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const Icon = {
    [ActionType.READ]: Eye,
    [ActionType.CREATE]: Plus,
    [ActionType.UPDATE]: Edit,
    [ActionType.DELETE]: Trash2,
    [ActionType.SECURITY]: ShieldAlert,
  }[action];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[action]}`}>
      <Icon size={12} strokeWidth={2.5} />
      {action}
    </span>
  );
};

export const ResourceBadge: React.FC<{ resource: ResourceType }> = ({ resource }) => {
  const Icon = {
    [ResourceType.FILE]: FileText,
    [ResourceType.DOC]: FileText,
    [ResourceType.SHEET]: FileSpreadsheet,
    [ResourceType.USER]: Users,
    [ResourceType.BILLING]: CreditCard,
    [ResourceType.DRIVE]: HardDrive,
  }[resource] || FileText;

  return (
    <span className="inline-flex items-center gap-2 text-slate-600 text-sm">
      <Icon size={16} className="text-slate-400" />
      <span className="capitalize">{resource.toLowerCase()}</span>
    </span>
  );
};