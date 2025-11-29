import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  title: string;
  description: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ title, description, type = 'info', action }) => {
  const styles = {
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  } as const;

  const icons = {
    danger: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  } as const;

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 ${styles[type]}`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm mt-1 opacity-90">{description}</p>
      </div>
      {action && <div className="self-center">{action}</div>}
    </div>
  );
};
