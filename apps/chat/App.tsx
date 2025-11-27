import React, { useState, useEffect, useCallback } from 'react';
import { View, User, Project } from './types';
import NavigationSidebar from './components/NavigationSidebar';
import RightSidebar from './components/RightSidebar';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import PodStatusView from './components/PodStatusView';
import KanbanBoard from './components/KanbanBoard';
import MessagesView from './components/MessagesView';
import PermissionsPage from './pages/PermissionsPage';
import IncidentsPage from './pages/IncidentsPage';
import StatusBar from './components/StatusBar';
import ProjectDetailView from './components/ProjectDetailView';
import { availableUsers as fallbackUsers } from './data/mock';
import NewProjectModal from './components/NewProjectModal';
import { useRealTimeK8s, PodSource } from './hooks/useRealTimeK8s';
import IncidentDashboard from './components/IncidentDashboard';
import AuthPage from './components/AuthPage';
import { projectService } from './services/projectService';
import { keycloakLogout, isKeycloakAuthenticated, initKeycloak, getKeycloakUserInfo } from './services/keycloak';
import { syncKeycloakUser } from './services/api';
import { useProjectWebSocket } from './hooks/useProjectWebSocket';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); // Don't load from localStorage initially
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Check Keycloak auth first

  const [activeView, setActiveView] = useState<View>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'dark'
  );
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [availableAppUsers, setAvailableAppUsers] = useState<User[]>(fallbackUsers);
  const [podSource, setPodSource] = useState<PodSource>('docker');

  // Check Keycloak authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await initKeycloak();
        if (authenticated && isKeycloakAuthenticated()) {
          const userInfo = getKeycloakUserInfo();
          if (userInfo) {
            // Sync with auth-service to get numeric ID
            try {
              const syncedUser = await syncKeycloakUser({
                email: userInfo.email,
                name: userInfo.name || userInfo.email,
              });
              const authenticatedUser: User = {
                id: syncedUser.id,
                name: syncedUser.name,
                email: syncedUser.email,
                avatar: syncedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(syncedUser.name)}&background=random`,
                level: 'Elementary',
              };
              setUser(authenticatedUser);
              console.log('=== KEYCLOAK USER AUTHENTICATED ===', authenticatedUser);
            } catch (syncError) {
              console.error('Failed to sync user with auth-service:', syncError);
            }
          }
        }
      } catch (err) {
        console.error('Keycloak initialization failed:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const mapMembersToProject = (project: Project, userList?: User[]): Project => {
    const sourceUsers = userList && userList.length ? userList : availableAppUsers;
    const memberDetails = (project.memberIds || [])
      .map(memberId => sourceUsers.find(userRecord => userRecord.id === memberId))
      .filter((member): member is User => Boolean(member));

    if (!memberDetails.length && Array.isArray(project.members) && project.members.length) {
      return { ...project, members: project.members };
    }

    return { ...project, members: memberDetails };
  };

  const mapMembersToProjects = (projectList: Project[], userList?: User[]) =>
    projectList.map(project => mapMembersToProject(project, userList));

  const loadUsers = async (): Promise<User[]> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8086'}/api/auth/users`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableAppUsers(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error loading users from auth service:', error);
    }

    setAvailableAppUsers(fallbackUsers);
    return fallbackUsers;
  };

  const { pods, connectionStatus } = useRealTimeK8s(podSource);

  // Real-time project updates via WebSocket
  const handleProjectCreatedWS = useCallback((project: Project) => {
    const enrichedProject = mapMembersToProject(project, availableAppUsers);
    setProjects(prev => {
      // Avoid duplicates (in case we created it ourselves)
      if (prev.some(p => p.id === project.id)) return prev;
      return [enrichedProject, ...prev];
    });
  }, [availableAppUsers]);

  const handleProjectUpdatedWS = useCallback((project: Project) => {
    const enrichedProject = mapMembersToProject(project, availableAppUsers);
    setProjects(prev => prev.map(p => p.id === project.id ? enrichedProject : p));
  }, [availableAppUsers]);

  const handleProjectDeletedWS = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  // Subscribe to real-time project updates
  useProjectWebSocket({
    onProjectCreated: handleProjectCreatedWS,
    onProjectUpdated: handleProjectUpdatedWS,
    onProjectDeleted: handleProjectDeletedWS,
    enabled: !!user,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Load projects from API when user logs in
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    const usersList = await loadUsers();
    // Load ALL projects to properly calculate assignees across the system
    const fetchedProjects = await projectService.getAllProjects();
    const projectsWithMembers = mapMembersToProjects(fetchedProjects, usersList);

    console.log('=== LOADED PROJECTS FROM API ===');
    console.log('Total projects:', projectsWithMembers.length);
    projectsWithMembers.forEach((p: Project) => {
      console.log(`Project: "${p.title}", Member IDs:`, p.memberIds);
    });

    setProjects(projectsWithMembers);
  };

  useEffect(() => {
    if (!availableAppUsers.length) {
      return;
    }

    setProjects(prevProjects => mapMembersToProjects(prevProjects, availableAppUsers));
  }, [availableAppUsers]);


  const handleUserSearchChange = (query: string) => {
    setUserSearchQuery(query);
    if (query && activeView !== 'messages') {
        setActiveView('messages');
    } else if (!query && activeView === 'messages') {
        setActiveView('home');
    }
  };

  // Note: We no longer persist user to localStorage - Keycloak manages sessions

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleOpenProfileSettings = () => {
    setIsProfileModalOpen(true);
  };
  
  const handleSelectProject = (projectId: string) => {
    setActiveView('home'); // Ensure we are on the 'home' view conceptually
    setSelectedProjectId(projectId);
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
  };

  const handleOpenCreateProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };
  
  const handleSaveProject = async (projectData: { id?: string; title: string; description: string; category: string; categoryTheme: Project['categoryTheme']; progress: number; members: User[]; status?: Project['status'] }) => {
    try {
      if (projectData.id) {
        // Edit existing project
        const updatedProject = await projectService.updateProject(projectData.id, {
          ...projectData,
          memberIds: projectData.members.map(m => m.id),
        } as Project);
        
        if (updatedProject) {
          const enrichedProject = mapMembersToProject(updatedProject, availableAppUsers.length ? availableAppUsers : projectData.members);
          const finalProject = enrichedProject.members.length ? enrichedProject : { ...enrichedProject, members: projectData.members };

          setProjects(prevProjects =>
            prevProjects.map(p => p.id === projectData.id ? finalProject : p)
          );
        }
      } else {
        // Create new project - automatically add creator as a member
        const membersWithCreator = [...(projectData.members || [])];
        if (user && !membersWithCreator.some(m => m.id === user.id)) {
          membersWithCreator.push(user);
        }
        
        const newProjectData: Omit<Project, 'id'> = {
          ...projectData,
          members: membersWithCreator,
          memberIds: membersWithCreator.map(m => m.id),
          status: projectData.status || 'Started',
          comments: [],
          attachments: 0,
          tasks: [],
        };
        
        console.log('Creating project with members:', newProjectData.members);
        const createdProject = await projectService.createProject(newProjectData);
        
        if (createdProject) {
          const enrichedProject = mapMembersToProject(createdProject, membersWithCreator);
          const finalProject = enrichedProject.members.length ? enrichedProject : { ...enrichedProject, members: membersWithCreator };

          setProjects(prevProjects => [finalProject, ...prevProjects]);
        }
      }
      setIsProjectModalOpen(false);
      setProjectToEdit(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const success = await projectService.deleteProject(projectId);
        if (success) {
          setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
          if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
          }
        } else {
          alert('Failed to delete project. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleRefreshProject = async (projectId: string) => {
    try {
      const usersList = await loadUsers();
      const refreshedProject = await projectService.getProjectById(projectId);
      if (refreshedProject) {
        const projectWithMembers = mapMembersToProject(refreshedProject, usersList);
        setProjects(prevProjects =>
          prevProjects.map(p => p.id === projectId ? projectWithMembers : p)
        );
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const existingProject = projects.find(p => p.id === projectId);
      const payload: Project = {
        ...(existingProject ?? ({} as Project)),
        ...updates,
        id: projectId,
        memberIds: updates.memberIds ?? existingProject?.memberIds ?? (existingProject?.members?.map(m => m.id) || []),
        members: updates.members ?? existingProject?.members ?? [],
        tasks: updates.tasks ?? existingProject?.tasks ?? [],
        comments: updates.comments ?? (Array.isArray(existingProject?.comments) ? existingProject?.comments : []),
        files: updates.files ?? existingProject?.files ?? [],
      };

      const updatedProject = await projectService.updateProject(projectId, payload);
      
      if (updatedProject) {
        const enrichedProject = mapMembersToProject(updatedProject);
        const finalProject = enrichedProject.members.length ? enrichedProject : mapMembersToProject(updatedProject, payload.members);

        setProjects(prevProjects =>
          prevProjects.map(p => p.id === projectId ? finalProject : p)
        );
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleOpenPodStatusView = () => {
    setActiveView('status');
  };

  const handleLogout = () => {
    localStorage.removeItem('whooper_user');
    localStorage.removeItem('whooper_token');
    setUser(null);
    // If user was authenticated via Keycloak, logout from Keycloak too
    if (isKeycloakAuthenticated()) {
      keycloakLogout();
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show auth page if no user is logged in
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    if (activeView === 'home' && selectedProjectId) {
        const selectedProject = projects.find(p => p.id === selectedProjectId);
        if (selectedProject) {
            return <ProjectDetailView
                project={selectedProject}
                currentUser={user!}
                onBack={handleBackToProjects}
                onEditProject={() => handleOpenEditProject(selectedProject)}
                onDeleteProject={handleDeleteProject}
                onUpdateProject={handleUpdateProject}
                onRefreshProject={handleRefreshProject}
            />;
        }
    }

    switch (activeView) {
      case 'home':
        return <KanbanBoard projects={projects} currentUser={user} onSelectProject={handleSelectProject} onAddProject={handleOpenCreateProject} onRefresh={loadProjects} users={availableAppUsers} />;
      case 'messages':
        return (
          <MessagesView
            user={user}
            searchQuery={userSearchQuery}
          />
        );
      case 'permission':
        return <PermissionsPage />;
      case 'status':
        return <PodStatusView pods={pods} connectionStatus={connectionStatus} selectedSource={podSource} onSourceChange={setPodSource} />;
      case 'incidents':
        return <IncidentsPage currentUser={{ id: user.id, name: user.name, email: user.email || '' }} />;
      default:
        return <KanbanBoard projects={projects} currentUser={user} onSelectProject={handleSelectProject} onAddProject={handleOpenCreateProject} onRefresh={loadProjects} users={availableAppUsers} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-main font-sans text-sm overflow-hidden">
      <NavigationSidebar
        user={user}
        activeView={activeView}
        onNavigate={(view) => {
            setSelectedProjectId(null); // Deselect project when navigating away
            setActiveView(view);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userSearchQuery={userSearchQuery}
        onUserSearchChange={handleUserSearchChange}
        onLogout={handleLogout}
        onProfileClick={handleOpenProfileSettings}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 flex min-w-0 overflow-y-auto no-scrollbar">
          {renderView()}
        </main>
        <StatusBar pods={pods} podSource={podSource} onOpenPodStatusView={handleOpenPodStatusView} />
      </div>
      <RightSidebar />
      {isProjectModalOpen && (
        <NewProjectModal
            onClose={() => { setIsProjectModalOpen(false); setProjectToEdit(null); }}
            onSaveProject={handleSaveProject}
            users={availableAppUsers}
            projectToEdit={projectToEdit}
        />
      )}
      {user && (
        <ProfileSettingsModal
          user={user}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default App;