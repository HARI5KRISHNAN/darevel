import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, MoreHorizontal, Building2, Trash2, Shield, Loader2 } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Card, Button, Modal, Input } from './ui/UIComponents';
import { Team, TeamRole } from '../types';

const TeamEditModal: React.FC<{ team: Team; isOpen: boolean; onClose: () => void }> = ({ team, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');
  const [formData, setFormData] = useState({ name: team.name, description: team.description });
  const [newUserEmail, setNewUserEmail] = useState('');

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: () => mockApi.fetchTeamMembers(team.id),
    enabled: isOpen && activeTab === 'members',
  });

  const { data: searchResults } = useQuery({
    queryKey: ['users', newUserEmail],
    queryFn: () => mockApi.fetchUsers(newUserEmail),
    enabled: newUserEmail.length > 2,
  });

  const updateTeamMutation = useMutation({
    mutationFn: (data: Partial<Team>) => mockApi.updateTeam(team.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (variables: { userId: string; role: TeamRole }) => mockApi.updateTeamMemberRole(team.id, variables.userId, variables.role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members', team.id] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => mockApi.removeTeamMember(team.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', team.id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => mockApi.addTeamMember(team.id, userId),
    onSuccess: () => {
      setNewUserEmail('');
      queryClient.invalidateQueries({ queryKey: ['team-members', team.id] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeamMutation.mutate(formData, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Team: ${team.name}`}>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`pb-2 px-4 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`pb-2 px-4 text-sm font-medium ${activeTab === 'members' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
      </div>

      {activeTab === 'details' ? (
        <form onSubmit={handleSaveDetails} className="space-y-4">
          <Input label="Team Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateTeamMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Member</label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  placeholder="Search user by name or email..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                />
              </div>
              {newUserEmail.length > 2 && searchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults.filter(u => !members?.some(m => m.userId === u.id)).map(user => (
                    <button
                      key={user.id}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => addMemberMutation.mutate(user.id)}
                    >
                      <img src={user.avatarUrl} className="w-6 h-6 rounded-full" alt="" />
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </button>
                  ))}
                  {searchResults.filter(u => !members?.some(m => m.userId === u.id)).length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500">No new users found or all already in team.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {isLoadingMembers ? (
              <div className="text-center py-4 text-gray-500">Loading members...</div>
            ) : (
              members?.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <img src={member.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <select
                        className={`appearance-none pl-3 pr-8 py-1 rounded text-xs font-medium border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          member.role === 'Owner' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
                        }`}
                        value={member.role}
                        disabled={updateRoleMutation.isPending}
                        onChange={e => updateRoleMutation.mutate({ userId: member.userId, role: e.target.value as TeamRole })}
                      >
                        <option value="Member">Member</option>
                        <option value="Owner">Owner</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <Shield className="w-3 h-3" />
                      </div>
                    </div>
                    <button
                      onClick={() => removeMemberMutation.mutate(member.userId)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove from team"
                      disabled={removeMemberMutation.isPending}
                    >
                      {removeMemberMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))
            )}
            {members?.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">No members in this team yet.</div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

const TeamManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const queryClient = useQueryClient();

  const { data: teams, isLoading } = useQuery({ queryKey: ['teams'], queryFn: mockApi.fetchTeams });

  const createTeamMutation = useMutation({
    mutationFn: mockApi.createTeam,
    onSuccess: () => {
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createTeamMutation.mutate({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Building2 className="w-4 h-4 mr-2" /> Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading teams...</p>
        ) : (
          teams?.map(team => (
            <Card key={team.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <button onClick={() => setEditingTeam(team)} className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{team.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{team.description}</p>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(3, team.memberCount))].map((_, i) => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://picsum.photos/seed/${team.id}${i}/32/32`} alt="" />
                  ))}
                  {team.memberCount > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{team.memberCount - 3}
                    </div>
                  )}
                  {team.memberCount === 0 && <span className="text-xs text-gray-400 italic">No members</span>}
                </div>
                <button onClick={() => setEditingTeam(team)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Manage
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input name="name" label="Team Name" placeholder="e.g. Engineering" required />
          <Input name="description" label="Description" placeholder="What this team does..." />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createTeamMutation.isPending}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {editingTeam && <TeamEditModal team={editingTeam} isOpen={!!editingTeam} onClose={() => setEditingTeam(null)} />}
    </div>
  );
};

export default TeamManagement;
