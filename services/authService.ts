import { User, Role } from '../types';

const MOCK_USERS: User[] = [
  { username: 'admin', name: 'Administrador Principal', role: 'admin' },
  { username: 'pharma', name: 'Regente de Farmacia', role: 'pharmacist' },
  { username: 'viewer', name: 'Auditor Financiero', role: 'viewer' }
];

export const login = async (username: string): Promise<User | null> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    localStorage.setItem('pharma_user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('pharma_user');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('pharma_user');
  return stored ? JSON.parse(stored) : null;
};

export const hasPermission = (user: User, requiredRoles: Role[]): boolean => {
  return requiredRoles.includes(user.role);
};