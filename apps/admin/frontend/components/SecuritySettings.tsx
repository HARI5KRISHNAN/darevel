import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShieldCheck, Save, Lock } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Card, Button, Input } from './ui/UIComponents';
import { SecurityPolicy } from '../types';

const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
      checked ? 'bg-indigo-600' : 'bg-gray-200'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const SecuritySettings: React.FC = () => {
  const { data: policy } = useQuery({ queryKey: ['policy'], queryFn: mockApi.fetchPolicy });
  const [localPolicy, setLocalPolicy] = useState<SecurityPolicy | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (policy) setLocalPolicy(policy);
  }, [policy]);

  const mutation = useMutation({
    mutationFn: mockApi.updatePolicy,
    onSuccess: () => {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    },
  });

  if (!localPolicy) return <div>Loading...</div>;

  const handleSave = () => {
    mutation.mutate(localPolicy);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <Button onClick={handleSave} isLoading={mutation.isPending}>
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="p-2 bg-indigo-50 rounded text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Authentication Policy</h3>
            <p className="text-sm text-gray-500">Manage how your team accesses the platform.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Require MFA</label>
              <p className="text-sm text-gray-500">Mandate Multi-Factor Authentication for all users.</p>
            </div>
            <Toggle checked={localPolicy.mfaRequired} onChange={v => setLocalPolicy({ ...localPolicy, mfaRequired: v })} />
          </div>

          <div className="pt-4 border-t border-gray-100"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Minimum Password Length"
              type="number"
              value={localPolicy.minPasswordLength}
              onChange={e => setLocalPolicy({ ...localPolicy, minPasswordLength: parseInt(e.target.value, 10) })}
            />
            <div className="space-y-4 mt-1">
              <label className="block text-sm font-medium text-gray-700">Complexity Requirements</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="specChars"
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                  checked={localPolicy.requireSpecialChar}
                  onChange={e => setLocalPolicy({ ...localPolicy, requireSpecialChar: e.target.checked })}
                />
                <label htmlFor="specChars" className="text-sm text-gray-600">
                  Require special character
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="nums"
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                  checked={localPolicy.requireNumber}
                  onChange={e => setLocalPolicy({ ...localPolicy, requireNumber: e.target.checked })}
                />
                <label htmlFor="nums" className="text-sm text-gray-600">
                  Require number
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100"></div>

          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-900">Session Controls</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={localPolicy.sessionTimeout}
                onChange={e => setLocalPolicy({ ...localPolicy, sessionTimeout: parseInt(e.target.value, 10) })}
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-5">
          Settings saved successfully.
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;
