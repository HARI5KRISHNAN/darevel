import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WorkflowList } from './pages/WorkflowList';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { ActivityLogs } from './pages/ActivityLogs';
import { TemplateGallery } from './pages/TemplateGallery';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflows/:id" element={<WorkflowBuilder />} />
          <Route path="/templates" element={<TemplateGallery />} />
          <Route path="/activity" element={<ActivityLogs />} />
          <Route path="/settings" element={<div className="text-slate-500">Settings Page Placeholder</div>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
