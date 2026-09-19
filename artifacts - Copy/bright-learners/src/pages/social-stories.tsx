import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, X, ChevronLeft, ChevronRight, RotateCcw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { socialStories, type SocialStory } from '@/data/socialStoriesContent';

// ---------------------------------------------------------------------------
// Social Stories — short, first-person, picture-book style stories that
// help a child understand and practice everyday social/emotional
// situations (asking for things, separation at drop-off, staying safe,
// etc.), read together with a trusted adult or read aloud by the app.
// Self-contained: no backend calls, no progress tracking — just a calm,
// repeatable resource.
// ---------------------------------------------------------------------------

export default function SocialStories() {
  const { playSound } = useSettings();
  const [openStory, setOpenStory] = useState<SocialStory | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const openBook = (story: SocialStory) => {
    setOpenStory(story);
    setPageIndex(0);
    playSound('click');
  };

  const closeBook = () => {
    speechSynthesis.cancel();
    setOpenStory(null);
  };

  const isLastPage = openStory ? pageIndex === openStory.pages.length : false;
  const currentPage = openStory && !isLastPage ? openStory.pages[pageIndex] : null;

  const goNext = () => {
    if (!openStory) return;
    speechSynthesis.cancel();
    if (pageIndex < openStory.pages.length) {
      setPageIndex((i) => i + 1);
      playSound('click');
    }
  };

  const goPrev = () => {
    if (pageIndex === 0) return;
    speechSynthesis.cancel();
    setPageIndex((i) => i - 1);
    playSound('click');
  };

  const readAloud = () => {
    if (!currentPage) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentPage.text);
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
    playSound('click');
  };

  const readAgain = () => {
    setPageIndex(0);
    playSound('click');
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-b-2 border-white/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/home">
            <Button variant="ghost" className="mb-4 rounded-full" data-testid="button-back">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="bg-white dark:bg-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg shrink-0">
              <Heart className="w-10 h-10 sm:w-16 sm:h-16 text-teal-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground truncate">Social Stories</h1>
              <p className="text-sm sm:text-lg md:text-xl font-bold text-muted-foreground truncate">
                Short stories to help with everyday feelings and moments
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-center text-muted-foreground font-semibold max-w-2xl mx-auto mb-10">
          Read together with a grown-up, or tap "Read Aloud" on any page. It's okay to read a story
          more than once — that's how we learn!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialStories.map((story, index) => (
            <motion.button
              key={story.id}
              onClick={() => openBook(story)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.04, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
              className={`text-left bg-gradient-to-br ${story.color} rounded-3xl p-6 shadow-xl text-white`}
              data-testid={`story-card-${story.id}`}
            >
              <div className="text-6xl mb-4">{story.emoji}</div>
              <h3 className="text-2xl font-black mb-2">{story.title}</h3>
              <p className="text-white/90 font-semibold text-sm leading-relaxed">{story.summary}</p>
              <div className="mt-4 inline-block bg-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-black">
                Read Story →
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Book reader overlay */}
      <AnimatePresence>
        {openStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative w-full max-w-2xl bg-gradient-to-br ${openStory.color} rounded-3xl shadow-2xl p-6 sm:p-10 text-white min-h-[420px] flex flex-col`}
            >
              <button
                onClick={closeBook}
                className="absolute top-4 right-4 bg-white/25 hover:bg-white/40 rounded-full p-2 transition-colors"
                aria-label="Close story"
                data-testid="button-close-story"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center font-black text-lg mb-4">{openStory.title}</div>

              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {!isLastPage && currentPage ? (
                    <motion.div
                      key={pageIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="text-center px-2"
                    >
                      <div className="text-8xl sm:text-9xl mb-8">{currentPage.emoji}</div>
                      <p className="text-2xl sm:text-3xl font-black leading-snug break-words">{currentPage.text}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="the-end"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center px-2"
                    >
                      <div className="text-8xl sm:text-9xl mb-6">🎉</div>
                      <p className="text-3xl sm:text-4xl font-black mb-2">The End!</p>
                      <p className="text-lg sm:text-xl font-bold text-white/90">Great job reading this story!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 my-4 flex-wrap">
                {openStory.pages.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === pageIndex ? 'bg-white' : i < pageIndex || isLastPage ? 'bg-white/70' : 'bg-white/30'
                    }`}
                  />
                ))}
                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isLastPage ? 'bg-white' : 'bg-white/30'}`} />
              </div>

              {/* Controls */}
              {!isLastPage ? (
                <div className="flex items-center justify-between gap-3">
                  <Button
                    onClick={goPrev}
                    disabled={pageIndex === 0}
                    variant="ghost"
                    className="rounded-full text-white hover:text-white hover:bg-white/20 disabled:opacity-30"
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={readAloud}
                    className="rounded-full bg-white/25 hover:bg-white/40 text-white font-black px-6"
                    data-testid="button-read-aloud"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Read Aloud
                  </Button>
                  <Button
                    onClick={goNext}
                    className="rounded-full bg-white text-foreground hover:bg-white/90 font-black"
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={readAgain}
                    className="rounded-full bg-white/25 hover:bg-white/40 text-white font-black"
                    data-testid="button-read-again"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Read Again
                  </Button>
                  <Button
                    onClick={closeBook}
                    className="rounded-full bg-white text-foreground hover:bg-white/90 font-black"
                    data-testid="button-finish-story"
                  >
                    All Done
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
