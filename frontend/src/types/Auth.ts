// src/types/Auth.ts (create this if it doesn't exist)
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // ... other auth methods
}