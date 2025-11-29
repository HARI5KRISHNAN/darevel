import React, { useState } from 'react';
import { useAuthzStore } from '../../../store/authzStore';
import { Search, User as UserIcon, Shield, X, PlusCircle } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

const UserAssignmentPage = () => {
  const { users, roles, teams, assignUserRole, revokeUserRole } = useAuthzStore();
  const { addToast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // Derive effective roles (direct + team inherited)
  const effectiveRoles = selectedUser
    ? [
        ...selectedUser.roles.map((rid) => ({ id: rid, source: 'Direct' })),
        ...selectedUser.teamIds.flatMap((tid) => {
          const team = teams.find((t) => t.id === tid);
          return team ? team.roles.map((rid) => ({ id: rid, source: `Team: ${team.name}` })) : [];
        }),
      ]
    : [];

  const availableRoles = roles.filter(
    (r) => !selectedUser?.roles.includes(r.id)
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (roleId: string) => {
    if (selectedUserId) {
      assignUserRole(selectedUserId, roleId);
      addToast('Role assigned to user.', 'success');
    }
  };

  const handleRevoke = (roleId: string) => {
    if (selectedUserId) {
      revokeUserRole(selectedUserId, roleId);
      addToast('Role revoked from user.', 'info');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Role Assignment</h1>
      
      <div className="flex gap-6 h-full">
        {/* User List Sidebar */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No users found matching "{searchTerm}"
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    selectedUserId === user.id ? 'bg-indigo-50 border-indigo-200 border' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                  <div className="overflow-hidden">
                    <p className={`font-medium truncate ${selectedUserId === user.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto">
          {selectedUser ? (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <img src={selectedUser.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedUser.teamIds.map(tid => {
                        const team = teams.find(t => t.id === tid);
                        return team ? <span key={tid} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{team.name}</span> : null
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Roles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ShieldCheckIcon /> Active Roles
                  </h3>
                  <div className="space-y-3">
                    {effectiveRoles.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No roles assigned.</p>
                    )}
                    {effectiveRoles.map((roleRef, idx) => {
                      const roleDetails = roles.find((r) => r.id === roleRef.id);
                      if (!roleDetails) return null;
                      const isDirect = roleRef.source === 'Direct';
                      return (
                        <div key={`${roleRef.id}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg group">
                          <div>
                            <p className="font-medium text-gray-800">{roleDetails.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              Source: {isDirect ? <span className="text-green-600 font-medium">Direct Assignment</span> : <span className="text-blue-600 font-medium">{roleRef.source}</span>}
                            </p>
                          </div>
                          {isDirect && (
                            <button
                              onClick={() => handleRevoke(roleDetails.id)}
                              className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Revoke Role"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Available Roles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <PlusCircle size={20} className="text-gray-400" /> Assign New Role
                  </h3>
                  <div className="space-y-2">
                    {availableRoles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                        <div>
                          <p className="font-medium text-gray-700">{role.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{role.description}</p>
                        </div>
                        <button
                          onClick={() => handleAssign(role.id)}
                          className="text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                    {availableRoles.length === 0 && (
                      <p className="text-sm text-gray-400 italic">All available roles assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <UserIcon size={48} className="mb-4 opacity-20" />
              <p>Select a user to manage their roles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ShieldCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-green-600"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default UserAssignmentPage;
