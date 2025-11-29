import React, { useState } from 'react';
import Layout from './components/Layout';
import RolesPage from './modules/authz/pages/RolesPage';
import RoleEditorPage from './modules/authz/pages/RoleEditorPage';
import UserAssignmentPage from './modules/authz/pages/UserAssignmentPage';
import TeamAssignmentPage from './modules/authz/pages/TeamAssignmentPage';
import ResourcePermissionsPage from './modules/authz/pages/ResourcePermissionsPage';
import { ToastProvider } from './components/ui/Toast';
import { ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ name: 'roles_list' });

  const renderContent = () => {
    switch (viewState.name) {
      case 'roles_list':
        return <RolesPage onNavigate={setViewState} />;
      case 'role_editor':
        return <RoleEditorPage roleId={viewState.roleId} onNavigate={setViewState} />;
      case 'users_list':
        return <UserAssignmentPage />;
      case 'teams_list':
        return <TeamAssignmentPage />;
      case 'resources_list':
        return <ResourcePermissionsPage />;
      default:
        return <RolesPage onNavigate={setViewState} />;
    }
  };

  return (
    <ToastProvider>
      <Layout currentView={viewState.name} onNavigate={setViewState}>
        {renderContent()}
      </Layout>
    </ToastProvider>
  );
};

export default App;
