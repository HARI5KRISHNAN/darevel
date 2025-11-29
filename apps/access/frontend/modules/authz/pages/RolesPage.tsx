import React from 'react';
import { Plus, Shield, ShieldCheck, Edit3, Trash2, Copy } from 'lucide-react';
import { useAuthzStore } from '../../../store/authzStore';
import { Role } from '../../../types';
import { useToast } from '../../../components/ui/Toast';

interface RolesPageProps {
  onNavigate: (view: any) => void;
}

const RolesPage: React.FC<RolesPageProps> = ({ onNavigate }) => {
  const { roles, addRole, deleteRole } = useAuthzStore();
  const { addToast } = useToast();

  const handleCreate = () => {
    const newId = `role_${Date.now()}`;
    const newRole: Role = {
      id: newId,
      name: 'New Custom Role',
      description: 'Describe the role access level...',
      isSystem: false,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addRole(newRole);
    addToast('New role created. Please configure permissions.', 'success');
    onNavigate({ name: 'role_editor', roleId: newId });
  };

  const handleDuplicate = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}`,
      name: `${role.name} (Copy)`,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addRole(newRole);
    addToast('Role duplicated successfully.', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      deleteRole(id);
      addToast('Role deleted.', 'success');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage system roles and custom access controls.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${role.isSystem ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                  {role.isSystem ? <ShieldCheck size={24} /> : <Shield size={24} />}
                </div>
                {role.isSystem && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                    System
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{role.name}</h3>
              <p className="text-gray-500 text-sm mb-4 min-h-[40px]">{role.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {role.permissions.length} permissions
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                  ID: {role.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => onNavigate({ name: 'role_editor', roleId: role.id })}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Edit3 size={16} />
                Edit
              </button>
              
              <button
                onClick={() => handleDuplicate(role)}
                title="Duplicate Role"
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Copy size={16} />
              </button>

              {!role.isSystem && (
                <button
                  onClick={() => handleDelete(role.id)}
                  title="Delete Role"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPage;
