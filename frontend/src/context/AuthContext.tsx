import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user:  User  | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void; // add method to update user profile
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user:  null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user,  setUser ] = useState<User  | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (tok: string, u: User) => {
    setToken(tok);
    setUser(u);
    localStorage.setItem('token', tok);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
