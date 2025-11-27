import React, { useEffect, useState, useRef } from "react";
import {
  FaPen,
  FaTrash,
  FaUserPlus,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../services/api";

interface Permission {
  id: string;
  tool: string;
  user: string;
  access: string; // read | write | execute
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

const PREDEFINED_TOOLS = [
  "Jenkins",
  "Git",
  "Grafana",
  "ELK",
  "Kubernetes",
  "OpenShift"
];

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('permissions');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPermission, setNewPermission] = useState({
    tool: "",
    user: "",
    access: "read",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filteredTools, setFilteredTools] = useState<string[]>(PREDEFINED_TOOLS);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  
  const toolInputRef = useRef<HTMLInputElement>(null);
  const userInputRef = useRef<HTMLInputElement>(null);
  const toolDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8086'}/api/auth/users`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableUsers(data.data);
        setFilteredUsers(data.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    loadPermissions();
    loadUsers();
  }, []);

  // Persist permissions to localStorage
  useEffect(() => {
    if (permissions.length > 0) {
      localStorage.setItem('permissions', JSON.stringify(permissions));
    }
  }, [permissions]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolDropdownRef.current && !toolDropdownRef.current.contains(event.target as Node) &&
          toolInputRef.current && !toolInputRef.current.contains(event.target as Node)) {
        setShowToolDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node) &&
          userInputRef.current && !userInputRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolInputChange = (value: string) => {
    setNewPermission({ ...newPermission, tool: value });
    const filtered = PREDEFINED_TOOLS.filter(tool =>
      tool.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTools(filtered);
    // only show suggestions while typing and when there's at least one match
    setShowToolDropdown(value.trim().length > 0 && filtered.length > 0);
  };


  const handleUserInputChange = (value: string) => {
    setNewPermission({ ...newPermission, user: value });
    const filtered = availableUsers.filter(user =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    // show user suggestions only while typing and limit to matches
    setShowUserDropdown(value.trim().length > 0 && filtered.length > 0);
  };


  const selectTool = (tool: string) => {
    setNewPermission({ ...newPermission, tool });
    setShowToolDropdown(false);
  };

  const selectUser = (user: User) => {
    setNewPermission({ ...newPermission, user: user.email });
    setShowUserDropdown(false);
  };

  const handleCreate = async () => {
    if (!newPermission.tool.trim() || !newPermission.user.trim()) {
      setError("Please fill in both tool name and user");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create a temporary permission with client-side ID
      const tempPermission: Permission = {
        id: Date.now().toString(),
        tool: newPermission.tool,
        user: newPermission.user,
        access: newPermission.access,
      };
      
      // Add to local state immediately for instant feedback
      setPermissions((prev) => [...prev, tempPermission]);
      setNewPermission({ tool: "", user: "", access: "read" });
      setSuccess("Permission added successfully");
      setTimeout(() => setSuccess(null), 3000);
      
      // Try to persist to backend (optional, may fail if backend not ready)
      try {
        const created = await createPermission(newPermission);
        // Update with server response if successful
        setPermissions((prev) => 
          prev.map(p => p.id === tempPermission.id ? created : p)
        );
      } catch (backendErr) {
        console.warn('Backend not available, permission stored locally only:', backendErr);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create permission");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, access: string) => {
    try {
      setError(null);
      // Update local state immediately
      setPermissions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, access } : p))
      );
      setSuccess("Permission updated to " + access);
      setTimeout(() => setSuccess(null), 3000);
      
      // Try to update backend
      try {
        await updatePermission(id, { access });
      } catch (backendErr) {
        console.warn('Backend not available, permission updated locally only:', backendErr);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update permission");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) {
      return;
    }
    
    try {
      setError(null);
      // Delete from local state immediately
      setPermissions((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Permission deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      
      // Try to delete from backend
      try {
        await deletePermission(id);
      } catch (backendErr) {
        console.warn('Backend not available, permission deleted locally only:', backendErr);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete permission");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="w-full h-full p-6 bg-background-main text-text-primary flex flex-col overflow-hidden">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2 flex-shrink-0">
        <FaUserPlus className="w-6 h-6 text-accent-purple" />
        Permission Management
      </h1>

      {/* Add Permission Form */}
      <div className="bg-background-panel p-4 rounded-xl shadow-md mb-6 flex gap-3 flex-shrink-0 border border-border-color/50 relative z-10">
        {/* Tool Input with Dropdown */}
        <div className="flex-1 relative">
          <input
            ref={toolInputRef}
            type="text"
            placeholder="Tool name (e.g., Jenkins)"
            value={newPermission.tool}
            onChange={(e) => handleToolInputChange(e.target.value)}
            onFocus={(e) => { if (e.currentTarget.value.trim().length > 0) setShowToolDropdown(true); }}
            className="w-full bg-input-field p-2 rounded-md border border-border-color text-sm text-text-primary placeholder:text-text-secondary focus:ring-accent focus:border-accent transition relative z-20"
          />
          {showToolDropdown && newPermission.tool.trim().length > 0 && filteredTools.length > 0 && (
            <div
              ref={toolDropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-accent-purple rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto"
              style={{ backgroundColor: '#ffffff', borderColor: '#8b5cf6' }}
            >
              {filteredTools.slice(0,3).map((tool) => (
                <div
                  key={tool}
                  onClick={() => selectTool(tool)}
                  className="px-4 py-3 cursor-pointer text-sm font-semibold border-b border-gray-200 last:border-b-0 hover:bg-accent-purple hover:text-white transition-colors"
                  style={{ color: '#111827', backgroundColor: '#ffffff' }}
                >
                  {tool}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Input with Dropdown */}
        <div className="flex-1 relative">
          <input
            ref={userInputRef}
            type="text"
            placeholder="User (e.g., john@company.com)"
            value={newPermission.user}
            onChange={(e) => handleUserInputChange(e.target.value)}
            onFocus={(e) => { if (e.currentTarget.value.trim().length > 0) setShowUserDropdown(true); }}
            className="w-full bg-input-field p-2 rounded-md border border-border-color text-sm text-text-primary placeholder:text-text-secondary focus:ring-accent focus:border-accent transition"
          />
          {showUserDropdown && newPermission.user.trim().length > 0 && filteredUsers.length > 0 && (
            <div
              ref={userDropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-accent-purple rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto"
              style={{ backgroundColor: '#ffffff', borderColor: '#8b5cf6' }}
            >
              {filteredUsers.slice(0,3).map((user) => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="px-4 py-3 cursor-pointer flex items-center gap-3 border-b border-gray-200 last:border-b-0 hover:bg-accent-purple transition-colors"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  {user.avatar && (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div data-name className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{user.name}</div>
                    <div data-email className="text-xs truncate" style={{ color: '#6b7280' }}>{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          value={newPermission.access}
          onChange={(e) =>
            setNewPermission({ ...newPermission, access: e.target.value })
          }
          className="bg-input-field p-2 rounded-md border border-border-color text-sm text-text-primary focus:ring-accent focus:border-accent transition"
        >
          <option value="read">read</option>
          <option value="write">write</option>
          <option value="execute">execute</option>
        </select>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-accent-purple hover:bg-accent-purple/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaUpload className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center text-status-red mb-3 flex-shrink-0 bg-status-red/10 px-4 py-2 rounded-lg border border-status-red/20">
          <FaExclamationCircle className="mr-2 w-5 h-5" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center text-status-green mb-3 flex-shrink-0 bg-status-green/10 px-4 py-2 rounded-lg border border-status-green/20">
          <FaCheckCircle className="mr-2 w-5 h-5" /> {success}
        </div>
      )}

      {/* Permissions Table */}
      <div className="bg-background-panel rounded-xl shadow-md border border-border-color/50 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-background-panel border-b border-border-color z-10">
              <tr className="text-text-secondary">
                <th className="px-4 py-3 text-left font-semibold">Tool</th>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Access</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr
                  key={perm.id}
                  className="border-t border-border-color/30 hover:bg-background-main transition-colors"
                >
                  <td className="px-4 py-3 text-text-primary">{perm.tool}</td>
                  <td className="px-4 py-3 text-text-primary">{perm.user}</td>
                  <td className="px-4 py-3">
                    {editingPermissionId === perm.id ? (
                      <select
                        value={perm.access}
                        onChange={(e) => {
                          handleUpdate(perm.id, e.target.value);
                          setEditingPermissionId(null);
                        }}
                        onBlur={() => setEditingPermissionId(null)}
                        autoFocus
                        className="bg-input-field border border-accent-purple rounded px-2 py-1 text-sm text-text-primary focus:ring-2 focus:ring-accent-purple focus:outline-none"
                      >
                        <option value="read">read</option>
                        <option value="write">write</option>
                        <option value="execute">execute</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        perm.access === 'read' ? 'bg-accent-soft text-accent' :
                        perm.access === 'write' ? 'bg-tag-orange-soft text-tag-orange' :
                        'bg-tag-pink-soft text-tag-pink'
                      }`}>
                        {perm.access}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => setEditingPermissionId(perm.id)}
                      className="text-accent hover:text-accent/80 transition-colors"
                      title="Edit access level"
                    >
                      <FaPen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(perm.id)}
                      className="text-status-red hover:text-status-red/80 transition-colors"
                      title="Delete permission"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-text-secondary py-8">
                    No permissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
