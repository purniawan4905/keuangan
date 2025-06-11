import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import authService, { LoginCredentials, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isFinance: () => boolean;
  canEdit: () => boolean;
  canApprove: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Role-based permissions
const PERMISSIONS = {
  admin: [
    'create_report',
    'edit_report',
    'delete_report',
    'approve_report',
    'view_all_reports',
    'manage_users',
    'manage_settings',
    'export_reports',
    'archive_reports'
  ],
  finance: [
    'create_report',
    'edit_report',
    'view_all_reports',
    'export_reports',
    'submit_for_approval'
  ],
  viewer: [
    'view_reports',
    'export_reports'
  ]
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const result = await authService.verifyToken(token);
        if (result.valid && result.user) {
          setUser(result.user);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login({ email, password });
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const result = await authService.register(userData);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || false;
  };

  const isFinance = (): boolean => {
    return user?.role === 'finance' || false;
  };

  const canEdit = (): boolean => {
    return hasPermission('edit_report');
  };

  const canApprove = (): boolean => {
    return hasPermission('approve_report');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      hasPermission,
      isAdmin,
      isFinance,
      canEdit,
      canApprove
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};