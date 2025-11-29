import { FileItem, FileType } from '../types';

const USERS = {
  admin: { id: 'u1', name: 'Admin User', color: 'bg-blue-500' },
  sarah: { id: 'u2', name: 'Sarah Jenkins', color: 'bg-purple-500' },
  mike: { id: 'u3', name: 'Mike Ross', color: 'bg-green-500' },
  dev: { id: 'u4', name: 'Dev Team', color: 'bg-gray-700' },
};

const MOCK_FILES: FileItem[] = [
  // Root Folders
  {
    id: '1', parentId: null, name: 'Marketing', type: 'folder', size: 0, updatedAt: '2023-10-25T10:00:00Z',
    owner: USERS.admin,
    tags: ['Department', 'Public'],
    collaborators: [USERS.sarah, USERS.mike]
  },
  {
    id: '2', parentId: null, name: 'Engineering', type: 'folder', size: 0, updatedAt: '2023-10-24T14:30:00Z',
    owner: USERS.admin,
    tags: ['Restricted', 'Internal']
  },
  {
    id: '3', parentId: null, name: 'Finance', type: 'folder', size: 0, updatedAt: '2023-10-20T09:15:00Z',
    owner: USERS.admin,
    tags: ['Confidential']
  },

  // Marketing Content
  {
    id: '11', parentId: '1', name: 'Q4 Campaign Assets', type: 'folder', size: 0, updatedAt: '2023-10-26T11:20:00Z',
    owner: USERS.sarah,
    tags: ['Campaign', 'Q4']
  },
  {
    id: '12', parentId: '1', name: 'Brand_Guidelines_v2.pdf', type: 'pdf', size: 4500000, updatedAt: '2023-09-15T16:00:00Z',
    owner: USERS.sarah,
    content: "Standard brand guidelines including logo usage, color palette (Blue #2563eb), and typography (Inter). Do not stretch the logo.",
    tags: ['Brand', 'Design'],
    versions: [
      { id: 'v2', version: 2, updatedAt: '2023-09-15T16:00:00Z', modifier: 'Sarah Jenkins' },
      { id: 'v1', version: 1, updatedAt: '2023-01-10T09:00:00Z', modifier: 'Mike Ross' }
    ],
    activity: [
      { id: 'a1', user: 'Sarah Jenkins', action: 'Uploaded new version', timestamp: '2023-09-15T16:00:00Z' },
      { id: 'a2', user: 'Mike Ross', action: 'Viewed', timestamp: '2023-10-20T10:00:00Z' }
    ]
  },
  {
    id: '13', parentId: '1', name: 'Launch_Event.png', type: 'image', size: 2400000, updatedAt: '2023-10-27T09:00:00Z',
    owner: USERS.mike,
    shared: true,
    collaborators: [USERS.sarah, USERS.admin],
    tags: ['Social Media']
  },

  // Engineering Content
  {
    id: '21', parentId: '2', name: 'Architecture_Diagram.png', type: 'image', size: 1200000, updatedAt: '2023-10-22T13:45:00Z',
    owner: USERS.dev,
    tags: ['Technical', 'Diagram'],
    versions: [
        { id: 'v3', version: 3, updatedAt: '2023-10-22T13:45:00Z', modifier: 'Dev Team' },
        { id: 'v2', version: 2, updatedAt: '2023-10-21T09:15:00Z', modifier: 'Mike Ross' },
        { id: 'v1', version: 1, updatedAt: '2023-10-15T11:00:00Z', modifier: 'Admin User' }
    ]
  },
  {
    id: '22', parentId: '2', name: 'API_Spec.json', type: 'code', size: 45000, updatedAt: '2023-10-28T10:30:00Z',
    owner: USERS.dev,
    content: "{ \"version\": \"1.0\", \"endpoints\": [ \"/api/files\", \"/api/users\" ] }",
    tags: ['API', 'Backend']
  },

  // Root Files
  {
    id: '4', parentId: null, name: 'Employee_Handbook.docx', type: 'doc', size: 1500000, updatedAt: '2023-08-01T09:00:00Z',
    owner: USERS.admin,
    starred: true,
    content: "Company policies: 1. Be respectful. 2. Work hard. 3. Unlimited PTO policy details.",
    tags: ['HR', 'Policy'],
    versions: [
        { id: 'v1', version: 1, updatedAt: '2023-08-01T09:00:00Z', modifier: 'Admin User' }
    ]
  },
  {
    id: '5', parentId: null, name: 'Quarterly_Townhall.mp4', type: 'video', size: 450000000, updatedAt: '2023-10-01T15:00:00Z',
    owner: USERS.admin,
    tags: ['All-Hands', 'Video']
  },
];

export const getFiles = (parentId: string | null): Promise<FileItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_FILES.filter(f => f.parentId === parentId));
    }, 150); // Simulate network latency
  });
};

export const getFolder = (folderId: string): Promise<FileItem | undefined> => {
  return new Promise((resolve) => {
    const folder = MOCK_FILES.find(f => f.id === folderId);
    resolve(folder);
  });
};

export const searchFiles = (query: string): Promise<FileItem[]> => {
    return new Promise(resolve => {
        const lowerQ = query.toLowerCase();
        const results = MOCK_FILES.filter(f => f.name.toLowerCase().includes(lowerQ));
        resolve(results);
    });
};

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
