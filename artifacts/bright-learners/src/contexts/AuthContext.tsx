import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogout, useGetMe, useFirebaseSession } from '@workspace/api-client-react';
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
  /** Send a password-reset email via Firebase. */
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('bright-learners-user');
    return stored ? JSON.parse(stored) : null;
  });

  const { data: meData, isLoading: meLoading } = useGetMe({ query: { enabled: !user, retry: false } });
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

  const logout = async () => {
    await Promise.allSettled([logoutMutation.mutateAsync(), signOutOfFirebase()]);
    setUser(null);
    localStorage.removeItem('bright-learners-user');
  };

  const resetPassword = async (email: string) => {
    await firebaseResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: meLoading,
        firebaseEnabled: isFirebaseConfigured,
        login,
        register,
        loginWithGoogle,
        resetPassword,
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
