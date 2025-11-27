import { Project } from '../types';

const API_BASE_URL = 'http://localhost:8081/api/projects';

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      if (data.success) {
        return data.data.map((p: any) => this.mapDTOToProject(p));
      }
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async getProjectsByUserId(userId: number): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        return data.data.map((p: any) => this.mapDTOToProject(p));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  },

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      const data = await response.json();
      if (data.success) {
        return this.mapDTOToProject(data.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project | null> {
    try {
      const dto = this.mapProjectToDTO(project);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });
      const data = await response.json();
      if (data.success) {
        return this.mapDTOToProject(data.data);
      }
      return null;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const dto = this.mapProjectToDTO(updates);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });
      const data = await response.json();
      if (data.success) {
        return this.mapDTOToProject(data.data);
      }
      return null;
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },

  mapDTOToProject(dto: any): Project {
    const parsedTasks = typeof dto.tasks === 'string' ? JSON.parse(dto.tasks) : Array.isArray(dto.tasks) ? dto.tasks : [];
    const parsedComments = typeof dto.comments === 'string' ? JSON.parse(dto.comments) : Array.isArray(dto.comments) ? dto.comments : [];
    const parsedFiles = typeof dto.files === 'string' ? JSON.parse(dto.files) : Array.isArray(dto.files) ? dto.files : [];

    return {
      id: dto.id.toString(),
      title: dto.title,
      description: dto.description,
      category: dto.category,
      categoryTheme: dto.categoryTheme,
      progress: dto.progress,
      status: dto.status,
      members: [],
      memberIds: dto.memberIds || [],
      tasks: parsedTasks,
      comments: parsedComments,
      files: parsedFiles,
      attachments: dto.attachments ?? 0,
    };
  },

  mapProjectToDTO(project: Partial<Project>): any {
    const memberIds = Array.isArray(project.memberIds) && project.memberIds.length
      ? project.memberIds
      : Array.isArray(project.members)
        ? project.members.map(m => m.id)
        : [];

    const tasksPayload = Array.isArray(project.tasks) ? project.tasks : [];
    const commentsPayload = Array.isArray(project.comments) ? project.comments : [];
    const filesPayload = Array.isArray(project.files) ? project.files : [];

    const dto: any = {
      memberIds,
      tasks: JSON.stringify(tasksPayload),
      comments: JSON.stringify(commentsPayload),
      files: JSON.stringify(filesPayload),
    };

    // Only include fields if they are explicitly provided to avoid overwriting with defaults
    if (project.title !== undefined) dto.title = project.title;
    if (project.description !== undefined) dto.description = project.description;
    if (project.category !== undefined) dto.category = project.category;
    if (project.categoryTheme !== undefined) dto.categoryTheme = project.categoryTheme;
    if (project.progress !== undefined) dto.progress = project.progress;
    if (project.status !== undefined) dto.status = project.status;

    return dto;
  },
};
