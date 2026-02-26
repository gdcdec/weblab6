import React, {createContext, useState, useEffect, useContext} from 'react';
import type {ReactNode} from 'react';
import type {User} from '../types/user';
import {
  getUser as getStoredUser,
  setUser as setStoredUser,
  removeUser,
  setAccessToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from '../utils/storage';

interface AuthContextType {
  user: User | null;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeAccessToken();
    removeRefreshToken();
    removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{user, login, logout, isLoading}}>
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
