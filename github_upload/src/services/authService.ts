import type { User, AuthToken } from '../types';

// Simple hash function for password hashing (in production use bcrypt on server)
const hashPassword = (password: string): string => {
  let hash = 0;
  const str = password + 'hba_salt_2024';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const generateId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateToken = (userId: string): AuthToken => {
  const token = `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  return { token, expiresAt, userId };
};

const STORAGE_KEY = 'hba_users';

// Get all users from storage
const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save users to storage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Initialize default admin and demo users
const initializeDefaultUsers = (): void => {
  const users = getUsers();
  const updatedUsers: User[] = [...users];
  let changed = false;

  // Seed admin if not exists
  if (!users.some((u) => u.role === 'admin')) {
    updatedUsers.push({
      id: 'admin_001',
      name: 'System Administrator',
      email: 'admin@hba-medical.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      createdAt: new Date().toISOString(),
      isVerified: true,
    });
    changed = true;
  }

  // Seed demo doctor if not exists
  if (!users.some((u) => u.email === 'doctor@hba-medical.com')) {
    updatedUsers.push({
      id: 'doctor_001',
      name: 'Demo Doctor',
      email: 'doctor@hba-medical.com',
      passwordHash: hashPassword('demo123'),
      role: 'user',
      createdAt: new Date().toISOString(),
      isVerified: true,
    });
    changed = true;
  }

  if (changed) {
    saveUsers(updatedUsers);
  }
};

// Initialize on module load
initializeDefaultUsers();

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Validation
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Invalid email address');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    const users = getUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    const newUser: User = {
      id: generateId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash: hashPassword(data.password),
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isVerified: true,
    };
    
    saveUsers([...users, newUser]);
    const { passwordHash, ...userWithoutPassword } = newUser;
    const tokenData = generateToken(newUser.id);
    
    return { user: userWithoutPassword, token: tokenData.token };
  },
  
  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }
    
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    
    if (!user || user.passwordHash !== hashPassword(data.password)) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    saveUsers(updatedUsers);
    
    const { passwordHash, ...userWithoutPassword } = user;
    const tokenData = generateToken(user.id);
    
    return { user: userWithoutPassword, token: tokenData.token };
  },
  
  /**
   * Get current user from token
   */
  async getCurrentUser(token: string): Promise<Omit<User, 'passwordHash'> | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!token) return null;
    
    // Extract user ID from token
    const parts = token.split('_');
    if (parts.length < 3 || parts[0] !== 'token') return null;
    
    const userId = parts[1];
    const users = getUsers();
    const user = users.find((u) => u.id === userId);
    
    if (!user) return null;
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
  
  /**
   * Logout
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Token invalidation would happen on server in production
  },
  
  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const users = getUsers();
    return users.map(({ passwordHash, ...rest }) => rest);
  },
  
  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const users = getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    saveUsers(filtered);
  },
  
  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>
  ): Promise<Omit<User, 'passwordHash'>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const users = getUsers();
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, ...updates } : u
    );
    saveUsers(updatedUsers);
    const user = updatedUsers.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
