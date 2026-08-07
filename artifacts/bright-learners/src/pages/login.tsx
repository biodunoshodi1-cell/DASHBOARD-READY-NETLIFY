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
  const { login, register, loginWithGoogle, resetPassword, firebaseEnabled } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<FirebaseSessionInputRole>('student');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetStatus, setResetStatus] = useState('');

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

  const handleForgotPassword = async () => {
    setError('');
    setResetStatus('');
    if (!email) {
      setError('Enter your email above first, then tap "Forgot password?"');
      return;
    }
    try {
      await resetPassword(email);
      setResetStatus(`Password reset email sent to ${email} — check your inbox.`);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Full-bleed photo: entire left half of the screen (edge to edge,
          no rounded corners/padding) on larger screens, and a large top
          section on phones - not a small banner tucked inside the card
          like before. A dark gradient overlay keeps the logo/tagline text
          readable against the photo underneath. */}
      <div className="relative h-64 sm:h-80 lg:h-auto lg:w-1/2 lg:min-h-[100dvh]">
        <img
          src="/images/therapy-session.png"
          alt="A learning support session between an adult and a child"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/60" />

        <div className="absolute top-6 left-6 flex items-center gap-2">
          <img src="/images/als-logo.png" alt="" className="h-8 w-8 rounded-lg bg-white/90 p-1" />
          <span className="text-white font-black text-lg drop-shadow">Adaptive Learning Support</span>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h2 className="text-white text-2xl sm:text-3xl font-black leading-tight drop-shadow">
            One-on-one support, built around every learner.
          </h2>
          <p className="text-white/90 text-sm mt-2 max-w-sm drop-shadow">
            Sign in to follow along with lessons, sessions, and progress from your Adaptive Learning Support team.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-card flex flex-col items-center justify-center p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex-1 flex flex-col justify-center"
        >
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-bold">Password</Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700"
                    data-testid="button-forgot-password"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
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

            {resetStatus && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl p-3 text-sm font-semibold">
                {resetStatus}
              </div>
            )}

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

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-bold text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full font-bold rounded-xl h-12"
              data-testid="button-google-signin"
            >
              Continue with Google
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
        </motion.div>

        {/* Footer: logo, copyright, contact email, and a WhatsApp link -
            shown under both the login and signup forms since they're the
            same page/component with mode toggled, not two separate pages. */}
        <footer className="w-full max-w-md mt-10 pt-6 border-t border-border flex flex-col items-center gap-3 text-center">
          <img src="/images/als-logo.png" alt="Adaptive Learning Support" className="h-8 w-auto" />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Adaptive Learning Support. All rights reserved.
          </p>
          <a
            href="mailto:info@adaptivelearningsupport.com"
            className="text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            info@adaptivelearningsupport.com
          </a>
          <a
            href="https://wa.me/971544078461"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-full px-4 py-2 transition-colors"
            data-testid="link-whatsapp"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.17-4.94-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .9 2.15.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.29.15.47.13.64-.08.17-.2.71-.83.9-1.11.19-.29.38-.24.63-.15.26.1 1.66.78 1.94.92.29.15.48.22.55.34.07.13.07.72-.16 1.4Z" />
            </svg>
            WhatsApp Us
          </a>
        </footer>
      </div>
    </div>
  );
}
