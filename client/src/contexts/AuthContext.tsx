import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { User } from "@/types";
import API from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("hostel_user");
    const token = localStorage.getItem("token");

    if (token) {
      (async () => {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('hostel_user', JSON.stringify(res.data.user));
        } catch {
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.clear();
            }
          } else {
            localStorage.clear();
          }
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false);
    }
  }, []);

  // 🔐 LOGIN (REAL BACKEND)
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("hostel_user", JSON.stringify(res.data.user));

      setUser(res.data.user);
    } catch {
      throw new Error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📝 REGISTER (REAL BACKEND)
  const register = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      const res = await API.post("/auth/register", data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("hostel_user", JSON.stringify(res.data.user));

      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🚪 LOGOUT
  const logout = useCallback(() => {
    setUser(null);
    localStorage.clear();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
