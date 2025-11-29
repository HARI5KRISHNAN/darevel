import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { Bell, Smartphone, Monitor, Volume2, Clock, Settings } from 'lucide-react';
import { NotificationType } from '../types';

export const SettingsPage: React.FC = () => {
  const { preferences, updatePreferences } = useNotificationStore();
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (preferences) setLocalPrefs(preferences);
  }, [preferences]);

  const handleToggleTool = (tool: NotificationType) => {
    if (!localPrefs) return;
    setLocalPrefs({
      ...localPrefs,
      enabledTools: {
        ...localPrefs.enabledTools,
        [tool]: !localPrefs.enabledTools[tool]
      }
    });
  };

  const handleToggleSetting = (key: 'desktopPushEnabled' | 'mobilePushEnabled' | 'soundEnabled') => {
    if (!localPrefs) return;
    setLocalPrefs({
      ...localPrefs,
      [key]: !localPrefs[key]
    });
  };

  const handleMuteChange = (duration: string) => {
    if (!localPrefs) return;
    let mutedUntil = null;
    if (duration !== 'none') {
      const now = new Date();
      if (duration === '1h') now.setHours(now.getHours() + 1);
      if (duration === '8h') now.setHours(now.getHours() + 8);
      if (duration === '24h') now.setHours(now.getHours() + 24);
      if (duration === 'week') now.setDate(now.getDate() + 7);
      mutedUntil = now.toISOString();
    }
    setLocalPrefs({ ...localPrefs, mutedUntil });
  };

  const savePreferences = async () => {
    if (!localPrefs) return;
    setSaveStatus('saving');
    await updatePreferences(localPrefs);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  if (!localPrefs) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-500">Manage how and when you receive notifications</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
             <h2 className="font-semibold text-gray-900 flex items-center gap-2">
               <Clock size={18} /> Do Not Disturb
             </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">Pause all notifications for a specific duration.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
               {[
                 { label: 'Off', val: 'none' },
                 { label: '1 Hour', val: '1h' },
                 { label: '8 Hours', val: '8h' },
                 { label: '24 Hours', val: '24h' },
                 { label: '1 Week', val: 'week' },
               ].map(opt => (
                 <button
                   key={opt.val}
                   onClick={() => handleMuteChange(opt.val)}
                   className={`
                     py-2 px-3 rounded-lg text-sm font-medium border transition-all
                     ${(opt.val === 'none' && !localPrefs.mutedUntil) || (localPrefs.mutedUntil && opt.val !== 'none')
                       ? 'bg-blue-50 border-blue-200 text-blue-700' 
                       : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                     }
                   `}
                 >
                   {opt.label}
                 </button>
               ))}
            </div>
            {localPrefs.mutedUntil && (
               <p className="mt-3 text-xs text-orange-600 font-medium">
                 Notifications muted until {new Date(localPrefs.mutedUntil).toLocaleString()}
               </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
             <h2 className="font-semibold text-gray-900 flex items-center gap-2">
               <Bell size={18} /> Delivery Channels
             </h2>
          </div>
          <div className="divide-y divide-gray-100">
             <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Monitor size={20} /></div>
                 <div>
                   <p className="font-medium text-gray-900">Desktop Push</p>
                   <p className="text-xs text-gray-500">Receive browser notifications</p>
                 </div>
               </div>
               <button 
                 onClick={() => handleToggleSetting('desktopPushEnabled')}
                 className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${localPrefs.desktopPushEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
               >
                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${localPrefs.desktopPushEnabled ? 'translate-x-5' : ''}`} />
               </button>
             </div>
             <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Smartphone size={20} /></div>
                 <div>
                   <p className="font-medium text-gray-900">Mobile Push</p>
                   <p className="text-xs text-gray-500">Receive notifications on mobile app</p>
                 </div>
               </div>
               <button 
                 onClick={() => handleToggleSetting('mobilePushEnabled')}
                 className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${localPrefs.mobilePushEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
               >
                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${localPrefs.mobilePushEnabled ? 'translate-x-5' : ''}`} />
               </button>
             </div>
             <div className="p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Volume2 size={20} /></div>
                 <div>
                   <p className="font-medium text-gray-900">Sound</p>
                   <p className="text-xs text-gray-500">Play a sound for incoming notifications</p>
                 </div>
               </div>
               <button 
                 onClick={() => handleToggleSetting('soundEnabled')}
                 className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${localPrefs.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
               >
                 <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${localPrefs.soundEnabled ? 'translate-x-5' : ''}`} />
               </button>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
             <h2 className="font-semibold text-gray-900 flex items-center gap-2">
               <Settings size={18} /> App Notifications
             </h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
             {['chat', 'mail', 'task', 'calendar', 'mention', 'doc', 'drive'].map((tool) => (
                <div key={tool} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                   <span className="capitalize font-medium text-gray-700">{tool}</span>
                   <button 
                     onClick={() => handleToggleTool(tool as NotificationType)}
                     className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${localPrefs.enabledTools[tool as NotificationType] ? 'bg-green-500' : 'bg-gray-300'}`}
                   >
                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${localPrefs.enabledTools[tool as NotificationType] ? 'translate-x-5' : ''}`} />
                   </button>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={savePreferences}
          disabled={saveStatus === 'saving'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center gap-2"
        >
          {saveStatus === 'saving' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          {saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
