import React, { useState } from 'react';
import { useAuthzStore } from '../../../store/authzStore';
import { Search, Users, Shield, X, PlusCircle } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { Role } from '../../../types';

const TeamAssignmentPage = () => {
  const { teams, roles, assignTeamRole, revokeTeamRole } = useAuthzStore();
  const { addToast } = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // For teams, roles are just direct assignments
  const activeRoles = selectedTeam
    ? selectedTeam.roles.map(roleId => {
        const role = roles.find(r => r.id === roleId);
        return role ? { ...role } : null;
    }).filter((r): r is Role => r !== null)
    : [];

  const availableRoles = roles.filter(
    (r) => !selectedTeam?.roles.includes(r.id)
  );

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = (roleId: string) => {
    if (selectedTeamId) {
      assignTeamRole(selectedTeamId, roleId);
      addToast('Role assigned to team.', 'success');
    }
  };

  const handleRevoke = (roleId: string) => {
    if (selectedTeamId) {
      revokeTeamRole(selectedTeamId, roleId);
      addToast('Role revoked from team.', 'info');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Role Assignment</h1>
      
      <div className="flex gap-6 h-full">
        {/* Team List Sidebar */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search teams..."
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
            {filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No teams found matching "{searchTerm}"
              </div>
            ) : (
              filteredTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                    selectedTeamId === team.id ? 'bg-indigo-50 border-indigo-200 border' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedTeamId === team.id ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Users size={20} />
                  </div>
                  <div>
                    <p className={`font-medium ${selectedTeamId === team.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                      {team.name}
                    </p>
                    <p className="text-xs text-gray-500">{team.roles.length} roles assigned</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto">
          {selectedTeam ? (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.name}</h2>
                  <p className="text-gray-500">Manage roles for this team. Members inherit these roles.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Roles */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ShieldCheckIcon /> Assigned Roles
                  </h3>
                  <div className="space-y-3">
                    {activeRoles.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No roles assigned.</p>
                    )}
                    {activeRoles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg group">
                        <div>
                          <p className="font-medium text-gray-800">{role.name}</p>
                          <p className="text-xs text-gray-500">{role.description}</p>
                        </div>
                        <button
                          onClick={() => handleRevoke(role.id)}
                          className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Revoke Role"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
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
              <Users size={48} className="mb-4 opacity-20" />
              <p>Select a team to manage their roles</p>
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

export default TeamAssignmentPage;
