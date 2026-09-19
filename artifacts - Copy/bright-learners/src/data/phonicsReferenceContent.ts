// ---------------------------------------------------------------------------
// Phonics Reference Book content — adapted from "The Phonics Rules Book"
// (Reading Roots) into structured, browsable sections for the app's new
// Phonics "Reference" tab. This is reference material for parents/teachers
// (and older learners) to look things up — the "Practice" tab still has the
// hands-on sound-by-sound lessons and quizzes.
// ---------------------------------------------------------------------------

export type RefTableRow = {
  spelling: string;
  example: string;
  sound: string;
  notes: string;
};

export type RefBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'table'; title?: string; rows: RefTableRow[] }
  | { type: 'tip'; text: string };

export type ReferenceSection = {
  id: string;
  title: string;
  icon: string;
  summary: string;
  blocks: RefBlock[];
};

export const phonicsReferenceSections: ReferenceSection[] = [
  {
    id: 'foundations',
    title: 'Foundations of Phonics',
    icon: '🌱',
    summary: 'How children learn sounds, vowels vs consonants, and the order to introduce letter sounds.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Children learn to speak by hearing the sounds around them — and learning to read begins the same way. It starts with listening to and identifying individual sounds in words, called phonemes. Phonics is the next step: connecting those sounds to letters (graphemes), and learning to blend them to read words.',
      },
      { type: 'paragraph', text: 'Consonants vs Vowels: What\u2019s the Difference?' },
      {
        type: 'bullets',
        items: [
          'Vowels are letters that let air flow freely when we speak: a, e, i, o, u (and sometimes y).',
          'Consonants are sounds made by blocking air with the lips, tongue, or teeth: all other letters.',
          'Every syllable in a word has at least one vowel sound, and vowels form the heart of each syllable.',
        ],
      },
      { type: 'paragraph', text: 'Introducing Letter Sounds' },
      {
        type: 'paragraph',
        text: 'There is no single "right" way to introduce letter sounds. Different phonics schemes may use slightly different sequences. However, one widely recommended order introduces the most common and useful sounds first — those that appear frequently and allow early word building.',
      },
      {
        type: 'bullets',
        items: [
          'Single Letter Sounds: s, a, t, p, i, n, m, d, g, o, c, k, e, u, r, h, b, f, l, j, v, w, qu, x, y, z',
          'Digraphs and Trigraphs: ck, qu, ch, sh, th (voiceless), th (voiced), ng, nk, ai, ee, igh, oa, oo (long), oo (short), ar, or, ur, er, ow, oi, air, ear, ure',
        ],
      },
      {
        type: 'tip',
        text: 'Start with just a few sounds at a time — two per session for very young children, three to five for older children. Use visuals and plenty of repetition; keep reviewing daily with flashcards and simple blending practice. Little and often is the key!',
      },
      { type: 'paragraph', text: 'Crack the Sounds Code' },
      {
        type: 'paragraph',
        text: 'The English language has many ways of writing the same sound. Use a reference chart like the tables below to reinforce new sounds after they\u2019ve been taught, help children visually connect spoken sounds to different spelling choices, and identify common patterns in reading and spelling. For example: /ai/ can be spelled ai, a-e, ay, or eigh; /ee/ can be spelled ee, ea, e-e, y, or ie.',
      },
    ],
  },
  {
    id: 'letters-and-sounds',
    title: 'Letters & Sounds',
    icon: '🔤',
    summary: 'The 26 letters and their first sounds, short vs long vowels, and voiced vs unvoiced consonants.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Introduce each letter with its most common sound first: a (apple), b (bat), c (cat), d (dog), e (egg), f (fish), g (goat), h (hat), i (igloo), j (jam), k (kite), l (lion), m (mouse), n (net), o (octopus), p (pig), qu (queen), r (rabbit), s (sun), t (top), u (umbrella), v (van), w (web), x (box \u2013 /ks/), y (yo-yo), z (zebra).',
      },
      {
        type: 'tip',
        text: 'We don\u2019t recommend teaching the sounds in this alphabetical order — see the suggested teaching order in Foundations of Phonics above.',
      },
      { type: 'paragraph', text: 'Short Vowels & Long Vowels: What\u2019s the Difference?' },
      {
        type: 'bullets',
        items: [
          'Short vowels: a (apple), e (egg), i (insect), o (octopus), u (umbrella)',
          'Long vowels say their own name: a (apron, alien), e (even, equal), i (ice, idea), o (open, over), u (unicorn, unit)',
        ],
      },
      { type: 'paragraph', text: 'Voiced & Unvoiced Consonants' },
      {
        type: 'bullets',
        items: [
          'Voiced (vibration in the throat): b, d, g, j, l, m, n, r, v, w, y, z',
          'Unvoiced (no vibration — like a whisper): c, f, h, k, p, qu, s, t, x. Place a hand on the throat while saying the sound to feel the difference.',
        ],
      },
      { type: 'paragraph', text: 'Helping Children with Confusing Letters (b/d and p/q)' },
      {
        type: 'bullets',
        items: [
          '/b/: lips closed at the start = straight line first, then bump',
          '/d/: mouth open at the start = bump first, then straight line',
          'Try mnemonics like "bat and ball" for b, or "drum and stick" for d',
        ],
      },
    ],
  },
  {
    id: 'vowel-sounds',
    title: 'Vowel Sound Spellings',
    icon: '🔡',
    summary: 'When to use each spelling — the different ways to write the A, E, I, O, and U sounds.',
    blocks: [
      {
        type: 'paragraph',
        text: 'This is a guide to show when we commonly find these sounds in words, according to their spelling — please note there are many exceptions to these rules.',
      },
      {
        type: 'table',
        title: 'Long A Sound',
        rows: [
          { spelling: 'a', example: 'apron', sound: '/\u0101/ (long A)', notes: 'Appears in open syllables, where the syllable ends in a vowel sound (e.g., a-pron, ba-by, ta-ble).' },
          { spelling: 'ai', example: 'train', sound: '/\u0101/ (long A)', notes: 'Usually appears in the middle of words, before a consonant (e.g., train, paint). Rarely appears at the end of a word.' },
          { spelling: 'ay', example: 'day', sound: '/\u0101/ (long A)', notes: 'Commonly used at the end of words or syllables (e.g., day, play, holiday).' },
          { spelling: 'a_e', example: 'brave', sound: '/\u0101/ (long A)', notes: 'A split digraph where A and E are separated by a consonant (e.g., brave, cake). Often found in one-syllable words.' },
          { spelling: 'ea', example: 'steakhouse', sound: '/\u0101/ (long A)', notes: 'Rare spelling for long A, found in a few exception words (e.g., steak, break, great). Usually, ea makes the long E sound.' },
        ],
      },
      {
        type: 'table',
        title: 'Short A Sound',
        rows: [
          { spelling: 'a', example: 'cat', sound: '/a/ (short A)', notes: 'Typically appears in CVC (consonant-vowel-consonant) words like cat, hat, map, jam.' },
        ],
      },
      {
        type: 'table',
        title: 'Long E Sound',
        rows: [
          { spelling: 'e', example: 'he', sound: '/\u0113/ (long E)', notes: 'Appears in open syllables, often at the end of short words (e.g., me, she, we).' },
          { spelling: 'ee', example: 'tree', sound: '/\u0113/ (long E)', notes: 'A common spelling for long E, often found in nature or object words (e.g., tree, sheep, feet).' },
          { spelling: 'ea', example: 'sea, pea', sound: '/\u0113/ (long E)', notes: 'Found in many food and water words (e.g., tea, meat, cream, peach, stream, beach). Note: this digraph can also make other sounds (e.g., bread, great).' },
          { spelling: 'ie', example: 'relief', sound: '/\u0113/ (long E)', notes: 'Often appears before f or c in unstressed syllables (e.g., relief, belief, piece).' },
          { spelling: 'y', example: 'jolly', sound: '/\u0113/ (long E)', notes: 'Makes the long E sound at the end of multisyllabic words (e.g., happy, silly, jolly).' },
          { spelling: 'e_e', example: 'complete', sound: '/\u0113/ (long E)', notes: 'A split digraph, where e is followed by a consonant and a final e (e.g., these, eve, concrete) — common in longer or compound words.' },
        ],
      },
      {
        type: 'table',
        title: 'Short E Sound',
        rows: [
          { spelling: 'e', example: 'pen', sound: '/e/ (short E)', notes: 'Appears in CVC words and in the middle of syllables (e.g., bed, ten, men, elephant).' },
          { spelling: 'ea', example: 'bread, head', sound: '/e/ (short E)', notes: 'Irregular spelling — exception words where ea makes the short E sound (e.g., bread, dead, lead [metal]).' },
        ],
      },
      {
        type: 'table',
        title: 'Long I Sound',
        rows: [
          { spelling: 'i', example: 'child, wild', sound: '/\u012b/ (long I)', notes: 'Often found before -ld, -nd, and -gh (e.g., kind, blind, high) — silent E not always needed.' },
          { spelling: 'ie', example: 'pie', sound: '/\u012b/ (long I)', notes: 'Found in one-syllable words, usually at the end (e.g., tie, die).' },
          { spelling: 'igh', example: 'flight', sound: '/\u012b/ (long I)', notes: 'Trigraph, often found in the middle or end of words (e.g., night, sight, light).' },
          { spelling: 'y', example: 'cry, my', sound: '/\u012b/ (long I)', notes: 'Found at the end of one-syllable words (e.g., sky, why).' },
          { spelling: 'i_e', example: 'invite', sound: '/\u012b/ (long I)', notes: 'Split digraph, where i is followed by a consonant and then a silent e (e.g., bike, time, five).' },
        ],
      },
      {
        type: 'table',
        title: 'Short I Sound',
        rows: [
          { spelling: 'i', example: 'sit', sound: '/i/ (short I)', notes: 'Found in CVC words (e.g., pin, big, win).' },
          { spelling: 'y', example: 'gym', sound: '/i/ (short I)', notes: 'Occurs in unstressed syllables or Greek-based words (e.g., symbol, system).' },
        ],
      },
      {
        type: 'table',
        title: 'Long O Sound',
        rows: [
          { spelling: 'o', example: 'go', sound: '/\u014d/ (long O)', notes: 'Appears in open syllables (syllables ending in a vowel sound), e.g., no, so, hero.' },
          { spelling: 'oa', example: 'coast', sound: '/\u014d/ (long O)', notes: 'Found in the middle of words, often before consonants (e.g., boat, toad, roast).' },
          { spelling: 'oe', example: 'foe', sound: '/\u014d/ (long O)', notes: 'Typically found at the end of words.' },
          { spelling: 'ow', example: 'elbow', sound: '/\u014d/ (long O)', notes: 'Commonly at the end of words (e.g., blow, throw, row) — note: can also say /ow/ as in cow.' },
          { spelling: 'o_e', example: 'stone', sound: '/\u014d/ (long O)', notes: 'Split digraph: vowel-consonant-silent E, e.g., bone, hope, joke.' },
        ],
      },
      {
        type: 'table',
        title: 'Short O Sound',
        rows: [
          { spelling: 'o', example: 'dog', sound: '/o/ (short O)', notes: 'Found in CVC words and short syllables (e.g., hot, pot, log) — short, round vowel sound.' },
        ],
      },
      {
        type: 'table',
        title: 'Long U Sound',
        rows: [
          { spelling: 'u', example: 'unicorn', sound: '/\u016b/ (long U)', notes: 'Appears at the start of open syllables, especially in multisyllabic words.' },
          { spelling: 'ue', example: 'blue', sound: '/\u016b/ (long U)', notes: 'Appears at the end of words (e.g., glue, true).' },
          { spelling: 'ew', example: 'new', sound: '/\u016b/ (long U)', notes: 'Often follows n, l, or r (e.g., knew, chew, stew).' },
          { spelling: 'u_e', example: 'cube', sound: '/\u016b/ (long U)', notes: 'Split digraph, common in CVCe pattern words (e.g., mule, tune, cute).' },
        ],
      },
      {
        type: 'table',
        title: 'Short U Sound',
        rows: [
          { spelling: 'u', example: 'cup', sound: '/u/ (short U)', notes: 'Most common in CVC words and short syllables (e.g., sun, bug, fun).' },
        ],
      },
      {
        type: 'table',
        title: 'OO Sound',
        rows: [
          { spelling: 'oo', example: 'goose', sound: '/oo/ (long oo)', notes: 'Commonly found in the middle of words, often before n or m (e.g., room, broom) \u2013 long /oo/ sound.' },
        ],
      },
      {
        type: 'table',
        title: '\u2018OU\u2019 and \u2018OW\u2019 Sound',
        rows: [
          { spelling: 'ou', example: 'shout', sound: '/ow/', notes: 'Appears in the middle of words and makes the /ow/ sound (e.g., shout, mouth, loud).' },
          { spelling: 'ow', example: 'cow, now', sound: '/ow/', notes: 'Appears at the end of words or syllables, or before consonant blends like \u2013l or \u2013n, and also makes the /ow/ sound (e.g., cow, how, brown, growl, frown).' },
        ],
      },
      {
        type: 'table',
        title: '\u2018OI\u2019 Sound',
        rows: [
          { spelling: 'oi', example: 'coin', sound: '/oi/', notes: 'Appears in the middle of words and makes the /oi/ sound (e.g., coin, soil, point).' },
          { spelling: 'oy', example: 'annoy', sound: '/oi/', notes: 'Appears at the end of words or syllables and makes the /oi/ sound (e.g., boy, toy, annoy, enjoy).' },
        ],
      },
    ],
  },
  {
    id: 'r-controlled-and-or-sounds',
    title: '\u2018AR\u2019, \u2018ER\u2019 and \u2018OR\u2019 Sounds',
    icon: '🚗',
    summary: 'R-controlled vowel spellings — ar, er/ir/ur/ear, and or/aw/au/oor/ore.',
    blocks: [
      {
        type: 'table',
        title: '\u2018AR\u2019 Sound',
        rows: [
          { spelling: 'ar', example: 'garden', sound: '/ar/', notes: 'Appears in the middle or at the end of words (e.g., garden, star, car).' },
          { spelling: 'a', example: 'grass', sound: '/ar/', notes: 'In some British accents, a can make the /ar/ sound before ss, th, st, lf, or ff (e.g., grass, bath, staff, half).' },
        ],
      },
      {
        type: 'table',
        title: '\u2018ER\u2019 Sound',
        rows: [
          { spelling: 'er', example: 'baker', sound: '/\u0259r/', notes: 'Appears at the end of words, often in unstressed syllables (e.g., baker, runner, teacher). Often called the \u2018schwa\u2019 sound.' },
          { spelling: 'ir', example: 'twirl', sound: '/\u0259r/', notes: 'Appears in the middle of words (e.g., twirl, girl, shirt). Often called the \u2018schwa\u2019 sound.' },
          { spelling: 'ur', example: 'burn', sound: '/\u0259r/', notes: 'Appears in the middle or end of words (e.g., burn, turn, hurt). Often in action, emotion, or sensory words.' },
          { spelling: 'ear', example: 'earn, pearl, early', sound: '/\u0259r/', notes: 'Appears in a small number of exception words (e.g., earn, early, pearl). Irregular spelling — requires exposure and repetition.' },
        ],
      },
      {
        type: 'table',
        title: '\u2018OR\u2019 Sound',
        rows: [
          { spelling: 'or', example: 'storm', sound: '/or/', notes: 'Appears in the middle or end of words (e.g., storm, fork, born).' },
          { spelling: 'aw', example: 'straw, crawl, yawn', sound: '/or/', notes: 'Appears at the end of words or before l, n, or k (e.g., straw, crawl, yawn).' },
          { spelling: 'au', example: 'haunt', sound: '/or/', notes: 'Appears in the middle of words (e.g., haunt, launch, autumn). Less predictable — requires exposure.' },
          { spelling: 'oor', example: 'moor', sound: '/or/', notes: 'Appears at the end of words, often place or state words (e.g., moor, poor, door).' },
          { spelling: 'ore', example: 'restore', sound: '/or/', notes: 'Appears at the end of words, often more formal or abstract (e.g., restore, explore, before).' },
        ],
      },
    ],
  },
  {
    id: 'consonant-sounds',
    title: 'Consonant Sounds',
    icon: '🔠',
    summary: 'How each consonant sound is spelled — B through Z — with examples and notes.',
    blocks: [
      {
        type: 'table',
        rows: [
          { spelling: 'b', example: 'bin', sound: '/b/', notes: 'Appears at the start, middle, or end of words. Often doubled after short vowels (e.g., bin, rabbit, grab).' },
          { spelling: 'd', example: 'drum', sound: '/d/', notes: 'Appears at the start, middle, or end of words. Often doubled after short vowels (e.g., drum, ladder, mad).' },
          { spelling: 'f', example: 'fence', sound: '/f/', notes: 'Appears at the start, middle, or end of words. Often doubled after short vowels (e.g., fence, puffer, off).' },
          { spelling: 'g', example: 'gap', sound: '/g/', notes: 'Makes a hard /g/ sound before a, o, u (e.g., gap, gold, gum). Before e, i, or y it can say /j/ (e.g., giant, gem, gym).' },
          { spelling: 'h', example: 'helmet', sound: '/h/', notes: 'Appears at the start of words or syllables (e.g., helmet, happy). Silent in some words (e.g., honest, hour).' },
          { spelling: 'j', example: 'jacket', sound: '/j/', notes: 'Appears at the start or middle of words (e.g., jacket, jungle).' },
          { spelling: 'dge', example: 'badge', sound: '/j/', notes: 'Used after short vowels at the end of words (e.g., badge, fudge).' },
          { spelling: 'k', example: 'kit', sound: '/k/', notes: 'Used before the vowels e, i, or y (e.g., kit, keep, key).' },
          { spelling: 'c', example: 'cupboard', sound: '/k/', notes: 'Used before a, o, or u (e.g., cat, cold, cup).' },
          { spelling: 'ck', example: 'track', sound: '/k/', notes: 'Appears at the end of words after a short vowel (e.g., back, neck, duck).' },
          { spelling: 'ch', example: 'echo', sound: '/k/', notes: 'Appears in words with Greek roots (e.g., echo, school, chorus).' },
          { spelling: 'l', example: 'lizard', sound: '/l/', notes: 'Appears at the start, middle, or end of words. Often doubled after a short vowel to keep the vowel sound short (e.g., doll, fill, dollar).' },
          { spelling: 'm', example: 'mirror', sound: '/m/', notes: 'Appears at the start, middle, or end of words. Often doubled after a short vowel (e.g., mammal, hammer, summer).' },
          { spelling: 'n', example: 'napkin', sound: '/n/', notes: 'Used at the start, middle, or end. Doubled after short vowels (e.g., tunnel, funny).' },
          { spelling: 'kn', example: 'knot', sound: '/n/', notes: '\u2018kn\u2019 is only used at the start of some words to spell the /n/ sound — the \u2018k\u2019 is silent (e.g., knot, knife, know).' },
          { spelling: 'p', example: 'puppet', sound: '/p/', notes: 'Found at the start, middle, or end. Doubled after short vowels (e.g., happy, pepper).' },
          { spelling: 'r', example: 'rocket', sound: '/r/', notes: 'Found at the start, middle, or end. Doubled after short vowels (e.g., berry, sorry).' },
          { spelling: 'wr', example: 'wristwatch', sound: '/r/', notes: '\u2018w\u2019 is silent before \u2018r\u2019 in some words, often linked to twisting or movement (e.g., wrist, write, wrap).' },
          { spelling: 's', example: 'sunset', sound: '/s/', notes: 'Used at the start, middle, or end. Doubled after short vowels (e.g., mess, lesson).' },
          { spelling: 'c', example: 'circus', sound: '/s/', notes: '\u2018c\u2019 says /s/ before e, i, or y (e.g., cent, city, cycle).' },
          { spelling: 'ce', example: 'fence', sound: '/s/', notes: '\u2018ce\u2019 can say /s/ in some words, often with Latin roots (e.g., science, scene).' },
          { spelling: 't', example: 'tablet', sound: '/t/', notes: 'Used at the start, middle, or end. Doubled after short vowels (e.g., butter, kitten).' },
          { spelling: 'ed', example: 'hopped', sound: '/t/', notes: '\u2018ed\u2019 can say /t/ at the end of past tense verbs (e.g., hopped, looked).' },
          { spelling: 'v', example: 'velvet', sound: '/v/', notes: 'Used at the start or middle (e.g., van, oven). At the end, it\u2019s usually spelled with \u2018ve\u2019 (e.g., give, love).' },
          { spelling: 'w', example: 'wobble', sound: '/w/', notes: 'Used at the start of words or syllables (e.g., wind, away). Sometimes silent (e.g., who, whole).' },
          { spelling: 'wh', example: 'whisker', sound: '/w/', notes: 'Used at the start of question or forceful movement words (e.g., whisk, what, when).' },
          { spelling: 'z', example: 'zebra', sound: '/z/', notes: 'Used at the start, middle, or end. Doubled after short vowels (e.g., fizz, dizzy).' },
          { spelling: 's', example: 'toys', sound: '/z/', notes: '\u2018s\u2019 can say /z/ between vowels or in some endings (e.g., has, is, toys).' },
          { spelling: 'x', example: 'xylophone', sound: '/z/', notes: 'Sometimes says /z/ at the start of words (mostly words from Greek, e.g., xylophone, xylem).' },
        ],
      },
    ],
  },
  {
    id: 'blending-word-building',
    title: 'Blending & Word Building',
    icon: '🧱',
    summary: 'CVC words, counting syllables, open syllables, and the 5 jobs of silent e.',
    blocks: [
      { type: 'paragraph', text: 'CVC Words and the Closed Syllable Rule' },
      {
        type: 'paragraph',
        text: 'CVC stands for Consonant-Vowel-Consonant. Examples include cat, dog, net. These words are usually single-syllable with a short vowel sound, and the final consonant "closes" the syllable. For example, in the word "not," the t closes the vowel o, so it says /\u014f/.',
      },
      { type: 'paragraph', text: 'How to Count Syllables in Words' },
      {
        type: 'paragraph',
        text: 'A syllable is a single beat of sound in a word. Every syllable must contain a vowel sound. Try these ways to count syllables:',
      },
      {
        type: 'bullets',
        items: ['Clap each beat in the word', 'Place a hand under your chin: each time your chin drops is one syllable', 'Hum the word and listen for the pulses'],
      },
      { type: 'paragraph', text: 'Open Syllables and Long Vowel Sounds' },
      {
        type: 'paragraph',
        text: 'An open syllable ends in a vowel. With no consonant to close it, the vowel is usually long (says its name): e.g. go, we, she, me.',
      },
      { type: 'paragraph', text: 'Split Digraph Words (CVCe Words)' },
      {
        type: 'paragraph',
        text: 'Adding a silent e at the end usually makes the vowel say its name (long vowel sound). This is the most common job of silent e.',
      },
      { type: 'bullets', items: ['cap \u2192 cape', 'pet \u2192 Pete', 'kit \u2192 kite', 'not \u2192 note', 'cub \u2192 cube'] },
      { type: 'paragraph', text: '5 Jobs of Silent E' },
      {
        type: 'bullets',
        items: [
          'Makes the vowel long: pin \u2192 pine',
          'Softens c/g: race, large',
          'Stops words from ending in u or v: blue, give',
          'Keeps a word from looking plural: house',
          'Changes th from unvoiced to voiced: breath \u2192 breathe',
        ],
      },
    ],
  },
  {
    id: 'digraphs-and-trigraphs',
    title: 'Digraphs & Trigraphs',
    icon: '🎶',
    summary: 'Vowel digraphs, consonant digraphs, trigraphs, and r-controlled combinations at a glance.',
    blocks: [
      {
        type: 'bullets',
        items: [
          'Vowel Digraphs (two vowels working together): ai (rain), ay (play), ee (see), ea (beach), oa (boat), ow (snow), igh (light), ie (tie), ue (blue), ew (new), oo (moon/book), ou (shout), ow (cow), oy (boy), oi (coin), au (author), aw (claw)',
          'Consonant Digraphs (two letters, one new sound): sh (ship), th (voiced: this / unvoiced: think), ch (chip), wh (when), ph (phone), ng (ring), nk (stink), ck (duck), qu (queen)',
          'Trigraphs (three letters, one sound): tch (match), dge (badge)',
          'R-Controlled Digraphs and Trigraphs: ar (car), or (fork), er (her), ir (bird), ear (hear), air (fair)',
        ],
      },
    ],
  },
  {
    id: 'rules-to-remember',
    title: 'Rules to Remember',
    icon: '📌',
    summary: 'The Cat/Kite rule, the FLOSS rule, the doubling rule, and suffix spelling rules.',
    blocks: [
      { type: 'paragraph', text: 'The Cat/Kite Rule (C vs. K)' },
      { type: 'bullets', items: ['Use "c" before a, o, u: cat, cot, cup', 'Use "k" before e, i, y: kite, key, kid'] },
      { type: 'paragraph', text: 'FLOSS Rule' },
      {
        type: 'paragraph',
        text: 'If a short word ends in f, l, or s (or z), and it has a short vowel sound, double the last letter! Like this: fluff, bell, kiss, off, doll, mess. We call it the FLOSS Rule because "floss" follows the rule — and it has f, l, and s in it!',
      },
      {
        type: 'bullets',
        items: [
          'FF: cliff, stuff, off, cuff, staff',
          'LL: bell, grill, sell, spill, krill',
          'SS: boss, dress, floss, mess, dress',
          'ZZ: buzz, jazz, fuzz, frizz, fizz',
        ],
      },
      { type: 'paragraph', text: 'Doubling Rule' },
      {
        type: 'paragraph',
        text: 'When a word is short and ends in 1 vowel + 1 consonant, and you\u2019re adding -ing, -ed, or -er — double the last letter! Like this: run \u2192 running, hop \u2192 hopped, big \u2192 bigger.',
      },
      { type: 'tip', text: 'A handy way to remember it: "One, two, double I do!"' },
      { type: 'paragraph', text: 'Adding Suffixes to Silent E Words' },
      {
        type: 'bullets',
        items: [
          'Drop the e before a vowel suffix (like -ing, -ed, -er): hope \u2192 hoping, bake \u2192 baked',
          'Keep the e before a consonant suffix (like -ful, -less, -ment): hope \u2192 hopeful, care \u2192 careless',
        ],
      },
      {
        type: 'tip',
        text: 'Think: "If the suffix starts with a vowel — drop the e! If the suffix starts with a consonant — keep the e!"',
      },
      { type: 'paragraph', text: 'Words Cannot End in i, u, v, or j' },
      {
        type: 'paragraph',
        text: 'So we add another letter to follow spelling rules — usually a silent e. Examples: have (not hav), give (not giv), love (not lov). (A rare exception to the rule: ski.)',
      },
    ],
  },
  {
    id: 'special-word-types',
    title: 'Special Word Types',
    icon: '🦎',
    summary: 'The 4 sounds of Y, the 3 sounds of -ED, and a few vowel sound surprises.',
    blocks: [
      { type: 'paragraph', text: 'Sounds of Y ("Chameleon Y")' },
      {
        type: 'bullets',
        items: [
          '/y/ as in yarn — a consonant sound, at the beginning of a syllable',
          '/\u012b/ as in fly — long I, at the end of a short, 1-syllable word',
          '/\u0113/ as in candy — long E, at the end of a 2+ syllable word',
          '/\u012d/ as in gym — short I, in the middle of a word, usually of Greek origin',
        ],
      },
      { type: 'paragraph', text: 'Sounds of ED' },
      {
        type: 'paragraph',
        text: 'The suffix -ed can sound three different ways — but it\u2019s spelled the same!',
      },
      {
        type: 'bullets',
        items: [
          '/t/ \u2014 when the base word ends in a quiet sound: jump \u2192 jumped, wash \u2192 washed',
          '/d/ \u2014 when the base word ends in a voiced sound: play \u2192 played, clean \u2192 cleaned',
          '/\u026ad/ (or /ed/) \u2014 when the base word ends in t or d: wait \u2192 waited, land \u2192 landed',
        ],
      },
      { type: 'tip', text: 'Tip to remember: if the word already ends in t or d, you need an extra syllable: /ed/.' },
      { type: 'paragraph', text: 'Vowel Variants & Sound Surprises' },
      {
        type: 'bullets',
        items: ['Broad a: a sounds like /o/ \u2014 wash, wasp', 'Scribal o: o sounds like /u/ \u2014 some, come'],
      },
    ],
  },
  {
    id: 'spelling-tricks',
    title: 'Spelling Tricks',
    icon: '🪄',
    summary: 'Plural rules, and the soft C / soft G rule.',
    blocks: [
      { type: 'paragraph', text: 'Plural Rules' },
      {
        type: 'bullets',
        items: [
          'Most of the time, just add -s: cat \u2192 cats',
          'Add -es if the word ends in s, x, z, ch, sh: box \u2192 boxes, brush \u2192 brushes',
          'If the word ends in a consonant + y, change y to ies: baby \u2192 babies',
          'If the word ends in f or fe, change to ves: leaf \u2192 leaves, knife \u2192 knives',
        ],
      },
      { type: 'paragraph', text: 'Soft C and G Rule' },
      {
        type: 'paragraph',
        text: 'When c or g is followed by e, i, or y, it usually makes a soft sound: c \u2192 /s/ (like in cent, city, cycle); g \u2192 /j/ (like in giraffe, giant, gym).',
      },
    ],
  },
  {
    id: 'silent-letters',
    title: 'Silent Letters',
    icon: '🤫',
    summary: 'Common silent-letter patterns: kn, wr, mb, gn, rh, gh.',
    blocks: [
      {
        type: 'bullets',
        items: [
          'kn: know, knee',
          'wr: write, wrist',
          'mb: lamb, climb',
          'gn: gnome, sign',
          'rh: rhyme',
          'gh: ghost, laugh',
        ],
      },
    ],
  },
  {
    id: 'glossary',
    title: 'Glossary of Phonics Terms',
    icon: '📚',
    summary: 'Quick definitions for phoneme, grapheme, digraph, blending, decoding, and more.',
    blocks: [
      {
        type: 'bullets',
        items: [
          'Phonological Awareness \u2014 The ability to hear and work with the individual sounds in spoken words, including syllables, rhymes, and phonemes.',
          'Phonics \u2014 A method of teaching children to read and spell by connecting spoken sounds (phonemes) with letters or groups of letters (graphemes).',
          'Phoneme \u2014 The smallest unit of sound in speech, e.g., /k/ /a/ /t/ in "cat."',
          'Grapheme \u2014 A letter or group of letters used to represent a phoneme, such as \u2018c\u2019, \u2018k\u2019, \u2018ck\u2019, or \u2018ch\u2019 for /k/.',
          'Digraph \u2014 Two letters that represent one sound (e.g., \u2018sh\u2019 in "ship").',
          'Trigraph \u2014 Three letters that represent one sound (e.g., \u2018igh\u2019 in "night").',
          'Split Digraph \u2014 A digraph where the letters are split by another letter (e.g., \u2018a-e\u2019 in "cake").',
          'Syllable \u2014 A unit of pronunciation with one vowel sound (e.g., "water" has two syllables: wa-ter).',
          'Short Vowels \u2014 Vowel sounds like the \u2018a\u2019 in "cat" or \u2018u\u2019 in "cut."',
          'Long Vowels \u2014 Vowel sounds that match the letter name (e.g., \u2018a\u2019 in "cake").',
          'CVC Words \u2014 Words with a consonant-vowel-consonant pattern (e.g., "dog").',
          'Segmenting \u2014 Breaking a word into its individual sounds (e.g., "dog" \u2192 /d/ /o/ /g/).',
          'Blending \u2014 Combining individual sounds to form words (e.g., /c/ /a/ /t/ \u2192 "cat").',
          'Decoding \u2014 Using knowledge of sounds and letters to read words.',
          'Tricky Words \u2014 Words that don\u2019t follow regular phonics rules (e.g., "the," "was").',
          'Fluency \u2014 Reading with speed, accuracy, and expression.',
          'Comprehension \u2014 Understanding and making sense of what is being read.',
        ],
      },
    ],
  },
];
