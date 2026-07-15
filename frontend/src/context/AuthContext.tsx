import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface SubscriptionEntitlements {
  planTier: string | null;
  status: string | null;
  maxBranches: number | null;
  maxEmployees: number | null;
  features: string[];
  currentPeriodEnd: string | null;
  isActive?: boolean;
  isExpired?: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string | null;
  tenantId?: string | null;
  subscription?: SubscriptionEntitlements;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  planFeatures: string[];
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  hasFeature: (featureKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tastyc_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const activeToken = localStorage.getItem('tastyc_token');
      if (activeToken) {
        try {
          const userData = await api.auth.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Session restore failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('tastyc_token', data.token);
      localStorage.setItem('tastyc_user', JSON.stringify(data.user));
      if (data.user?.role === 'SUPER_ADMIN' && !data.user?.tenantId) {
        localStorage.removeItem('tastyc_tenant_id');
      } else if (data.user?.tenantId) {
        localStorage.setItem('tastyc_tenant_id', data.user.tenantId);
      }
      setToken(data.token);
      // Refresh full profile (includes subscription entitlements)
      try {
        const me = await api.auth.getMe();
        setUser(me);
      } catch {
        setUser(data.user);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (registerData: any) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(registerData);
      localStorage.setItem('tastyc_token', data.token);
      localStorage.setItem('tastyc_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('tastyc_token');
    localStorage.removeItem('tastyc_user');
    localStorage.removeItem('tastyc_tenant_id');
    setToken(null);
    setUser(null);
  };

  const planFeatures = user?.subscription?.features || [];
  const hasFeature = (featureKey: string) => {
    if (user?.role === 'SUPER_ADMIN') return true;
    if (user?.subscription?.isExpired) return false;
    return planFeatures.includes(featureKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        planFeatures,
        login,
        register,
        logout,
        hasFeature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
