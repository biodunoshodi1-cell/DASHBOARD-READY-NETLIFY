import { useState } from 'react';
import { StarBurst } from '@/components/StarBurst';
import { Certificate } from '@/components/Certificate';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';

interface CelebrationPanelProps {
  /** Name of the lesson, quiz, or game just completed, e.g. "Addition (Year 1)" or "Color Match — Level 6". */
  activityTitle: string;
  /** Optional short result line shown on the certificate, e.g. "8/10 correct". */
  scoreLabel?: string;
  className?: string;
}

// Drop this into any "activity complete" / "lesson finished" / "game over"
// screen across the app. Plays a star-burst celebration once as soon as it
// mounts, shows an encouraging "You did it!" message, and offers a
// printable Certificate of Achievement with the learner's own name on it.
// Self-contained — no backend calls, works in Guest Mode too.
export function CelebrationPanel({ activityTitle, scoreLabel, className }: CelebrationPanelProps) {
  const [showCertificate, setShowCertificate] = useState(false);

  return (
    <div className={className}>
      <StarBurst trigger={true} />
      <p className="text-2xl sm:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 mb-3">
        🎉 You did it! 🎉
      </p>
      <div className="flex justify-center mb-2">
        <Button
          onClick={() => setShowCertificate(true)}
          className="rounded-2xl font-black bg-amber-500 hover:bg-amber-600 text-white"
          data-testid="button-get-certificate"
        >
          <Award className="w-5 h-5 mr-2" />
          Get My Certificate
        </Button>
      </div>
      <Certificate
        open={showCertificate}
        onClose={() => setShowCertificate(false)}
        activityTitle={activityTitle}
        scoreLabel={scoreLabel}
      />
    </div>
  );
}
