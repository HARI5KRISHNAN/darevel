import React, { useState } from 'react';
import { FileText, Folder, Lock, Unlock, Trash2, Plus, User as UserIcon, Users as UsersIcon } from 'lucide-react';
import { useAuthzStore } from '../../../store/authzStore';
import { useToast } from '../../../components/ui/Toast';

const ResourcePermissionsPage = () => {
  const { resources, users, teams, grantResourcePermission, revokeResourcePermission } = useAuthzStore();
  const { addToast } = useToast();
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const selectedResource = resources.find(r => r.id === selectedResourceId);

  // Modal State for adding permission
  const [isAdding, setIsAdding] = useState(false);
  const [addSubjectType, setAddSubjectType] = useState<'user' | 'team'>('user');
  const [addSubjectId, setAddSubjectId] = useState<string>('');
  const [addPerm, setAddPerm] = useState<string>('read');

  const handleGrant = () => {
    if (selectedResourceId && addSubjectId) {
      grantResourcePermission(selectedResourceId, addSubjectId, addSubjectType, addPerm);
      addToast('Permission granted.', 'success');
      setIsAdding(false);
      setAddSubjectId('');
    }
  };

  const getSubjectName = (id: string, type: 'user' | 'team') => {
    if (type === 'user') return users.find(u => u.id === id)?.name || id;
    return teams.find(t => t.id === id)?.name || id;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Resource Permissions (ACL)</h1>
      
      <div className="flex gap-6 h-full">
        {/* Resource Browser */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl flex flex-col shadow-sm">
           <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-xl">
             <h2 className="font-semibold text-gray-700">Resources</h2>
           </div>
           <div className="p-2 overflow-y-auto">
             {resources.map(res => (
               <div 
                 key={res.id}
                 onClick={() => setSelectedResourceId(res.id)}
                 className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1 ${
                   selectedResourceId === res.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50 border border-transparent'
                 }`}
               >
                 <div className="p-2 bg-white rounded-md border border-gray-100 text-gray-500">
                   {res.type === 'doc' ? <FileText size={18}/> : <Folder size={18}/>}
                 </div>
                 <div>
                   <p className="font-medium text-gray-800">{res.name}</p>
                   <p className="text-xs text-gray-500 uppercase">{res.type}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* ACL Editor */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          {selectedResource ? (
            <>
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedResource.type === 'doc' ? <FileText className="text-indigo-500"/> : <Folder className="text-indigo-500"/>}
                      {selectedResource.name}
                   </h2>
                   <p className="text-sm text-gray-500 mt-1">
                     Owner: <span className="font-medium text-gray-800">{getSubjectName(selectedResource.ownerId, 'user')}</span> • ID: {selectedResource.id}
                   </p>
                 </div>
                 <button 
                   onClick={() => setIsAdding(true)}
                   className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                 >
                   <Plus size={16}/> Add Access
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                 {selectedResource.acl.length === 0 ? (
                   <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                     <Lock size={32} className="mx-auto text-gray-300 mb-3"/>
                     <p className="text-gray-500">No specific permissions assigned (inherits default).</p>
                   </div>
                 ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500 w-1/3">Subject</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500">Type</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500">Permissions</th>
                        <th className="py-3 px-2 text-sm font-semibold text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedResource.acl.map((entry, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 group">
                          <td className="py-3 px-2">
                             <div className="flex items-center gap-2 font-medium text-gray-800">
                               {entry.subjectType === 'user' ? <UserIcon size={16} className="text-gray-400"/> : <UsersIcon size={16} className="text-gray-400"/>}
                               {getSubjectName(entry.subjectId, entry.subjectType)}
                             </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${entry.subjectType === 'user' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                              {entry.subjectType}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1 flex-wrap">
                              {entry.permissions.map(p => (
                                <span key={p} className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-xs">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                             <button 
                              onClick={() => {
                                entry.permissions.forEach(p => revokeResourcePermission(selectedResource.id, entry.subjectId, entry.subjectType, p));
                                addToast('Access revoked.', 'info');
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors p-1"
                             >
                               <Trash2 size={16} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 )}
              </div>
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Unlock size={48} className="mb-4 opacity-20"/>
                <p>Select a resource to manage permissions</p>
             </div>
          )}
        </div>
      </div>

      {/* Simple Modal Implementation for adding access */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grant Access</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={addSubjectType === 'user'} onChange={() => setAddSubjectType('user')} className="text-indigo-600"/>
                    <span>User</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={addSubjectType === 'team'} onChange={() => setAddSubjectType('team')} className="text-indigo-600"/>
                    <span>Team</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {addSubjectType === 'user' ? 'Select User' : 'Select Team'}
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={addSubjectId}
                  onChange={(e) => setAddSubjectId(e.target.value)}
                >
                  <option value="">Select...</option>
                  {addSubjectType === 'user' 
                    ? users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                    : teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  value={addPerm}
                  onChange={(e) => setAddPerm(e.target.value)}
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                  <option value="comment">Comment</option>
                  <option value="manage">Manage</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGrant}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                disabled={!addSubjectId}
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePermissionsPage;
