import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle, CheckSquare, Square, RefreshCcw } from 'lucide-react';
import { useAuthzStore } from '../../../store/authzStore';
import { Role, Permission } from '../../../types';
import { useToast } from '../../../components/ui/Toast';

interface RoleEditorPageProps {
  roleId?: string;
  onNavigate: (view: any) => void;
}

const RoleEditorPage: React.FC<RoleEditorPageProps> = ({ roleId, onNavigate }) => {
  const { roles, permissions, updateRole } = useAuthzStore();
  const { addToast } = useToast();

  const [roleData, setRoleData] = useState<Role | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const found = roles.find((r) => r.id === roleId);
    if (found) {
      setRoleData(JSON.parse(JSON.stringify(found))); // Deep copy
    }
  }, [roleId, roles]);

  if (!roleData) return <div>Loading...</div>;

  const groupedPermissions = permissions.reduce((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = [];
    acc[curr.module].push(curr);
    return acc;
  }, {} as Record<string, Permission[]>);

  const togglePermission = (code: string) => {
    setRoleData((prev) => {
      if (!prev) return null;
      const exists = prev.permissions.includes(code);
      const newPerms = exists
        ? prev.permissions.filter((p) => p !== code)
        : [...prev.permissions, code];
      return { ...prev, permissions: newPerms };
    });
    setHasChanges(true);
  };

  const toggleModule = (module: string, allModulePerms: string[]) => {
    setRoleData((prev) => {
      if (!prev) return null;
      const allSelected = allModulePerms.every((p) => prev.permissions.includes(p));
      
      let newPerms = [...prev.permissions];
      if (allSelected) {
        // Deselect all
        newPerms = newPerms.filter((p) => !allModulePerms.includes(p));
      } else {
        // Select all (add missing)
        allModulePerms.forEach((p) => {
          if (!newPerms.includes(p)) newPerms.push(p);
        });
      }
      return { ...prev, permissions: newPerms };
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (roleData) {
      updateRole(roleData.id, {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
      });
      setHasChanges(false);
      addToast('Role configuration saved successfully.', 'success');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-10 border-b border-gray-100">
        <button
          onClick={() => onNavigate({ name: 'roles_list' })}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {roleData.isSystem ? `Editing ${roleData.name}` : 'Edit Custom Role'}
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            ID: {roleData.id}
            {roleData.isSystem && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={10} /> System Role
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-sm ${
            hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* Role Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              value={roleData.name}
              onChange={(e) => {
                setRoleData({ ...roleData, name: e.target.value });
                setHasChanges(true);
              }}
              disabled={roleData.isSystem} // Prevent renaming system roles
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={roleData.description}
              onChange={(e) => {
                setRoleData({ ...roleData, description: e.target.value });
                setHasChanges(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Permissions Config</h2>
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => {
          const perms = modulePerms as Permission[];
          const allSelected = perms.every((p) => roleData.permissions.includes(p.code));
          const someSelected = perms.some((p) => roleData.permissions.includes(p.code));

          return (
            <div key={moduleName} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 capitalize">{moduleName}</h3>
                <button
                  onClick={() => toggleModule(moduleName, perms.map(p => p.code))}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {perms.map((perm) => {
                  const isSelected = roleData.permissions.includes(perm.code);
                  return (
                    <div
                      key={perm.code}
                      onClick={() => togglePermission(perm.code)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'bg-white border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className={`mt-0.5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`}>
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                          {perm.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                        <code className="text-[10px] text-gray-400 mt-1 block">{perm.code}</code>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleEditorPage;
