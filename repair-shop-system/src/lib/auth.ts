// 简单的认证系统
import { useState, useEffect } from 'react';
import { SimpleUser, mockUsers } from './mockData';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'admin' | 'technician';
  username: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private readonly AUTH_KEY = 'currentUser';

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    try {
      const savedUser = localStorage.getItem(this.AUTH_KEY);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private saveCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.AUTH_KEY);
    }
    this.currentUser = user;
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // 获取所有用户
      const users = JSON.parse(localStorage.getItem('simpleUsers') || JSON.stringify(mockUsers)) as SimpleUser[];
      
      // 查找匹配的用户
      const user = users.find(u => u.username === credentials.username);

      if (!user) {
        return { success: false, error: '用户名不存在' };
      }

      if (user.password !== credentials.password) {
        return { success: false, error: '密码错误' };
      }

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username
      };

      this.saveCurrentUser(authUser);
      return { success: true, user: authUser };
    } catch (error) {
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }

  logout(): void {
    this.saveCurrentUser(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  canAccessAdminPanel(): boolean {
    return this.hasRole('admin');
  }

  canAccessTechnicianPanel(): boolean {
    return this.hasRole('technician') || this.hasRole('admin');
  }
}

export const authService = new AuthService();

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isLoggedIn: !!user,
    hasRole: (role: string) => user?.role === role
  };
}