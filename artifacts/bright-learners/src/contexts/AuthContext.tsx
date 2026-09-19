import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogout, useGetMe, useFirebaseSession, getGetMeQueryKey } from '@workspace/api-client-react';
import type { User, FirebaseSessionInputRole } from '@workspace/api-client-react';
import {
  isFirebaseConfigured,
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithEmail as firebaseSignInWithEmail,
  registerWithEmail as firebaseRegisterWithEmail,
  resetPassword as firebaseResetPassword,
  signOutOfFirebase,
} from '@/lib/firebase';

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
  /** Firebase configured on this deployment? If false, only legacy password login/register are available. */
  firebaseEnabled: boolean;
  /** Sign in with email/password via Firebase, then establish an app session. */
  login: (email: string, password: string) => Promise<void>;
  /** Create a new Firebase account, then establish an app session with the given profile details. */
  register: (
    email: string,
    password: string,
    displayName: string,
    role: FirebaseSessionInputRole,
    gradeLevel?: number,
    age?: number,
  ) => Promise<void>;
  /** Sign in with Google via Firebase, then establish an app session (auto-creates a student account on first sign-in). */
  loginWithGoogle: () => Promise<void>;
  /** Send a password reset email via Firebase. */
  resetPassword: (email: string) => Promise<void>;
  /** Skip sign-in entirely and browse as a guest — no backend/database call is made. */
  continueAsGuest: () => void;
  logout: () => Promise<void>;
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
  const firebaseSessionMutation = useFirebaseSession();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (meData && !user) {
      setUser(meData);
      localStorage.setItem('bright-learners-user', JSON.stringify(meData));
    }
  }, [meData, user]);

  const establishSessionFromFirebaseUser = async (
    firebaseUser: { getIdToken: () => Promise<string> },
    profile?: { displayName?: string; role?: FirebaseSessionInputRole; gradeLevel?: number; age?: number },
  ) => {
    const idToken = await firebaseUser.getIdToken();
    const userData = await firebaseSessionMutation.mutateAsync({
      data: { idToken, ...profile },
    });
    setUser(userData);
    localStorage.setItem('bright-learners-user', JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    const firebaseUser = await firebaseSignInWithEmail(email, password);
    await establishSessionFromFirebaseUser(firebaseUser);
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: FirebaseSessionInputRole,
    gradeLevel?: number,
    age?: number,
  ) => {
    const firebaseUser = await firebaseRegisterWithEmail(email, password);
    await establishSessionFromFirebaseUser(firebaseUser, { displayName, role, gradeLevel, age });
  };

  const loginWithGoogle = async () => {
    const firebaseUser = await firebaseSignInWithGoogle();
    await establishSessionFromFirebaseUser(firebaseUser, {
      displayName: firebaseUser.displayName ?? undefined,
    });
  };

  const resetPassword = async (email: string) => {
    await firebaseResetPassword(email);
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
    await Promise.allSettled([logoutMutation.mutateAsync(), signOutOfFirebase()]);
    setUser(null);
    localStorage.removeItem('bright-learners-user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: meLoading,
        isGuest,
        firebaseEnabled: isFirebaseConfigured,
        login,
        register,
        loginWithGoogle,
        resetPassword,
        continueAsGuest,
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
