import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUser } from "../api/authApi";
import type { AuthData, User } from "../types/auth";

const AUTH_STORAGE_KEY = "learntrack_auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (authData: AuthData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    async function loadStoredUser() {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!storedAuth) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const parsedAuth: AuthData = JSON.parse(storedAuth);

        setToken(parsedAuth.token);
        setUser(parsedAuth.user);

        const freshUser = await getCurrentUser(parsedAuth.token);

        setUser(freshUser);

        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            user: freshUser,
            token: parsedAuth.token,
          }),
        );
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadStoredUser();
  }, []);

  function login(authData: AuthData) {
    setUser(authData.user);
    setToken(authData.token);

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAuthLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}