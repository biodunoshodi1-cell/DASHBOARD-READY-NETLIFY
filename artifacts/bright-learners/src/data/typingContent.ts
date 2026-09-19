// ---------------------------------------------------------------------------
// Typing curriculum content — a touch-typing course layered on top of
// phonics/spelling patterns (in the spirit of Touch-type Read and Spell).
// Structure: Level -> Module -> word list (+ optional sentences for
// dictation). Each module teaches a new set of keyboard keys and pairs them
// with a phonics spelling pattern appropriate for that stage, so the same
// practice words serve both the typing drill and the "listen and type"
// dictation phase in typing-lesson.tsx.
// ---------------------------------------------------------------------------

export type TypingModule = {
  id: string;
  title: string;
  /** New keys this module introduces/focuses on (lowercase, "space" for spacebar) */
  newKeys: string[];
  /** Short label for the spelling/phonics pattern being practiced */
  pattern: string;
  /** Target words — used for the typing drill and (shuffled) for dictation */
  words: string[];
  /** Optional short sentences — used in higher levels for sentence dictation */
  sentences?: string[];
  /** True for pure key-drill modules that use letter strings instead of real words */
  isDrill?: boolean;
};

export type TypingLevel = {
  id: string;
  title: string;
  yearGroup: string;
  icon: string;
  color: string;
  description: string;
  modules: TypingModule[];
};

