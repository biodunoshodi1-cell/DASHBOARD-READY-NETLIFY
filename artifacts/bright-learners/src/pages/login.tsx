import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brighty } from '@/components/Brighty';
import { GraduationCap, Users, BookOpen, Shield } from 'lucide-react';
import type { FirebaseSessionInputRole } from '@workspace/api-client-react';

const roleCards = [
  { role: 'student' as FirebaseSessionInputRole, icon: GraduationCap, label: 'Student', gradient: 'gradient-math' },
  { role: 'parent' as FirebaseSessionInputRole, icon: Users, label: 'Parent', gradient: 'gradient-english' },
  { role: 'teacher' as FirebaseSessionInputRole, icon: BookOpen, label: 'Teacher', gradient: 'gradient-phonics' },
  { role: 'admin' as FirebaseSessionInputRole, icon: Shield, label: 'Admin', gradient: 'gradient-games' },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register, loginWithGoogle, firebaseEnabled } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<FirebaseSessionInputRole>('student');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const friendlyError = (err: unknown): string => {
    const code = (err as { code?: string })?.code ?? '';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return 'Incorrect email or password.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account already exists with that email — try logging in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password should be at least 6 characters.';
    }
    if (!firebaseEnabled) {
      return 'Sign-in is not set up yet for this deployment. See DEPLOYMENT.md for Firebase setup.';
    }
    return mode === 'login' ? 'Login failed. Please check your credentials.' : 'Could not create account.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName, selectedRole);
      }
      setLocation('/home');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setLocation('/home');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Full-bleed photo: entire left half of the screen (edge to edge,
          no rounded corners/padding) on larger screens, and a large top
          section on phones - not a small banner tucked inside the card
          like before. */}
      <div className="relative h-64 sm:h-80 lg:h-auto lg:w-1/2 lg:min-h-[100dvh]">
        <img
          src="/images/therapy-session.png"
          alt="A learning support session between an adult and a child"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </div>

      <div className="flex-1 bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 flex items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-card rounded-3xl shadow-2xl p-8 border-2 border-border">
          <div className="flex justify-center mb-6">
            <Brighty size={100} />
          </div>

          <h1 className="text-3xl font-black text-center mb-2 text-foreground">
            {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </h1>
          <p className="text-center text-muted-foreground mb-8 font-semibold">
            {mode === 'login' ? 'Sign in to continue' : 'Choose your role to get started'}
          </p>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              {roleCards.map(({ role, icon: Icon, label, gradient }) => (
                <motion.button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`${gradient} rounded-2xl p-4 text-white relative overflow-hidden ${
                    selectedRole === role ? 'ring-4 ring-purple-600 ring-offset-2' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid={`role-${role}`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm font-bold text-center">{label}</div>
                </motion.button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Label htmlFor="displayName" className="text-foreground font-bold">Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="mt-1.5 rounded-xl"
                  data-testid="input-display-name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-foreground font-bold">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1.5 rounded-xl"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1.5 rounded-xl"
                data-testid="input-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm font-semibold">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg rounded-xl h-12"
              data-testid="button-login"
            >
              {isLoading ? 'One moment...' : mode === 'login' ? "Let's Learn!" : 'Create Account'}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full font-bold rounded-xl h-12"
              data-testid="button-google-signin"
            >
              Sign in with Google
            </Button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="w-full text-center text-sm text-muted-foreground mt-6 font-medium hover:text-foreground"
            data-testid="button-toggle-mode"
          >
            {mode === 'login' ? "New here? Create an account" : 'Already have an account? Sign in'}
          </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
