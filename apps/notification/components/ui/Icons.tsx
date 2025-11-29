import React from 'react';
import { 
  MessageSquare, Mail, CheckSquare, Calendar, AtSign, 
  MessageCircle, FileText, Layout, HardDrive, Bell, 
  Settings, CheckCheck, Trash2, Sliders
} from 'lucide-react';
import { NotificationType } from '../../types';

export const getIconForType = (type: NotificationType) => {
  switch (type) {
    case 'chat': return <MessageSquare size={16} className="text-blue-500" />;
    case 'mail': return <Mail size={16} className="text-red-500" />;
    case 'task': return <CheckSquare size={16} className="text-green-500" />;
    case 'calendar': return <Calendar size={16} className="text-orange-500" />;
    case 'mention': return <AtSign size={16} className="text-purple-500" />;
    case 'comment': return <MessageCircle size={16} className="text-indigo-500" />;
    case 'doc': return <FileText size={16} className="text-blue-400" />;
    case 'form': return <Layout size={16} className="text-teal-500" />;
    case 'drive': return <HardDrive size={16} className="text-yellow-500" />;
    default: return <Bell size={16} className="text-gray-500" />;
  }
};

export { 
  Bell, Settings, CheckCheck, Trash2, Sliders, Calendar, Mail, CheckSquare 
};
