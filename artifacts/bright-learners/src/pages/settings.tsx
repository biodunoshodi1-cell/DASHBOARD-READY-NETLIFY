import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Settings as SettingsIcon, Volume2, Music, Moon } from 'lucide-react';

export default function Settings() {
  const settings = useSettings();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/home">
            <Button variant="ghost" className="mb-4 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-card rounded-3xl p-4 shadow-lg">
              <SettingsIcon className="w-16 h-16 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-foreground">Settings</h1>
              <p className="text-xl font-bold text-muted-foreground">Customize Your Experience</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card rounded-3xl p-8 shadow-lg border-2 border-border space-y-8"
        >
          {/* Dark Mode */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-border">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-muted-foreground" />
              <div>
                <Label htmlFor="dark-mode" className="text-lg font-black text-foreground">Dark Mode</Label>
                <p className="text-sm text-muted-foreground font-semibold">Easier on the eyes at night</p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => settings.updateSettings({ darkMode: checked })}
              data-testid="switch-dark-mode"
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-border">
            <div className="flex items-center gap-3">
              <Volume2 className="w-6 h-6 text-muted-foreground" />
              <div>
                <Label htmlFor="sound" className="text-lg font-black text-foreground">Sound Effects</Label>
                <p className="text-sm text-muted-foreground font-semibold">Play sounds when you answer</p>
              </div>
            </div>
            <Switch
              id="sound"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => settings.updateSettings({ soundEnabled: checked })}
              data-testid="switch-sound"
            />
          </div>

          {/* Music */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-border">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-muted-foreground" />
              <div>
                <Label htmlFor="music" className="text-lg font-black text-foreground">Background Music</Label>
                <p className="text-sm text-muted-foreground font-semibold">Play music while learning</p>
              </div>
            </div>
            <Switch
              id="music"
              checked={settings.musicEnabled}
              onCheckedChange={(checked) => settings.updateSettings({ musicEnabled: checked })}
              data-testid="switch-music"
            />
          </div>

          {/* Voice Speed */}
          <div className="pb-6 border-b-2 border-border">
            <Label className="text-lg font-black text-foreground mb-4 block">Voice Speed</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-muted-foreground">Slow</span>
              <Slider
                value={[settings.voiceSpeed]}
                onValueChange={(value) => settings.updateSettings({ voiceSpeed: value[0] })}
                min={0.5}
                max={2}
                step={0.1}
                className="flex-1"
                data-testid="slider-voice-speed"
              />
              <span className="text-sm font-bold text-muted-foreground">Fast</span>
            </div>
            <p className="text-sm text-muted-foreground font-semibold mt-2">Current: {settings.voiceSpeed.toFixed(1)}x</p>
          </div>

          {/* Font Size */}
          <div className="pb-6 border-b-2 border-border">
            <Label className="text-lg font-black text-foreground mb-4 block">Font Size</Label>
            <div className="grid grid-cols-3 gap-4">
              {['normal', 'large', 'extra-large'].map((size) => (
                <Button
                  key={size}
                  onClick={() => settings.updateSettings({ fontSize: size as any })}
                  variant={settings.fontSize === size ? 'default' : 'outline'}
                  className="rounded-2xl font-bold capitalize"
                  data-testid={`button-font-${size}`}
                >
                  {size === 'extra-large' ? 'Extra Large' : size}
                </Button>
              ))}
            </div>
          </div>

          {/* Dyslexia Font */}
          <div className="flex items-center justify-between pb-6 border-b-2 border-border">
            <div>
              <Label htmlFor="dyslexia-font" className="text-lg font-black text-foreground">Dyslexia-Friendly Font</Label>
              <p className="text-sm text-muted-foreground font-semibold">Easier to read for some learners</p>
            </div>
            <Switch
              id="dyslexia-font"
              checked={settings.dyslexiaFont}
              onCheckedChange={(checked) => settings.updateSettings({ dyslexiaFont: checked })}
              data-testid="switch-dyslexia-font"
            />
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast" className="text-lg font-black text-foreground">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground font-semibold">Stronger colors for better visibility</p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => settings.updateSettings({ highContrast: checked })}
              data-testid="switch-high-contrast"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
