// src/types/Auth.ts (create this if it doesn't exist)
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'seller';
  profileImage?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // ... other auth methods
}