import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode, FC } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'CAJERO' | 'COCINA' | 'REPARTIDOR';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Verificar si el token sigue siendo válido
    fetch(`${window.location.protocol}//${window.location.hostname}:8007/auth/profile`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
    .then(res => {
      if (!res.ok) {
        logout();
        window.location.href = '/login';
      }
    })
    .catch(() => {
      logout();
      window.location.href = '/login';
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const login = (data: any) => {
    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
