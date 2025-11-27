import React, { useState, useMemo } from 'react';
import { Project, User } from '../types';
import { PlusIcon, EllipsisHorizontalIcon, PaperClipIcon, ChatBubbleLeftIcon, UsersIcon, ChartPieIcon, CheckCircleIcon, MagnifyingGlassIcon, FunnelIcon, RefreshIcon } from './icons';
import NewProjectModal from './NewProjectModal';
import { availableUsers } from '../data/mock';

// --- SUB-COMPONENTS ---

const CircularProgress: React.FC<{ percentage: number, size?: number, strokeWidth?: number }> = ({ percentage, size = 160, strokeWidth = 14 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <circle className="text-gray-200 dark:text-border-color" stroke="currentColor" cx={size/2} cy={size/2} r={radius} strokeWidth={strokeWidth} fill="transparent" />
                <circle 
                    className="text-accent-purple"
                    stroke="currentColor"
                    cx={size/2} 
                    cy={size/2} 
                    r={radius} 
                    strokeWidth={strokeWidth} 
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-text-primary">{percentage}%</span>
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{ project: Project; onSelectProject: (projectId: string) => void; }> = ({ project, onSelectProject }) => {
    const themeClasses = {
        blue: { bg: 'bg-accent-soft', text: 'text-accent', progress: 'bg-accent' },
        orange: { bg: 'bg-tag-orange-soft', text: 'text-tag-orange', progress: 'bg-tag-orange' },
        pink: { bg: 'bg-tag-pink-soft', text: 'text-tag-pink', progress: 'bg-tag-pink' },
        purple: { bg: 'bg-accent-purple-soft', text: 'text-accent-purple', progress: 'bg-accent-purple' },
        sky: { bg: 'bg-tag-sky-soft', text: 'text-tag-sky', progress: 'bg-tag-sky' },
    };
    const theme = themeClasses[project.categoryTheme];

    return (
        <div 
            onClick={() => onSelectProject(project.id)}
            className="bg-background-panel p-4 rounded-2xl border border-border-color/50 space-y-3 transition-all duration-300 cursor-pointer hover:border-accent-purple hover:shadow-lg"
        >
            <div className="flex justify-between items-center">
                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${theme.bg} ${theme.text}`}>{project.category}</span>
                <button className="text-text-secondary hover:text-text-primary" onClick={(e) => e.stopPropagation()}>
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>
            </div>
            <h3 className="font-bold text-text-primary">{project.title}</h3>
            <p className="text-xs text-text-secondary">{project.description}</p>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-text-secondary">Progress</span>
                    <span className="text-xs font-bold text-text-primary">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-border-color rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${theme.progress}`} style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>

            {/* TASKS PREVIEW */}
            {project.tasks && project.tasks.length > 0 && (
                <div className="border-t border-border-color/50 pt-3 space-y-2">
                    {project.tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center justify-between text-xs group/task">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {task.completed ? 
                                    <CheckCircleIcon className="w-4 h-4 text-accent shrink-0" /> : 
                                    <div className="w-3.5 h-3.5 border-2 border-border-color rounded-full shrink-0" />
                                }
                                <span className={`truncate ${task.completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{task.title}</span>
                            </div>
                            {task.assignee && (
                                <img src={task.assignee.avatar} alt={task.assignee.name} className="w-5 h-5 rounded-full object-cover shrink-0 ml-2" title={`Assigned to ${task.assignee.name}`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map(member => (
                        <img key={member.id} src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full ring-2 ring-background-panel object-cover" />
                    ))}
                    {project.members.length > 4 && (
                        <div className="w-6 h-6 rounded-full ring-2 ring-background-panel bg-background-main flex items-center justify-center text-text-secondary text-[10px] font-bold">
                            +{project.members.length - 4}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                    <div className="flex items-center gap-1">
                        <PaperClipIcon className="w-4 h-4" />
                        <span>{project.attachments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span>{Array.isArray(project.comments) ? project.comments.length : project.comments}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectColumn: React.FC<{ title: string, projects: Project[], onSelectProject: (projectId: string) => void; }> = ({ title, projects, onSelectProject }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-text-primary">{title}</h2>
                <button className="text-text-secondary hover:text-text-primary bg-background-panel p-1 rounded-md">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4">
                {projects.map(p => <ProjectCard key={p.id} project={p} onSelectProject={onSelectProject} />)}
            </div>
        </div>
    );
};

const ProjectsSidebar: React.FC<{ stats: { total: number; completed: number; inProgress: number; started: number }, projects: Project[], allUsers: User[] }> = ({ stats, projects, allUsers }) => {
    const [assigneeSearch, setAssigneeSearch] = useState('');
    const [notAssignedSearch, setNotAssignedSearch] = useState('');

    // Get all unique user IDs who are assigned to at least one project
    const assignedUserIds = useMemo(() => {
        const userIds = new Set<number>();
        projects.forEach(project => {
            project.members.forEach(member => {
                userIds.add(member.id);
            });
        });
        return userIds;
    }, [projects]);

    // Split users into assigned and not assigned
    const assignedUsers = useMemo(() =>
        allUsers.filter(user => assignedUserIds.has(user.id)),
        [allUsers, assignedUserIds]
    );

    const notAssignedUsers = useMemo(() =>
        allUsers.filter(user => !assignedUserIds.has(user.id)),
        [allUsers, assignedUserIds]
    );

    // Filter assigned users by search
    const filteredAssignedUsers = useMemo(() => {
        if (!assigneeSearch.trim()) return assignedUsers.slice(0, 3);
        return assignedUsers.filter(user =>
            user.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(assigneeSearch.toLowerCase()))
        );
    }, [assignedUsers, assigneeSearch]);

    // Filter not assigned users by search
    const filteredNotAssignedUsers = useMemo(() => {
        if (!notAssignedSearch.trim()) return notAssignedUsers.slice(0, 3);
        return notAssignedUsers.filter(user =>
            user.name.toLowerCase().includes(notAssignedSearch.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(notAssignedSearch.toLowerCase()))
        );
    }, [notAssignedUsers, notAssignedSearch]);

    return (
        <aside className="w-[340px] flex-shrink-0 p-6 space-y-6 overflow-y-auto hidden lg:block">
            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-text-secondary">OVERVIEW</p>
                        <p className="font-bold text-text-primary">All Projects</p>
                    </div>
                    <div className="w-10 h-10 bg-tag-orange-soft rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-tag-orange" />
                    </div>
                </div>
                <div className="flex justify-center my-4">
                    <CircularProgress percentage={stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0} />
                </div>
            </div>

            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <h3 className="font-bold text-text-primary mb-4">Projects Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Total" value={stats.total.toString()} color="border-accent-purple" />
                    <StatCard title="Completed" value={stats.completed.toString()} color="border-tag-orange" />
                    <StatCard title="In Progress" value={stats.inProgress.toString()} color="border-tag-pink" />
                    <StatCard title="Started" value={stats.started.toString()} color="border-tag-sky" />
                </div>
            </div>

            {/* Assigned Users */}
            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text-primary">Assignees</h3>
                    <span className="text-xs text-text-secondary bg-accent-soft px-2 py-1 rounded-full">{assignedUsers.length}</span>
                </div>
                <div className="mb-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search assignees..."
                            value={assigneeSearch}
                            onChange={(e) => setAssigneeSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                        />
                    </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                    {filteredAssignedUsers.length > 0 ? (
                        filteredAssignedUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-main transition-colors">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                                </div>
                            </div>
                        ))
                    ) : assignedUsers.length > 0 ? (
                        <p className="text-sm text-text-secondary text-center py-4">No matching users found</p>
                    ) : (
                        <p className="text-sm text-text-secondary text-center py-4">No users assigned to projects</p>
                    )}
                    {!assigneeSearch && assignedUsers.length > 3 && (
                        <p className="text-xs text-text-secondary text-center py-2 italic">
                            +{assignedUsers.length - 3} more (use search to find)
                        </p>
                    )}
                </div>
            </div>

            {/* Not Assigned Users */}
            <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text-primary">Not Assigned</h3>
                    <span className="text-xs text-text-secondary bg-status-red/20 px-2 py-1 rounded-full">{notAssignedUsers.length}</span>
                </div>
                <div className="mb-3">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search unassigned..."
                            value={notAssignedSearch}
                            onChange={(e) => setNotAssignedSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition"
                        />
                    </div>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                    {filteredNotAssignedUsers.length > 0 ? (
                        filteredNotAssignedUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-main transition-colors">
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
                                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                                </div>
                            </div>
                        ))
                    ) : notAssignedUsers.length > 0 ? (
                        <p className="text-sm text-text-secondary text-center py-4">No matching users found</p>
                    ) : (
                        <p className="text-sm text-text-secondary text-center py-4">All users are assigned</p>
                    )}
                    {!notAssignedSearch && notAssignedUsers.length > 3 && (
                        <p className="text-xs text-text-secondary text-center py-2 italic">
                            +{notAssignedUsers.length - 3} more (use search to find)
                        </p>
                    )}
                </div>
            </div>
        </aside>
    );
};

const StatCard: React.FC<{title: string, value: string, color: string}> = ({title, value, color}) => (
    <div className={`p-3 bg-background-main rounded-lg border-l-4 ${color}`}>
        <p className="text-xs text-text-secondary">{title}</p>
        <p className="text-xl font-bold text-text-primary">{value}</p>
    </div>
);


// --- MAIN COMPONENT ---
interface ProjectsDashboardProps {
    projects: Project[];
    currentUser: User;
    onSelectProject: (projectId: string) => void;
    onAddProject: () => void;
    onRefresh?: () => void;
    users?: User[];
}

const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({ projects, currentUser, onSelectProject, onAddProject, onRefresh, users = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!onRefresh || isRefreshing) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    // Filter to show only user's projects
    const userProjects = useMemo(() => {
        return projects.filter(p => {
            const isMember = p.members.some(m => m.id === currentUser.id || Number(m.id) === Number(currentUser.id));
            return isMember;
        });
    }, [projects, currentUser]);

    const filteredProjects = useMemo(() => {
        return userProjects.filter(project => {
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  project.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [userProjects, searchQuery, categoryFilter]);

    const groupedProjects = useMemo(() => {
        const grouped = filteredProjects.reduce((acc, project) => {
            if (!acc[project.status]) {
                acc[project.status] = [];
            }
            acc[project.status].push(project);
            return acc;
        }, {} as Record<Project['status'], Project[]>);
        
        // Sort each status group by ID (newest first since IDs are timestamps)
        Object.keys(grouped).forEach(status => {
            grouped[status as Project['status']].sort((a, b) => b.id.localeCompare(a.id));
        });
        
        return grouped;
    }, [filteredProjects]);

    const allCategories = useMemo(() => {
        const categories = new Set(userProjects.map(p => p.category));
        return ['All', ...Array.from(categories)];
    }, [userProjects]);

    const projectStats = useMemo(() => {
        return {
            total: userProjects.length,
            completed: userProjects.filter(p => p.status === 'Completed').length,
            inProgress: userProjects.filter(p => p.status === 'On Going').length,
            started: userProjects.filter(p => p.status === 'Started').length,
        };
    }, [userProjects]);

    return (
        <div className="flex-1 flex min-w-0 h-full overflow-hidden">
            <main className="flex-1 p-6 flex flex-col overflow-y-auto">
                <header className="flex-shrink-0 mb-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
                        <div className="flex items-center gap-2">
                            {onRefresh && (
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-background-panel disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    title="Refresh projects">
                                    <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                            )}
                            <button className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-background-panel">
                                <ChartPieIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onAddProject}
                                className="bg-accent-purple text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                                <PlusIcon className="w-4 h-4"/>
                                <span>Create Project</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition text-sm"
                            />
                        </div>
                        <div className="relative">
                            <FunnelIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-9 pr-8 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent transition text-sm appearance-none cursor-pointer"
                            >
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50 transition-all duration-300 hover:border-border-color hover:shadow-md">
                            <p className="text-xs text-text-secondary mb-1">Total</p>
                            <p className="text-2xl font-bold text-text-primary">{projectStats.total}</p>
                        </div>
                        <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50 transition-all duration-300 hover:border-accent hover:shadow-md">
                            <p className="text-xs text-text-secondary mb-1">Started</p>
                            <p className="text-2xl font-bold text-accent">{projectStats.started}</p>
                        </div>
                        <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50 transition-all duration-300 hover:border-tag-orange hover:shadow-md">
                            <p className="text-xs text-text-secondary mb-1">In Progress</p>
                            <p className="text-2xl font-bold text-tag-orange">{projectStats.inProgress}</p>
                        </div>
                        <div className="bg-background-panel p-4 rounded-2xl border border-border-color/50 transition-all duration-300 hover:border-accent-purple hover:shadow-md">
                            <p className="text-xs text-text-secondary mb-1">Completed</p>
                            <p className="text-2xl font-bold text-accent-purple">{projectStats.completed}</p>
                        </div>
                    </div>
                </header>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ProjectColumn title="Started" projects={groupedProjects['Started'] || []} onSelectProject={onSelectProject} />
                    <ProjectColumn title="On Going" projects={groupedProjects['On Going'] || []} onSelectProject={onSelectProject} />
                    <ProjectColumn title="Completed" projects={groupedProjects['Completed'] || []} onSelectProject={onSelectProject} />
                </div>
            </main>
            <ProjectsSidebar stats={projectStats} projects={projects} allUsers={users} />
        </div>
    );
};

export default ProjectsDashboard;