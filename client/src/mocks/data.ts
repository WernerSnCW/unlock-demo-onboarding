// Mock data for development and testing
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  technologies: string[];
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Software Engineer',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Product Manager',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'UI/UX Designer',
  },
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'DevStack Dashboard',
    description: 'Modern admin dashboard built with React and TypeScript',
    status: 'active',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: '2',
    name: 'Component Library',
    description: 'Reusable UI components for rapid development',
    status: 'completed',
    technologies: ['React', 'Storybook', 'CSS Modules'],
  },
];

// Mock API functions
export const mockApi = {
  async getUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockUsers;
  },

  async getProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockProjects;
  },

  async getUserById(id: string): Promise<User | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUsers.find(user => user.id === id);
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newUser: User = {
      ...userData,
      id: String(mockUsers.length + 1),
    };
    mockUsers.push(newUser);
    return newUser;
  },
};