export const typingLevels: TypingLevel[] = [
  {
    id: 'level-1',
    title: 'Home Row Explorers',
    yearGroup: 'Years 1-2',
    icon: '🏠',
    color: 'from-pink-400 to-rose-500',
    description: 'Find the home row and start blending short vowel words.',
    modules: [
      {
        id: 'l1-m1',
        title: 'Left Hand Home Row',
        newKeys: ['a', 's', 'd', 'f'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['asdf', 'fdsa', 'ad', 'as', 'sad', 'dad', 'fad', 'add'],
      },
      {
        id: 'l1-m2',
        title: 'Right Hand Home Row',
        newKeys: ['j', 'k', 'l', ';'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['jkl;', ';lkj', 'jak', 'lad', 'all', 'ill', 'jak', 'kal'],
      },
      {
        id: 'l1-m3',
        title: 'Short A Words',
        newKeys: ['g', 'h', 't', 'space'],
        pattern: 'Short vowel: a',
        words: ['cat', 'hat', 'sat', 'mat', 'bag', 'hag', 'gas', 'flag', 'glad', 'gasp'],
      },
      {
        id: 'l1-m4',
        title: 'Short I and O Words',
        newKeys: ['i', 'o'],
        pattern: 'Short vowels: i, o',
        words: ['sit', 'lit', 'dig', 'lid', 'hot', 'dot', 'lot', 'dog', 'jog', 'fog'],
      },
      {
        id: 'l1-m5',
        title: 'Short E and U Words — Review',
        newKeys: ['e', 'u'],
        pattern: 'Short vowels: e, u',
        words: ['hen', 'ten', 'let', 'get', 'sun', 'fun', 'run', 'hug', 'jug', 'tug'],
      },
    ],
  },
  {
    id: 'level-2',
    title: 'Top Row Trailblazers',
    yearGroup: 'Years 1-2',
    icon: '⛰️',
    color: 'from-orange-400 to-yellow-500',
    description: 'Stretch up to the top row and start blending consonants.',
    modules: [
      {
        id: 'l2-m1',
        title: 'Top Row: Q W E R T',
        newKeys: ['q', 'w', 'e', 'r', 't'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['qwert', 'were', 'wet', 'wet', 'tree', 'rate', 'water', 'street'],
      },
      {
        id: 'l2-m2',
        title: 'Top Row: Y U I O P',
        newKeys: ['y', 'u', 'i', 'o', 'p'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['yuiop', 'you', 'put', 'pot', 'top', 'trip', 'point', 'yoyo'],
      },
      {
        id: 'l2-m3',
        title: 'Starting Blends',
        newKeys: ['b', 'c', 'l'],
        pattern: 'Consonant blends: bl, cl, fl',
        words: ['blob', 'blot', 'clap', 'clip', 'flag', 'flip', 'club', 'black', 'clock', 'flock'],
      },
      {
        id: 'l2-m4',
        title: 'Digraphs',
        newKeys: ['n', 'm'],
        pattern: 'Digraphs: sh, ch, th',
        words: ['ship', 'shop', 'chip', 'chat', 'that', 'them', 'thin', 'shin', 'chin', 'shut'],
      },
      {
        id: 'l2-m5',
        title: 'Double Consonants — Review',
        newKeys: ['v', 'z'],
        pattern: 'Double consonants: ll, ss, ff',
        words: ['bell', 'tell', 'well', 'miss', 'less', 'mess', 'huff', 'puff', 'stiff', 'shell'],
      },
    ],
  },
  {
    id: 'level-3',
    title: 'Bottom Row Builders',
    yearGroup: 'Years 2-3',
    icon: '🧱',
    color: 'from-yellow-400 to-amber-500',
    description: 'Reach the bottom row and meet the magic e.',
    modules: [
      {
        id: 'l3-m1',
        title: 'Bottom Row: Z X C V B',
        newKeys: ['z', 'x', 'c', 'v', 'b'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['zxcvb', 'buzz', 'crab', 'box', 'fox', 'vet', 'zip', 'club'],
      },
      {
        id: 'l3-m2',
        title: 'Bottom Row: N M , . /',
        newKeys: ['n', 'm', ',', '.', '/'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['nm,./', 'man.', 'name,', 'moon.', 'mine.', 'name.'],
      },
      {
        id: 'l3-m3',
        title: 'Magic E: a-e, i-e',
        newKeys: ['space'],
        pattern: 'Split digraph: a-e, i-e',
        words: ['cake', 'lake', 'gate', 'made', 'bike', 'kite', 'time', 'nine', 'like', 'mine'],
      },
      {
        id: 'l3-m4',
        title: 'Magic E: o-e, u-e, e-e',
        newKeys: [],
        pattern: 'Split digraph: o-e, u-e, e-e',
        words: ['home', 'note', 'bone', 'rope', 'cute', 'tube', 'June', 'these', 'here', 'Pete'],
      },
      {
        id: 'l3-m5',
        title: 'Vowel Teams AI/AY, EE/EA — Review',
        newKeys: [],
        pattern: 'Vowel teams: ai, ay, ee, ea',
        words: ['rain', 'pain', 'play', 'stay', 'tree', 'green', 'sea', 'read', 'meat', 'team'],
      },
    ],
  },
  {
    id: 'level-4',
    title: 'Number Navigators',
    yearGroup: 'Years 3-4',
    icon: '🔢',
    color: 'from-purple-400 to-indigo-500',
    description: 'Type numbers confidently and master r-controlled vowels.',
    modules: [
      {
        id: 'l4-m1',
        title: 'Number Row: 1 2 3 4 5',
        newKeys: ['1', '2', '3', '4', '5'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['12345', '123', '245', '314', '521', '432'],
      },
      {
        id: 'l4-m2',
        title: 'Number Row: 6 7 8 9 0',
        newKeys: ['6', '7', '8', '9', '0'],
        pattern: 'Finger placement drill',
        isDrill: true,
        words: ['67890', '678', '790', '806', '967', '2026'],
      },
      {
        id: 'l4-m3',
        title: 'Vowel Teams: oa, oo',
        newKeys: [],
        pattern: 'Vowel teams: oa, oo',
        words: ['boat', 'coat', 'road', 'goal', 'moon', 'soon', 'food', 'pool', 'book', 'look'],
      },
      {
        id: 'l4-m4',
        title: 'R-Controlled: ar, or',
        newKeys: [],
        pattern: 'R-controlled vowels: ar, or',
        words: ['car', 'star', 'farm', 'park', 'for', 'fork', 'corn', 'sport', 'storm', 'born'],
      },
      {
        id: 'l4-m5',
        title: 'R-Controlled: ir, ur, er — Review',
        newKeys: [],
        pattern: 'R-controlled vowels: ir, ur, er',
        words: ['bird', 'girl', 'shirt', 'turn', 'hurt', 'burn', 'her', 'term', 'fern', 'sister'],
      },
    ],
  },
  {
    id: 'level-5',
    title: 'Capital Crew',
    yearGroup: 'Years 4-5',
    icon: '✨',
    color: 'from-blue-400 to-cyan-500',
    description: 'Master Shift for capitals and take on trickier vowel teams.',
    modules: [
      {
        id: 'l5-m1',
        title: 'Shift & Capitals',
        newKeys: ['shift'],
        pattern: 'Capital letters for names and sentence starts',
        words: ['Amy', 'Ben', 'Cairo', 'Dubai', 'Monday', 'Friday', 'London', 'August'],
      },
      {
        id: 'l5-m2',
        title: 'Vowel Teams: oi, oy',
        newKeys: [],
        pattern: 'Vowel teams: oi, oy',
        words: ['coin', 'join', 'point', 'noise', 'boy', 'toy', 'enjoy', 'royal', 'annoy', 'voice'],
      },
      {
        id: 'l5-m3',
        title: 'Vowel Teams: ow, ou',
        newKeys: [],
        pattern: 'Vowel teams: ow, ou',
        words: ['cow', 'how', 'down', 'brown', 'out', 'shout', 'cloud', 'round', 'sound', 'mouth'],
      },
      {
        id: 'l5-m4',
        title: 'Silent Letters',
        newKeys: [],
        pattern: 'Silent letters: kn, wr, mb',
        words: ['know', 'knee', 'knock', 'write', 'wrap', 'wrong', 'comb', 'climb', 'thumb', 'lamb'],
      },
      {
        id: 'l5-m5',
        title: 'Names & Sentences — Review',
        newKeys: [],
        pattern: 'Capitals in short sentences',
        words: ['Amy', 'Ben', 'Cairo', 'Monday', 'know', 'write', 'coin', 'brown'],
        sentences: ['Amy can write her name.', 'We know it will rain on Monday.'],
      },
    ],
  },
  {
    id: 'level-6',
    title: 'Sentence Speedsters',
    yearGroup: 'Years 5-6',
    icon: '🚀',
    color: 'from-indigo-400 to-purple-600',
    description: 'Punctuate and type full sentences at speed.',
    modules: [
      {
        id: 'l6-m1',
        title: 'Punctuation Marks',
        newKeys: ['!', '?', "'"],
        pattern: 'Sentence punctuation',
        isDrill: true,
        words: ["can't", "it's", "don't", 'Stop!', 'Really?', "she's", "won't", 'Wait!'],
      },
      {
        id: 'l6-m2',
        title: 'Suffixes',
        newKeys: [],
        pattern: 'Common suffixes: -ing, -ed, -s',
        words: ['jumping', 'running', 'walked', 'played', 'cats', 'boxes', 'talking', 'wanted'],
      },
      {
        id: 'l6-m3',
        title: 'Prefixes',
        newKeys: [],
        pattern: 'Common prefixes: un-, re-, dis-',
        words: ['unhappy', 'unfair', 'replay', 'rebuild', 'disagree', 'dislike', 'unkind', 'restart'],
      },
      {
        id: 'l6-m4',
        title: 'Full Sentences',
        newKeys: [],
        pattern: 'Sentence dictation',
        words: ['school', 'friend', 'because', 'together', 'important', 'different'],
        sentences: [
          'My friend and I walked to school together.',
          "It's important to try your best, even when it's hard.",
          'We are learning something different and exciting today.',
        ],
      },
      {
        id: 'l6-m5',
        title: 'Speed Review',
        newKeys: [],
        pattern: 'Mixed review at speed',
        words: ['because', 'important', 'different', 'together', 'friend', 'school', 'unhappy', 'replay'],
        sentences: ['Practice makes progress, not perfection.', 'Keep going, you are doing brilliantly!'],
      },
    ],
  },
];

export function findModule(levelId: string, moduleId: string): { level: TypingLevel; module: TypingModule } | undefined {
  const level = typingLevels.find((l) => l.id === levelId);
  const module = level?.modules.find((m) => m.id === moduleId);
  if (!level || !module) return undefined;
  return { level, module };
}

export function totalTypingModules(): number {
  return typingLevels.reduce((sum, l) => sum + l.modules.length, 0);
}
