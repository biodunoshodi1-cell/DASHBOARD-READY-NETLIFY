import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Guests can browse static lesson content and single-player games (no
// backend call needed for those), but these routes genuinely require a
// real, authenticated account — they call the backend/database directly
// and would just show a broken or empty screen for a guest. Redirect
// guests away from these back to Home instead.
const ACCOUNT_ONLY_PREFIXES = [
  '/rewards',
  '/progress',
  '/daily-challenge',
  '/parent-dashboard',
  '/teacher-dashboard',
  '/admin-dashboard',
  '/games/live-race',
  '/games/live-memory',
  '/games/times-tables',
];

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading, isGuest } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isGuest && location !== '/login' && location !== '/') {
      setLocation('/login');
      return;
    }

    if (isGuest && !user && ACCOUNT_ONLY_PREFIXES.some((prefix) => location.startsWith(prefix))) {
      setLocation('/home');
    }
  }, [user, isGuest, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300">
        <div className="text-4xl font-black text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
