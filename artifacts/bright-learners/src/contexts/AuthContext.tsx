import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogin, useRegister, useLogout, useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import type { User, RegisterInputRole } from '@workspace/api-client-react';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  /** True once the visitor has chosen "Continue as Guest" — lets them browse
   * static lesson content and offline-friendly games without any backend or
   * database call, for use when the server/database is unreachable (e.g.
   * a suspended free-tier host) or the person just wants to look around
   * without creating an account. Progress, rewards, and anything requiring
   * a real account (dashboards, Live Race, Live Memory) isn't available in
   * this mode, since those genuinely need a working backend session. */
  isGuest: boolean;
  /** Sign in with a username (or email) + password against this app's own
   * backend — no third-party authenticator involved. */
  login: (identifier: string, password: string) => Promise<void>;
  /** Create a new account with a username and/or email + password. */
  register: (
    identifier: { username?: string; email?: string },
    password: string,
    displayName: string,
    role: RegisterInputRole,
    gradeLevel?: number,
    age?: number,
  ) => Promise<void>;
  /** Skip sign-in entirely and browse as a guest — no backend/database call is made. */
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  /** Merge partial fields into the current user and persist them locally —
   * used after a mutation (e.g. changing avatarUrl) that already updated
   * the server so the UI reflects it immediately without a full refetch. */
  updateLocalUser: (fields: Partial<User>) => void;
}

const GUEST_STORAGE_KEY = 'bright-learners-guest';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('bright-learners-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isGuest, setIsGuest] = useState<boolean>(() => localStorage.getItem(GUEST_STORAGE_KEY) === 'true');

  const { data: meData, isLoading: meLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey(), enabled: !user && !isGuest, retry: false } });
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (meData && !user) {
      setUser(meData);
      localStorage.setItem('bright-learners-user', JSON.stringify(meData));
    }
  }, [meData, user]);

  const login = async (identifier: string, password: string) => {
    const userData = await loginMutation.mutateAsync({ data: { identifier, password } });
    setUser(userData);
    localStorage.setItem('bright-learners-user', JSON.stringify(userData));
  };

  const register = async (
    identifier: { username?: string; email?: string },
    password: string,
    displayName: string,
    role: RegisterInputRole,
    gradeLevel?: number,
    age?: number,
  ) => {
    const userData = await registerMutation.mutateAsync({
      data: { ...identifier, password, displayName, role, gradeLevel, age },
    });
    setUser(userData);
    localStorage.setItem('bright-learners-user', JSON.stringify(userData));
  };

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setIsGuest(true);
  };

  const logout = async () => {
    if (isGuest) {
      // No real session was ever created — nothing to tell the server.
      localStorage.removeItem(GUEST_STORAGE_KEY);
      setIsGuest(false);
      return;
    }
    await logoutMutation.mutateAsync();
    setUser(null);
    localStorage.removeItem('bright-learners-user');
  };

  const updateLocalUser = (fields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...fields };
      localStorage.setItem('bright-learners-user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: meLoading,
        isGuest,
        login,
        register,
        continueAsGuest,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
