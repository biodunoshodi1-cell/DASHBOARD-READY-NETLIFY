import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface CertificateProps {
  open: boolean;
  onClose: () => void;
  /** Name of the lesson, quiz, or game just completed, e.g. "Addition (Year 1)" or "Color Match — Level 6". */
  activityTitle: string;
  /** Optional short result line, e.g. "8/10 correct" or "Level 6 of 10 complete". */
  scoreLabel?: string;
}

// A printable "Certificate of Achievement" with the learner's own name on
// it, shown after completing any lesson, quiz, or game. Uses the browser's
// native print dialog (Print / Save as PDF) rather than a PDF library, so
// it works everywhere with no extra dependencies. The print-only CSS that
// hides the rest of the page while printing lives in index.css.
export function Certificate({ open, onClose, activityTitle, scoreLabel }: CertificateProps) {
  const { user, isGuest } = useAuth();
  if (!open) return null;

  const childName = user?.displayName?.trim() || (isGuest ? 'Guest Learner' : 'Learner');
  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:backdrop-blur-none"
      onClick={onClose}
      data-testid="certificate-overlay"
    >
      <div
        className="certificate-print relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 print:p-0 print:shadow-none print:rounded-none print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-muted hover:bg-muted/70 rounded-full p-2 print:hidden"
          aria-label="Close certificate"
          data-testid="button-close-certificate"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-8 border-double border-amber-400 rounded-2xl p-6 sm:p-12 text-center bg-gradient-to-br from-amber-50 via-white to-yellow-50">
          <div className="text-5xl mb-2">🏆</div>
          <p className="text-xs sm:text-sm font-black tracking-[0.3em] text-amber-600 uppercase mb-1">Bright Learners</p>
          <h2 className="font-serif text-2xl sm:text-4xl font-black text-foreground mb-6">Certificate of Achievement</h2>

          <p className="text-muted-foreground font-semibold mb-2">This certifies that</p>
          <p className="font-serif text-2xl sm:text-4xl font-black text-amber-600 mb-2 break-words px-2">{childName}</p>
          <p className="text-muted-foreground font-semibold mb-2">has successfully completed</p>
          <p className="text-lg sm:text-2xl font-black text-foreground mb-4 break-words px-2">{activityTitle}</p>

          {scoreLabel && <p className="text-base sm:text-lg font-bold text-green-600 mb-4">{scoreLabel}</p>}

          <div className="text-2xl sm:text-3xl mb-4" aria-hidden="true">
            ⭐⭐⭐⭐⭐
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold">{dateStr}</p>
        </div>

        <div className="flex gap-3 mt-4 print:hidden">
          <Button
            onClick={() => window.print()}
            className="flex-1 rounded-2xl font-black bg-amber-500 hover:bg-amber-600 text-white"
            data-testid="button-print-certificate"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print / Save as PDF
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-2xl font-black" data-testid="button-close-certificate-bottom">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
