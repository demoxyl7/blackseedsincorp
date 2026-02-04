import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG } from '@/lib/api-config';

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (storedToken: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/me`, {
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
        setToken(storedToken);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any }> => {
    try {
      // FIX: FastAPI OAuth2 expects form-url-encoded, not JSON
      const formData = new URLSearchParams();
      formData.append('username', email); 
      formData.append('password', password);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        setAdmin(data.user || { email, id: 'admin', name: 'Admin' });
        localStorage.setItem('admin_token', data.access_token);
        return { success: true };
      } else {
        return { success: false, error: data.detail || 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Connection failed. Is the backend running?' };
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: !!admin && !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};