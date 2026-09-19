import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brighty } from '@/components/Brighty';
import { GraduationCap, Users, BookOpen, Shield, MessageCircle } from 'lucide-react';
import type { RegisterInputRole } from '@workspace/api-client-react';

const roleCards = [
  { role: 'student' as RegisterInputRole, icon: GraduationCap, label: 'Student', gradient: 'gradient-math' },
  { role: 'parent' as RegisterInputRole, icon: Users, label: 'Parent', gradient: 'gradient-english' },
  { role: 'teacher' as RegisterInputRole, icon: BookOpen, label: 'Teacher', gradient: 'gradient-phonics' },
  { role: 'admin' as RegisterInputRole, icon: Shield, label: 'Admin', gradient: 'gradient-games' },
];

// WhatsApp number used by the footer button below (digits only, country
// code first, no + or spaces) — https://wa.me/<number>.
const WHATSAPP_NUMBER = '971544078461';

type Mode = 'login' | 'register';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [selectedRole, setSelectedRole] = useState<RegisterInputRole>('student');
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState(''); // login: username or email
  const [username, setUsername] = useState(''); // register: username
  const [email, setEmail] = useState(''); // register: optional email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const friendlyError = (err: unknown): string => {
    const message = (err as { message?: string })?.message ?? '';
    // ApiError messages look like "HTTP 401 Unauthorized: Invalid username...".
    // Strip the HTTP prefix so the person just sees the actual reason.
    const afterColon = message.includes(': ') ? message.split(': ').slice(1).join(': ') : message;
    if (afterColon) return afterColon;
    return mode === 'login' ? 'Login failed. Please check your username/email and password.' : 'Could not create account.';
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(identifier, password);
      } else {
        if (!username.trim() && !email.trim()) {
          setError('Enter a username or an email address.');
          setIsLoading(false);
          return;
        }
        await register(
          { username: username.trim() || undefined, email: email.trim() || undefined },
          password,
          displayName,
          selectedRole,
        );
      }
      setLocation('/home');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();
    setLocation('/home');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row">
      {/* Left brand panel — background photo with the purple brand gradient
          layered on top as a translucent overlay so the existing white text
          stays readable. Swap /public/login-hero.jpg for a different photo
          to change the image shown here. */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        <img
          src="/login-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/85 via-indigo-600/80 to-purple-700/85" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-72 h-72 rounded-full bg-pink-400/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>

        <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-full p-2 border border-white/30">
            <Brighty size={36} />
          </div>
          <span className="text-white font-black text-lg drop-shadow">Adaptive Learning Support</span>
        </div>

        <div className="absolute bottom-12 left-8 right-8 z-10">
          <h2 className="text-4xl font-black text-white drop-shadow-lg leading-tight mb-4">
            One-on-one support, built around every learner.
          </h2>
          <p className="text-white/90 font-semibold text-lg drop-shadow">
            Sign in to follow along with lessons, sessions, and progress from your
            Adaptive Learning Support team.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white dark:bg-background min-h-[100dvh] md:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <Brighty size={90} />
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

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
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

              {mode === 'login' ? (
                <div>
                  <Label htmlFor="identifier" className="text-foreground font-bold">Username or Email</Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="your username or email"
                    required
                    autoComplete="username"
                    className="mt-1.5 rounded-xl"
                    data-testid="input-identifier"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="username" className="text-foreground font-bold">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Pick a username"
                      autoComplete="username"
                      className="mt-1.5 rounded-xl"
                      data-testid="input-username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground font-bold">
                      Email <span className="font-normal text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-1.5 rounded-xl"
                      data-testid="input-email"
                    />
                  </div>
                </>
              )}

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
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                data-testid="button-submit"
              >
                {isLoading ? 'One moment...' : mode === 'login' ? "Let's Learn!" : 'Create Account'}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="text-center mt-6 space-y-2">
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-muted-foreground font-medium hover:text-foreground"
              data-testid="button-toggle-mode"
            >
              {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="mt-4 w-full text-center text-sm font-bold text-muted-foreground hover:text-foreground underline underline-offset-2"
            data-testid="button-continue-as-guest"
          >
            Continue as Guest — browse without an account
          </button>
          <p className="mt-1 text-xs text-muted-foreground text-center">
            Handy if the server or database is temporarily down. Lessons and games work, but progress won't be saved and multiplayer games need an account.
          </p>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-border text-center space-y-2">
            <div className="flex justify-center">
              <Brighty size={28} />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} Adaptive Learning Support. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              info@adaptivelearningsupport.com
            </p>
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                title="Chat with us on WhatsApp"
                className="inline-flex items-center justify-center w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-full mt-2 transition-colors shadow-md"
                data-testid="button-whatsapp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
