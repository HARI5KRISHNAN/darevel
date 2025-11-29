import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Ban, CheckCircle } from 'lucide-react';
import { mockApi } from '../services/mockApi';
import { Card, Button, Input, Modal, Badge } from './ui/UIComponents';
import { UserStatus } from '../types';

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', search],
    queryFn: () => mockApi.fetchUsers(search),
  });

  const createMutation = useMutation({
    mutationFn: mockApi.createUser,
    onSuccess: () => {
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (variables: { id: string; status: UserStatus }) => mockApi.updateUserStatus(variables.id, variables.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      status: UserStatus.ACTIVE,
      roles: ['MEMBER'],
      teamIds: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : (
                users?.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === UserStatus.ACTIVE ? 'success' : 'neutral'}>{user.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-1">
                        {user.roles.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === UserStatus.ACTIVE ? (
                          <button
                            onClick={() => statusMutation.mutate({ id: user.id, status: UserStatus.DEACTIVATED })}
                            className="text-gray-400 hover:text-red-600"
                            title="Deactivate"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => statusMutation.mutate({ id: user.id, status: UserStatus.ACTIVE })}
                            className="text-gray-400 hover:text-green-600"
                            title="Activate"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input name="name" label="Full Name" placeholder="John Doe" required />
          <Input name="email" label="Email Address" type="email" placeholder="john@company.com" required />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
