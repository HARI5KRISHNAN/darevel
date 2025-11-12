import React, { useEffect, useState } from "react";
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

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPermission, setNewPermission] = useState({
    tool: "",
    user: "",
    access: "read",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const created = await createPermission(newPermission);
      setPermissions((prev) => [...prev, created]);
      setNewPermission({ tool: "", user: "", access: "read" });
      setSuccess("Permission added successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to create permission");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, access: string) => {
    try {
      setLoading(true);
      const updated = await updatePermission(id, { access });
      setPermissions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      setSuccess("Permission updated");
    } catch (err) {
      console.error(err);
      setError("Failed to update permission");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deletePermission(id);
      setPermissions((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Permission deleted");
    } catch (err) {
      console.error(err);
      setError("Failed to delete permission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-950 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <FaUserPlus className="w-6 h-6 text-blue-400" />
        Permission Management
      </h1>

      {/* Add Permission Form */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-md mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Tool name (e.g., Jenkins)"
          value={newPermission.tool}
          onChange={(e) =>
            setNewPermission({ ...newPermission, tool: e.target.value })
          }
          className="flex-1 bg-gray-800 p-2 rounded-md border border-gray-700 text-sm"
        />
        <input
          type="text"
          placeholder="User (e.g., john@company.com)"
          value={newPermission.user}
          onChange={(e) =>
            setNewPermission({ ...newPermission, user: e.target.value })
          }
          className="flex-1 bg-gray-800 p-2 rounded-md border border-gray-700 text-sm"
        />
        <select
          value={newPermission.access}
          onChange={(e) =>
            setNewPermission({ ...newPermission, access: e.target.value })
          }
          className="bg-gray-800 p-2 rounded-md border border-gray-700 text-sm"
        >
          <option value="read">Read</option>
          <option value="write">Write</option>
          <option value="execute">Execute</option>
        </select>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
        >
          <FaUpload className="w-4 h-4 inline-block mr-1" />
          Add
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center text-red-400 mb-3">
          <FaExclamationCircle className="mr-2 w-5 h-5" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center text-green-400 mb-3">
          <FaCheckCircle className="mr-2 w-5 h-5" /> {success}
        </div>
      )}

      {/* Permissions Table */}
      <div className="bg-gray-900 p-4 rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-gray-400">
              <th className="px-4 py-2 text-left">Tool</th>
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Access</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr
                key={perm.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="px-4 py-2">{perm.tool}</td>
                <td className="px-4 py-2">{perm.user}</td>
                <td className="px-4 py-2 capitalize">{perm.access}</td>
                <td className="px-4 py-2 flex gap-3">
                  <button
                    onClick={() =>
                      handleUpdate(
                        perm.id,
                        perm.access === "read"
                          ? "write"
                          : perm.access === "write"
                          ? "execute"
                          : "read"
                      )
                    }
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FaPen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(perm.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-3">
                  No permissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsPage;
