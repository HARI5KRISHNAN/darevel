import React, { useState, useEffect } from 'react';
import { XCircleIcon } from './icons';
import { User, Project } from '../types';

interface NewProjectModalProps {
  onClose: () => void;
  onSaveProject: (projectData: {
    id?: string;
    title: string;
    description: string;
    category: string;
    categoryTheme: Project['categoryTheme'];
    progress: number;
    members: User[];
    status?: Project['status'];
  }) => void;
  users: User[];
  projectToEdit?: Project | null;
}

const categoryOptions: { value: string, theme: Project['categoryTheme'] }[] = [
    { value: 'Web Design', theme: 'blue' },
    { value: 'Mobile App', theme: 'orange' },
    { value: 'Dashboard', theme: 'purple' },
    { value: 'App Development', theme: 'pink' },
    { value: 'Landing Page', theme: 'sky' },
    { value: 'Web Development', theme: 'blue' },
];

const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onSaveProject, users, projectToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categoryOptions[0].value);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Project['status']>('Started');
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>(users);
  
  const isEditMode = !!projectToEdit;

  useEffect(() => {
    if (isEditMode && projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setProgress(projectToEdit.progress);
      setSelectedUserIds(projectToEdit.members.map(m => m.id));
      setStatus(projectToEdit.status);
    }
  }, [projectToEdit, isEditMode]);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8086'}/api/auth/users`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailableUsers(data.data);
        }
      } catch (error) {
        console.log('Using default users list');
        setAvailableUsers(users);
      }
    };
    fetchUsers();
  }, [users]);

  // Filter users based on search
  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );


  const handleMemberToggle = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const selectedCategory = categoryOptions.find(c => c.value === category)!;
      const selectedMembers = availableUsers.filter(u => selectedUserIds.includes(u.id));
      console.log('=== SAVING PROJECT ===');
      console.log('Selected User IDs:', selectedUserIds);
      console.log('Selected Members with IDs:', selectedMembers.map(m => ({ id: m.id, name: m.name, email: m.email })));
      onSaveProject({
        id: projectToEdit?.id,
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory.value,
        categoryTheme: selectedCategory.theme,
        progress: progress,
        members: selectedMembers,
        status: status,
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-background-panel rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-primary">{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            <div>
              <label htmlFor="project-title" className="block text-sm font-medium text-text-secondary mb-1">Project Title</label>
              <input
                type="text"
                id="project-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                placeholder="e.g., New Marketing Website"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                placeholder="Add a brief description of the project..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="project-category" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                    <select
                        id="project-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                    >
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.value}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="project-status" className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                    <select
                        id="project-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Project['status'])}
                        className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                    >
                        <option value="Started">Started</option>
                        <option value="On Going">On Going</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="project-progress" className="block text-sm font-medium text-text-secondary mb-1">Progress (%)</label>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        id="project-progress"
                        value={progress}
                        onChange={(e) => setProgress(parseInt(e.target.value, 10))}
                        min="0"
                        max="100"
                        className="flex-1"
                    />
                    <input
                        type="number"
                        value={progress}
                        onChange={(e) => setProgress(Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)))}
                        min="0"
                        max="100"
                        className="w-16 px-2 py-1 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition text-center"
                    />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Assign Members</label>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition text-sm"
                />
              </div>
              <div className="max-h-40 overflow-y-auto bg-input-field border border-border-color rounded-lg p-2 space-y-1">
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <label key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-background-main cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium text-text-primary">{user.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                        className="w-5 h-5 accent-accent-purple cursor-pointer"
                      />
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4 text-text-secondary text-sm">
                    No users available
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 bg-background-main rounded-b-lg border-t border-border-color flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-background-panel border border-border-color text-text-primary font-semibold rounded-lg hover:bg-background-main transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent-purple text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-400"
              disabled={!title.trim()}
            >
              {isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;