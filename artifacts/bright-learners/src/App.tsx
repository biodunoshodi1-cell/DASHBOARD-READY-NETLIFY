import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { RouteGuard } from '@/components/RouteGuard';

import NotFound from '@/pages/not-found';
import Splash from '@/pages/splash';
import Login from '@/pages/login';
import Home from '@/pages/home';
import Math from '@/pages/math';
import MathLesson from '@/pages/math-lesson';
import English from '@/pages/english';
import EnglishLesson from '@/pages/english-lesson';
import Phonics from '@/pages/phonics';
import PhonicsLesson from '@/pages/phonics-lesson';
import Science from '@/pages/science';
import ScienceLesson from '@/pages/science-lesson';
import Geography from '@/pages/geography';
import GeographyLesson from '@/pages/geography-lesson';
import Pshe from '@/pages/pshe';
import PsheLesson from '@/pages/pshe-lesson';
import Games from '@/pages/games';
import GameMathSprint from '@/pages/game-math-sprint';
import GameMemory from '@/pages/game-memory';
import GameWordBuilder from '@/pages/game-word-builder';
import GameBalloonPop from '@/pages/game-balloon-pop';
import GameTreasureHunt from '@/pages/game-treasure-hunt';
import GamePicturePuzzle from '@/pages/game-picture-puzzle';
import GameShapeMatch from '@/pages/game-shape-match';
import GameLetterMatch from '@/pages/game-letter-match';
import GameSentenceBuilder from '@/pages/game-sentence-builder';
import GameNumberPuzzle from '@/pages/game-number-puzzle';
import GameLiveRace from '@/pages/game-live-race';
import TimesTablesRockStars from '@/pages/times-tables';
import GameLiveMemory from '@/pages/game-live-memory';
import GameBrainGames from '@/pages/game-brain-games';
import SocialStories from '@/pages/social-stories';
import Rewards from '@/pages/rewards';
import ProgressPage from '@/pages/progress';
import DailyChallenge from '@/pages/daily-challenge';
import ParentDashboard from '@/pages/parent-dashboard';
import TeacherDashboard from '@/pages/teacher-dashboard';
import AdminDashboard from '@/pages/admin-dashboard';
import Settings from '@/pages/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/home" component={Home} />
      
      {/* Math */}
      <Route path="/math" component={Math} />
      <Route path="/math/:topic" component={MathLesson} />
      
      {/* English */}
      <Route path="/english" component={English} />
      <Route path="/english/:topic" component={EnglishLesson} />
      
      {/* Phonics */}
      <Route path="/phonics" component={Phonics} />
      <Route path="/phonics/:section" component={PhonicsLesson} />

      {/* Science */}
      <Route path="/science" component={Science} />
      <Route path="/science/:topic" component={ScienceLesson} />

      {/* Geography */}
      <Route path="/geography" component={Geography} />
      <Route path="/geography/:topic" component={GeographyLesson} />

      {/* PSHE */}
      <Route path="/pshe" component={Pshe} />
      <Route path="/pshe/:topic" component={PsheLesson} />
      
      {/* Games */}
      <Route path="/games" component={Games} />
      <Route path="/games/math-sprint" component={GameMathSprint} />
      <Route path="/games/memory" component={GameMemory} />
      <Route path="/games/word-builder" component={GameWordBuilder} />
      <Route path="/games/balloon-pop" component={GameBalloonPop} />
      <Route path="/games/treasure-hunt" component={GameTreasureHunt} />
      <Route path="/games/picture-puzzle" component={GamePicturePuzzle} />
      <Route path="/games/shape-match" component={GameShapeMatch} />
      <Route path="/games/letter-match" component={GameLetterMatch} />
      <Route path="/games/sentence-builder" component={GameSentenceBuilder} />
      <Route path="/games/number-puzzle" component={GameNumberPuzzle} />
      <Route path="/games/live-race" component={GameLiveRace} />
      <Route path="/games/times-tables" component={TimesTablesRockStars} />
      <Route path="/games/live-memory" component={GameLiveMemory} />
      <Route path="/games/brain-games" component={GameBrainGames} />
      <Route path="/social-stories" component={SocialStories} />
      
      {/* Other Features */}
      <Route path="/rewards" component={Rewards} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/daily-challenge" component={DailyChallenge} />
      <Route path="/settings" component={Settings} />
      
      {/* Dashboards */}
      <Route path="/parent-dashboard" component={ParentDashboard} />
      <Route path="/teacher-dashboard" component={TeacherDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <WouterRouter hook={useHashLocation}>
              <RouteGuard>
                <Router />
              </RouteGuard>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
