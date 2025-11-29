import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import TeamManagement from './components/TeamManagement';
import SecuritySettings from './components/SecuritySettings';

const Billing = () => (
  <div className="p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
    <h2 className="text-xl font-bold text-gray-700">Billing Portal</h2>
    <p className="text-gray-500 mt-2">This module is loaded from the external billing service.</p>
  </div>
);

const AuditLog = () => (
  <div className="p-8 text-center bg-white rounded-lg border border-dashed border-gray-300">
    <h2 className="text-xl font-bold text-gray-700">Full Audit Log</h2>
    <p className="text-gray-500 mt-2">Detailed audit trail viewer would be embedded here.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/teams" element={<TeamManagement />} />
        <Route path="/security" element={<SecuritySettings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default App;
