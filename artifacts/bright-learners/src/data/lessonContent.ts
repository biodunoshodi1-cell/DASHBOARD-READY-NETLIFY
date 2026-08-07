export type MathQuestion = {
  id: string;
  question: string;
  /** Emoji / symbol shown above the question (not used when clockTime is set) */
  image?: string;
  /** When present, an analog clock face is rendered instead of/alongside the image */
  clockTime?: { hour: number; minute: number };
  options: string[];
  correct: string;
  hint: string;
};

export type MathLesson = {
  title: string;
  questions: MathQuestion[];
};

export const mathLessons: Record<string, MathLesson> = {
  counting: {
    title: 'Counting',
    questions: [
      { id: 'count-1', question: 'How many stars?', image: '⭐⭐⭐', options: ['2', '3', '4', '5'], correct: '3', hint: 'Count each star one by one' },
      { id: 'count-2', question: 'Count the apples', image: '🍎🍎🍎🍎🍎', options: ['4', '5', '6', '7'], correct: '5', hint: 'Point to each apple as you count' },
      { id: 'count-3', question: 'How many flowers?', image: '🌸🌸🌸🌸🌸🌸🌸', options: ['6', '7', '8', '9'], correct: '7', hint: 'Count from left to right' },
      { id: 'count-4', question: 'Count the hearts', image: '❤️❤️❤️❤️', options: ['3', '4', '5', '6'], correct: '4', hint: 'How many can you see?' },
      { id: 'count-5', question: 'How many balloons?', image: '🎈🎈🎈🎈🎈🎈', options: ['5', '6', '7', '8'], correct: '6', hint: 'Count each balloon' },
      { id: 'count-6', question: 'Count to 10', image: '1 2 3 4 5 6 7 8 9 ?', options: ['9', '10', '11', '12'], correct: '10', hint: 'What comes after 9?' },
      { id: 'count-7', question: 'How many dots?', image: '• • • • • • • • •', options: ['8', '9', '10', '11'], correct: '9', hint: 'Count carefully' },
      { id: 'count-8', question: 'Count the circles', image: 'OOOOOOOO', options: ['7', '8', '9', '10'], correct: '8', hint: 'One by one' },
      { id: 'count-9', question: 'What number comes after 5?', image: '1 2 3 4 5 ?', options: ['4', '5', '6', '7'], correct: '6', hint: 'Count up!' },
      { id: 'count-10', question: 'How many stars in total?', image: '⭐⭐ + ⭐⭐⭐', options: ['4', '5', '6', '7'], correct: '5', hint: 'Count both groups together' },
    ],
  },
  addition: {
    title: 'Addition',
    questions: [
      { id: 'add-1', question: '2 + 3 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: 'Start at 2, count up 3 more' },
      { id: 'add-2', question: '5 + 2 = ?', options: ['6', '7', '8', '9'], correct: '7', hint: 'Add the numbers together' },
      { id: 'add-3', question: '4 + 4 = ?', options: ['6', '7', '8', '9'], correct: '8', hint: 'Double 4 means 4 + 4' },
      { id: 'add-4', question: '1 + 6 = ?', options: ['5', '6', '7', '8'], correct: '7', hint: 'Count up from 1' },
      { id: 'add-5', question: '3 + 5 = ?', options: ['7', '8', '9', '10'], correct: '8', hint: 'Put them together' },
      { id: 'add-6', question: '7 + 2 = ?', options: ['8', '9', '10', '11'], correct: '9', hint: 'Start at 7, add 2' },
      { id: 'add-7', question: '6 + 3 = ?', options: ['8', '9', '10', '11'], correct: '9', hint: 'Count on from 6' },
      { id: 'add-8', question: '5 + 5 = ?', options: ['9', '10', '11', '12'], correct: '10', hint: 'Double 5!' },
      { id: 'add-9', question: '8 + 1 = ?', options: ['7', '8', '9', '10'], correct: '9', hint: 'One more than 8' },
      { id: 'add-10', question: '4 + 6 = ?', options: ['9', '10', '11', '12'], correct: '10', hint: 'Think 4 + 6 makes 10' },
    ],
  },
  subtraction: {
    title: 'Subtraction',
    questions: [
      { id: 'sub-1', question: '5 - 2 = ?', options: ['2', '3', '4', '5'], correct: '3', hint: 'Take away 2 from 5' },
      { id: 'sub-2', question: '7 - 3 = ?', options: ['3', '4', '5', '6'], correct: '4', hint: 'Count back 3 from 7' },
      { id: 'sub-3', question: '9 - 4 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: "What's left after taking 4?" },
      { id: 'sub-4', question: '6 - 1 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: 'One less than 6' },
      { id: 'sub-5', question: '10 - 5 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: 'Half of 10' },
      { id: 'sub-6', question: '8 - 3 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: 'Count down from 8' },
      { id: 'sub-7', question: '7 - 2 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: 'Take 2 away' },
      { id: 'sub-8', question: '9 - 6 = ?', options: ['2', '3', '4', '5'], correct: '3', hint: 'What remains?' },
      { id: 'sub-9', question: '4 - 4 = ?', options: ['0', '1', '2', '3'], correct: '0', hint: 'Nothing left!' },
      { id: 'sub-10', question: '10 - 2 = ?', options: ['6', '7', '8', '9'], correct: '8', hint: 'Count back 2' },
    ],
  },
  multiplication: {
    title: 'Multiplication',
    questions: [
      { id: 'mult-1', question: '2 × 3 = ?', options: ['4', '5', '6', '7'], correct: '6', hint: '2 groups of 3' },
      { id: 'mult-2', question: '3 × 3 = ?', options: ['6', '7', '8', '9'], correct: '9', hint: '3 + 3 + 3' },
      { id: 'mult-3', question: '4 × 2 = ?', options: ['6', '7', '8', '9'], correct: '8', hint: 'Double 4' },
      { id: 'mult-4', question: '5 × 2 = ?', options: ['8', '9', '10', '11'], correct: '10', hint: 'Double 5' },
      { id: 'mult-5', question: '2 × 2 = ?', options: ['2', '3', '4', '5'], correct: '4', hint: '2 times 2' },
      { id: 'mult-6', question: '3 × 4 = ?', options: ['10', '11', '12', '13'], correct: '12', hint: '3 + 3 + 3 + 3' },
      { id: 'mult-7', question: '5 × 3 = ?', options: ['12', '13', '14', '15'], correct: '15', hint: '5 three times' },
      { id: 'mult-8', question: '2 × 5 = ?', options: ['8', '9', '10', '11'], correct: '10', hint: '2 groups of 5' },
      { id: 'mult-9', question: '4 × 3 = ?', options: ['10', '11', '12', '13'], correct: '12', hint: '4 + 4 + 4' },
      { id: 'mult-10', question: '6 × 2 = ?', options: ['10', '11', '12', '13'], correct: '12', hint: 'Double 6' },
    ],
  },
  division: {
    title: 'Division',
    questions: [
      { id: 'div-1', question: '6 ÷ 2 = ?', options: ['2', '3', '4', '5'], correct: '3', hint: 'Share 6 into 2 equal groups' },
      { id: 'div-2', question: '10 ÷ 2 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: 'Half of 10' },
      { id: 'div-3', question: '8 ÷ 4 = ?', options: ['1', '2', '3', '4'], correct: '2', hint: 'Share 8 into 4 groups' },
      { id: 'div-4', question: '9 ÷ 3 = ?', options: ['2', '3', '4', '5'], correct: '3', hint: '3 groups of what make 9?' },
      { id: 'div-5', question: '12 ÷ 2 = ?', options: ['5', '6', '7', '8'], correct: '6', hint: 'Half of 12' },
      { id: 'div-6', question: '6 ÷ 3 = ?', options: ['1', '2', '3', '4'], correct: '2', hint: 'Share 6 into 3 groups' },
      { id: 'div-7', question: '10 ÷ 5 = ?', options: ['1', '2', '3', '4'], correct: '2', hint: '5 groups of what make 10?' },
      { id: 'div-8', question: '12 ÷ 4 = ?', options: ['2', '3', '4', '5'], correct: '3', hint: 'Share 12 into 4 groups' },
      { id: 'div-9', question: '15 ÷ 3 = ?', options: ['4', '5', '6', '7'], correct: '5', hint: '3 groups of what make 15?' },
      { id: 'div-10', question: '8 ÷ 2 = ?', options: ['3', '4', '5', '6'], correct: '4', hint: 'Half of 8' },
    ],
  },
  fractions: {
    title: 'Fractions',
    questions: [
      { id: 'frac-1', question: 'What is half of 8?', image: '🍕', options: ['2', '3', '4', '5'], correct: '4', hint: 'Half means splitting into 2 equal parts' },
      { id: 'frac-2', question: 'What is half of 10?', image: '🍎', options: ['4', '5', '6', '7'], correct: '5', hint: 'Divide by 2' },
      { id: 'frac-3', question: 'What is a quarter of 8?', image: '🍫', options: ['1', '2', '3', '4'], correct: '2', hint: 'Split into 4 equal parts' },
      { id: 'frac-4', question: 'Which fraction means "one out of two equal parts"?', options: ['1/2', '1/3', '1/4', '2/2'], correct: '1/2', hint: 'This is called a half' },
      { id: 'frac-5', question: 'Which fraction means "one out of four equal parts"?', options: ['1/2', '1/3', '1/4', '4/4'], correct: '1/4', hint: 'This is called a quarter' },
      { id: 'frac-6', question: 'What is half of 6?', image: '🧁', options: ['2', '3', '4', '5'], correct: '3', hint: 'Divide 6 by 2' },
      { id: 'frac-7', question: 'What is a quarter of 12?', image: '🍊', options: ['2', '3', '4', '5'], correct: '3', hint: 'Divide 12 by 4' },
      { id: 'frac-8', question: 'If a pizza is cut into 4 equal slices, what is each slice called?', image: '🍕', options: ['A half', 'A third', 'A quarter', 'A whole'], correct: 'A quarter', hint: '4 equal parts' },
      { id: 'frac-9', question: 'What is half of 20?', options: ['8', '9', '10', '11'], correct: '10', hint: 'Divide by 2' },
      { id: 'frac-10', question: 'Which is bigger, 1/2 or 1/4?', options: ['1/2', '1/4', 'They are equal', 'Cannot tell'], correct: '1/2', hint: 'Fewer, bigger pieces mean a bigger fraction' },
    ],
  },
  money: {
    title: 'Money',
    questions: [
      { id: 'money-1', question: 'You have 2 coins of £1. How much do you have?', image: '💷', options: ['£1', '£2', '£3', '£4'], correct: '£2', hint: 'Add 1 + 1' },
      { id: 'money-2', question: 'You have 3 coins of 10p. How much do you have?', image: '🪙', options: ['20p', '30p', '40p', '50p'], correct: '30p', hint: 'Add 10 three times' },
      { id: 'money-3', question: 'A toy costs £5. You pay with a £10 note. How much change do you get?', image: '🧸', options: ['£3', '£4', '£5', '£6'], correct: '£5', hint: '10 - 5 = ?' },
      { id: 'money-4', question: 'How many 10p coins make £1?', image: '🪙', options: ['5', '8', '10', '12'], correct: '10', hint: '10 × 10p = 100p = £1' },
      { id: 'money-5', question: 'You have 5 coins of 20p. How much do you have?', options: ['£0.80', '£1.00', '£1.20', '£1.50'], correct: '£1.00', hint: '20p × 5' },
      { id: 'money-6', question: 'An apple costs 50p and a juice costs 30p. How much for both?', image: '🍎', options: ['70p', '75p', '80p', '90p'], correct: '80p', hint: '50 + 30' },
      { id: 'money-7', question: 'You have £3 and spend £1. How much is left?', options: ['£1', '£2', '£3', '£4'], correct: '£2', hint: '3 - 1 = ?' },
      { id: 'money-8', question: 'How many 5p coins make 20p?', options: ['2', '3', '4', '5'], correct: '4', hint: '4 × 5 = 20' },
      { id: 'money-9', question: 'A book costs £8 and a pen costs £2. How much altogether?', image: '📖', options: ['£8', '£9', '£10', '£11'], correct: '£10', hint: '8 + 2' },
      { id: 'money-10', question: 'You pay £2 for a snack that costs £1.50. How much change?', options: ['30p', '40p', '50p', '60p'], correct: '50p', hint: '£2.00 - £1.50' },
    ],
  },
  time: {
    title: 'Time',
    // Reordered so o'clock, half past, quarter past, and quarter to all
    // appear within the first few questions instead of half past/quarter
    // past/quarter to only showing up in the second half of the lesson -
    // makes the variety visible even if a learner doesn't finish all 10.
    questions: [
      { id: 'time-1', question: 'What time does the clock show?', clockTime: { hour: 3, minute: 0 }, options: ['3:00', '3:30', '9:00', '12:15'], correct: '3:00', hint: 'The hour hand points to 3 and the minute hand points straight up to 12 — that means o\u2019clock' },
      { id: 'time-3', question: 'What time does the clock show?', clockTime: { hour: 9, minute: 30 }, options: ['9:00', '9:30', '3:45', '10:30'], correct: '9:30', hint: 'The minute hand points to 6, which means half past' },
      { id: 'time-5', question: 'What time does the clock show?', clockTime: { hour: 4, minute: 15 }, options: ['4:00', '4:15', '4:45', '3:15'], correct: '4:15', hint: 'The minute hand points to the 3, which means quarter past' },
      { id: 'time-7', question: 'What time does the clock show?', clockTime: { hour: 5, minute: 45 }, options: ['5:45', '5:15', '6:00', '6:15'], correct: '5:45', hint: 'The minute hand points to the 9, which means quarter to the next hour' },
      { id: 'time-2', question: 'What time does the clock show?', clockTime: { hour: 6, minute: 0 }, options: ['6:00', '12:30', '6:30', '5:00'], correct: '6:00', hint: 'The minute hand is on the 12, so it is an exact hour' },
      { id: 'time-4', question: 'What time does the clock show?', clockTime: { hour: 12, minute: 30 }, options: ['12:00', '12:30', '6:30', '1:30'], correct: '12:30', hint: 'Half past means the minute hand is on the 6' },
      { id: 'time-6', question: 'What time does the clock show?', clockTime: { hour: 8, minute: 15 }, options: ['8:00', '8:15', '8:45', '7:15'], correct: '8:15', hint: 'Quarter past means 15 minutes have gone by' },
      { id: 'time-8', question: 'What time does the clock show?', clockTime: { hour: 10, minute: 45 }, options: ['10:45', '11:15', '10:15', '9:45'], correct: '10:45', hint: 'Quarter to 11 means 45 minutes past 10' },
      { id: 'time-9', question: 'What time does the clock show?', clockTime: { hour: 2, minute: 0 }, options: ['2:00', '2:30', '12:10', '10:00'], correct: '2:00', hint: 'Both hands help you tell the exact hour' },
      { id: 'time-10', question: 'What time does the clock show?', clockTime: { hour: 7, minute: 30 }, options: ['7:00', '7:30', '6:30', '8:30'], correct: '7:30', hint: 'Half past 7 is halfway between 7 and 8 o\u2019clock' },
    ],
  },
  shapes: {
    title: 'Shapes',
    // image values below are shape keywords (rendered as real drawn SVG
    // shapes by ShapeGlyph in math-lesson.tsx / game-math-sprint.tsx), not
    // emoji - the previous emoji were visually wrong for some shapes (the
    // rectangle question used a square icon, 🟦) and invisible on many
    // devices for others (pentagon/hexagon aren't real emoji).
    questions: [
      { id: 'shape-1', question: 'How many sides does a triangle have?', image: 'triangle', options: ['2', '3', '4', '5'], correct: '3', hint: 'Tri means three' },
      { id: 'shape-2', question: 'How many sides does a square have?', image: 'square', options: ['3', '4', '5', '6'], correct: '4', hint: 'All sides are equal' },
      { id: 'shape-3', question: 'How many corners does a rectangle have?', image: 'rectangle', options: ['2', '3', '4', '5'], correct: '4', hint: 'Count each corner' },
      { id: 'shape-4', question: 'Which shape has no corners at all?', image: 'circle', options: ['Circle', 'Square', 'Triangle', 'Rectangle'], correct: 'Circle', hint: 'It is perfectly round' },
      { id: 'shape-5', question: 'How many sides does a pentagon have?', image: 'pentagon', options: ['4', '5', '6', '7'], correct: '5', hint: 'Penta means five' },
      { id: 'shape-6', question: 'How many sides does a hexagon have?', image: 'hexagon', options: ['5', '6', '7', '8'], correct: '6', hint: 'Hexa means six' },
      { id: 'shape-7', question: 'Which of these is a 3D shape?', options: ['Cube', 'Circle', 'Triangle', 'Square'], correct: 'Cube', hint: 'It has depth, not just flat sides' },
      { id: 'shape-8', question: 'How many faces does a cube have?', image: 'cube', options: ['4', '5', '6', '7'], correct: '6', hint: 'Think of a dice' },
      { id: 'shape-9', question: 'Which shape is round like a ball?', image: 'sphere', options: ['Sphere', 'Cube', 'Cone', 'Cylinder'], correct: 'Sphere', hint: 'Perfectly round in 3D' },
      { id: 'shape-10', question: 'How many corners does a triangle have?', image: 'triangle', options: ['2', '3', '4', '5'], correct: '3', hint: 'Same number as its sides' },
    ],
  },
  measurements: {
    title: 'Measurements',
    questions: [
      { id: 'measure-1', question: 'Which is longer?', options: ['5 cm', '50 cm', 'They are equal', 'Cannot tell'], correct: '50 cm', hint: 'Bigger number of centimetres means longer' },
      { id: 'measure-2', question: 'How many centimetres are in 1 metre?', options: ['10', '100', '1000', '50'], correct: '100', hint: '1 m = 100 cm' },
      { id: 'measure-3', question: 'Which is heavier?', options: ['1 kg of feathers', '2 kg of feathers', 'They weigh the same', 'Cannot tell'], correct: '2 kg of feathers', hint: 'Compare the numbers of kilograms' },
      { id: 'measure-4', question: 'How many grams are in 1 kilogram?', options: ['10', '100', '1000', '10000'], correct: '1000', hint: '1 kg = 1000 g' },
      { id: 'measure-5', question: 'Which holds more liquid?', options: ['A cup', 'A bucket', 'They hold the same', 'Cannot tell'], correct: 'A bucket', hint: 'Think about the size of each container' },
      { id: 'measure-6', question: 'How many millilitres are in 1 litre?', options: ['10', '100', '1000', '10000'], correct: '1000', hint: '1 l = 1000 ml' },
      { id: 'measure-7', question: 'What tool would you use to measure how long a pencil is?', options: ['A ruler', 'A clock', 'A scale', 'A thermometer'], correct: 'A ruler', hint: 'It measures length' },
      { id: 'measure-8', question: 'What tool would you use to measure how heavy an apple is?', image: '🍎', options: ['A ruler', 'A clock', 'A scale', 'A thermometer'], correct: 'A scale', hint: 'It measures weight' },
      { id: 'measure-9', question: 'Which is shorter?', options: ['1 metre', '10 metres', 'They are equal', 'Cannot tell'], correct: '1 metre', hint: 'Smaller number means shorter' },
      { id: 'measure-10', question: 'What tool tells you how hot or cold it is?', options: ['A ruler', 'A scale', 'A thermometer', 'A clock'], correct: 'A thermometer', hint: 'It measures temperature' },
    ],
  },
  'word-problems': {
    title: 'Word Problems',
    questions: [
      { id: 'word-1', question: 'Sara has 4 apples. Her mum gives her 3 more. How many apples does Sara have now?', image: '🍎', options: ['5', '6', '7', '8'], correct: '7', hint: 'Add 4 + 3' },
      { id: 'word-2', question: 'There are 10 birds on a tree. 4 fly away. How many birds are left?', image: '🐦', options: ['4', '5', '6', '7'], correct: '6', hint: 'Take away 10 - 4' },
      { id: 'word-3', question: 'Tom has 2 bags with 5 marbles in each bag. How many marbles in total?', image: '🔵', options: ['7', '8', '9', '10'], correct: '10', hint: '2 groups of 5, or 2 × 5' },
      { id: 'word-4', question: 'A class has 12 pencils shared equally between 4 children. How many pencils does each child get?', image: '✏️', options: ['2', '3', '4', '5'], correct: '3', hint: 'Share 12 into 4 equal groups' },
      { id: 'word-5', question: 'Amina had £6. She spent £2 on a snack. How much money does she have left?', image: '💷', options: ['£2', '£3', '£4', '£5'], correct: '£4', hint: '6 - 2' },
      { id: 'word-6', question: 'There are 6 red balloons and 5 blue balloons. How many balloons altogether?', image: '🎈', options: ['9', '10', '11', '12'], correct: '11', hint: 'Add 6 + 5' },
      { id: 'word-7', question: 'A baker makes 20 cupcakes. He sells 12. How many cupcakes are left?', image: '🧁', options: ['6', '7', '8', '9'], correct: '8', hint: '20 - 12' },
      { id: 'word-8', question: 'Each spider has 8 legs. How many legs do 2 spiders have?', image: '🕷️', options: ['14', '15', '16', '17'], correct: '16', hint: '2 × 8' },
      { id: 'word-9', question: 'Layla read 5 pages on Monday and 6 pages on Tuesday. How many pages did she read in total?', image: '📖', options: ['9', '10', '11', '12'], correct: '11', hint: 'Add 5 + 6' },
      { id: 'word-10', question: 'There are 15 sweets shared equally between 5 friends. How many sweets does each friend get?', image: '🍬', options: ['2', '3', '4', '5'], correct: '3', hint: 'Share 15 into 5 equal groups' },
    ],
  },
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct: string;
  hint: string;
};

export type EnglishPassage = {
  id: string;
  title: string;
  content: string;
  questions: QuizQuestion[];
};

export const englishStories: EnglishPassage[] = [
  {
    id: 'story-1',
    title: 'The Brave Little Mouse',
    content: 'Once upon a time, there was a tiny mouse named Max. Max lived in a cozy hole under a big oak tree. One day, Max heard a loud roar! A lion was caught in a hunter\'s net. "Help me!" cried the lion. Max was scared, but he was also brave. He ran to the net and began to chew through the ropes with his sharp teeth. After working hard, Max freed the lion! "Thank you, little friend," said the lion. "You are small, but you have a big heart." From that day on, Max and the lion were the best of friends.',
    questions: [
      { id: 'story-1-q1', question: 'What was the mouse\'s name?', options: ['Max', 'Sam', 'Leo', 'Tim'], correct: 'Max', hint: 'It starts with M' },
      { id: 'story-1-q2', question: 'Where did Max live?', options: ['In a tree', 'Under a tree', 'In a cave', 'In a house'], correct: 'Under a tree', hint: 'Think about the oak tree' },
      { id: 'story-1-q3', question: 'Who was caught in the net?', options: ['The mouse', 'The lion', 'A bird', 'A hunter'], correct: 'The lion', hint: 'Who roared?' },
      { id: 'story-1-q4', question: 'How did Max help?', options: ['He called for help', 'He chewed the ropes', 'He pulled the net', 'He ran away'], correct: 'He chewed the ropes', hint: 'He used his teeth' },
      { id: 'story-1-q5', question: 'What did the lion say about Max?', options: ['He is small but brave', 'He has a big heart', 'He is fast', 'He is strong'], correct: 'He has a big heart', hint: 'About his heart' },
    ],
  },
  {
    id: 'story-2',
    title: 'Luna\'s Magic Garden',
    content: 'Luna loved flowers more than anything. Every morning, she would water her garden and sing to the plants. One magical morning, something wonderful happened! The flowers began to sing back! Red roses hummed, yellow sunflowers whistled, and purple violets chimed like bells. "This is amazing!" Luna laughed with joy. A wise old daisy spoke up: "Luna, your kindness made us bloom. When you care for others, magic happens." Luna learned that love and care can create the most beautiful things.',
    questions: [
      { id: 'story-2-q1', question: 'What did Luna love?', options: ['Animals', 'Flowers', 'Books', 'Music'], correct: 'Flowers', hint: 'What was in her garden?' },
      { id: 'story-2-q2', question: 'What did Luna do every morning?', options: ['Sleep late', 'Water her garden', 'Go to school', 'Play games'], correct: 'Water her garden', hint: 'She took care of plants' },
      { id: 'story-2-q3', question: 'What magical thing happened?', options: ['Flowers grew taller', 'Flowers sang', 'Flowers danced', 'Flowers changed colors'], correct: 'Flowers sang', hint: 'They made music!' },
      { id: 'story-2-q4', question: 'What color were the roses?', options: ['Yellow', 'Purple', 'Red', 'White'], correct: 'Red', hint: 'Roses that hummed' },
      { id: 'story-2-q5', question: 'What did the daisy teach Luna?', options: ['Magic is real', 'Kindness creates magic', 'Flowers can talk', 'Gardens are fun'], correct: 'Kindness creates magic', hint: 'About caring for others' },
    ],
  },
  {
    id: 'story-3',
    title: 'The Rainbow Bridge',
    content: 'In a land where the sky touched the ground, there lived two villages. The Sun Village was always warm and bright. The Moon Village was cool and peaceful. But they were separated by a wide river. The villagers wanted to be friends, but no one could cross. Then, after a big storm, something beautiful appeared—a brilliant rainbow stretched across the river like a bridge! The children from both villages ran across the rainbow, laughing and holding hands. From that day on, whenever it rained and the sun came out, the rainbow bridge would appear, reminding everyone that differences can bring us together.',
    questions: [
      { id: 'story-3-q1', question: 'What separated the two villages?', options: ['A mountain', 'A river', 'A forest', 'A desert'], correct: 'A river', hint: 'Water divided them' },
      { id: 'story-3-q2', question: 'What was the Sun Village like?', options: ['Dark and cold', 'Warm and bright', 'Rainy', 'Snowy'], correct: 'Warm and bright', hint: 'Like the sun!' },
      { id: 'story-3-q3', question: 'What appeared after the storm?', options: ['A boat', 'A rainbow', 'A ladder', 'A road'], correct: 'A rainbow', hint: 'Something colorful' },
      { id: 'story-3-q4', question: 'Who crossed the rainbow first?', options: ['The adults', 'The children', 'The animals', 'No one'], correct: 'The children', hint: 'The young ones' },
      { id: 'story-3-q5', question: 'What does the rainbow teach us?', options: ['Storms are scary', 'Rainbows are pretty', 'Differences bring us together', 'Villages are fun'], correct: 'Differences bring us together', hint: 'About being different' },
    ],
  },
];

export const readingPassages: EnglishPassage[] = [
  {
    id: 'reading-1',
    title: 'The Kind Fox',
    content: 'A little fox named Ruby lived at the edge of a forest. One cold morning, she found a rabbit shivering under a bush. Ruby did not eat the rabbit, even though she was hungry. Instead, she led the rabbit to a warm den and shared her food. The rabbit was surprised. "Why are you helping me?" asked the rabbit. Ruby smiled and said, "Because being kind feels better than being full." From then on, the fox and the rabbit were the best of friends.',
    questions: [
      { id: 'read-1-q1', question: 'What is the fox\'s name?', options: ['Ruby', 'Rosie', 'Rex', 'Rusty'], correct: 'Ruby', hint: 'It starts with R' },
      { id: 'read-1-q2', question: 'Who did Ruby find under a bush?', options: ['A bird', 'A rabbit', 'A mouse', 'A squirrel'], correct: 'A rabbit', hint: 'It was shivering with cold' },
      { id: 'read-1-q3', question: 'What did Ruby do instead of eating the rabbit?', options: ['Ran away', 'Shared her food', 'Called for help', 'Went to sleep'], correct: 'Shared her food', hint: 'She was kind' },
      { id: 'read-1-q4', question: 'How did the rabbit feel about Ruby helping?', options: ['Angry', 'Surprised', 'Bored', 'Scared'], correct: 'Surprised', hint: 'The rabbit did not expect it' },
      { id: 'read-1-q5', question: 'What lesson does this story teach?', options: ['Foxes are dangerous', 'Kindness feels good', 'Rabbits are fast', 'Winter is cold'], correct: 'Kindness feels good', hint: 'Think about what Ruby said' },
    ],
  },
  {
    id: 'reading-2',
    title: 'A Trip to the Farm',
    content: 'On Saturday, Ben and his class visited a farm. They saw fluffy sheep, brown cows, and clucking chickens. The farmer showed them how to collect eggs from the henhouse. Ben was nervous at first, but the hens were gentle and friendly. Later, everyone got to feed the goats with handfuls of hay. Ben\'s favorite part was riding on the tractor around the big green field. On the bus ride home, Ben told his friend it was the best school trip ever.',
    questions: [
      { id: 'read-2-q1', question: 'What day did the class visit the farm?', options: ['Friday', 'Saturday', 'Sunday', 'Monday'], correct: 'Saturday', hint: 'It is in the first sentence' },
      { id: 'read-2-q2', question: 'Where did they collect eggs from?', options: ['A basket', 'A henhouse', 'A barn', 'A truck'], correct: 'A henhouse', hint: 'Where chickens live' },
      { id: 'read-2-q3', question: 'What did they feed the goats?', options: ['Corn', 'Hay', 'Apples', 'Bread'], correct: 'Hay', hint: 'Handfuls of it' },
      { id: 'read-2-q4', question: 'What was Ben\'s favorite part?', options: ['Feeding goats', 'Collecting eggs', 'Riding the tractor', 'Seeing sheep'], correct: 'Riding the tractor', hint: 'Around the big green field' },
      { id: 'read-2-q5', question: 'How did Ben feel about the trip?', options: ['It was boring', 'It was the best ever', 'It was scary', 'It was too long'], correct: 'It was the best ever', hint: 'What he told his friend' },
    ],
  },
  {
    id: 'reading-3',
    title: 'The Lost Kite',
    content: 'Mia flew her red kite at the park every weekend. One windy day, the string snapped and the kite sailed away over the trees! Mia felt sad, but her dad said, "Let\'s go find it together." They followed the direction of the wind and searched the park. After a while, they spotted the kite stuck in a tall tree near the pond. A kind jogger helped them reach it with a long stick. Mia was overjoyed to have her kite back, and she held the string extra tight the rest of the afternoon.',
    questions: [
      { id: 'read-3-q1', question: 'What color was Mia\'s kite?', options: ['Blue', 'Red', 'Yellow', 'Green'], correct: 'Red', hint: 'Mentioned in the first sentence' },
      { id: 'read-3-q2', question: 'Why did the kite fly away?', options: ['Mia let go', 'The string snapped', 'A bird took it', 'It rained'], correct: 'The string snapped', hint: 'It was a windy day' },
      { id: 'read-3-q3', question: 'Where did they find the kite?', options: ['In a tree', 'In the pond', 'On the road', 'Under a bench'], correct: 'In a tree', hint: 'Near the pond' },
      { id: 'read-3-q4', question: 'Who helped them get the kite down?', options: ['A police officer', 'A jogger', 'A teacher', 'Mia\'s mom'], correct: 'A jogger', hint: 'Someone running by helped' },
      { id: 'read-3-q5', question: 'What did Mia do differently afterward?', options: ['Stopped flying kites', 'Held the string extra tight', 'Bought a new kite', 'Went home early'], correct: 'Held the string extra tight', hint: 'She learned from what happened' },
    ],
  },
];

export const comprehensionPassages: EnglishPassage[] = [
  {
    id: 'comp-1',
    title: 'Why Bees Matter',
    content: 'Bees are small, but they do a big job. When a bee visits a flower to drink its nectar, tiny grains of pollen stick to its fuzzy legs. As the bee flies to the next flower, some of that pollen rubs off. This is called pollination, and it helps plants grow fruits, vegetables, and seeds. Without bees, many of the foods we eat — like apples, strawberries, and almonds — would become very rare. That is why scientists work hard to protect bees and keep them healthy.',
    questions: [
      { id: 'comp-1-q1', question: 'What sticks to a bee\'s legs when it visits a flower?', options: ['Water', 'Pollen', 'Leaves', 'Dirt'], correct: 'Pollen', hint: 'Tiny grains from the flower' },
      { id: 'comp-1-q2', question: 'What is the process called when pollen moves between flowers?', options: ['Photosynthesis', 'Pollination', 'Germination', 'Evaporation'], correct: 'Pollination', hint: 'It shares its name with pollen' },
      { id: 'comp-1-q3', question: 'What does pollination help plants do?', options: ['Grow fruits and seeds', 'Change color', 'Grow taller', 'Make more leaves'], correct: 'Grow fruits and seeds', hint: 'Think of apples and strawberries' },
      { id: 'comp-1-q4', question: 'What would happen without bees, based on the passage?', options: ['Nothing would change', 'Many foods would become rare', 'Flowers would disappear', 'Animals would grow bigger'], correct: 'Many foods would become rare', hint: 'Think about apples and almonds' },
      { id: 'comp-1-q5', question: 'Why do scientists protect bees?', options: ['Bees are dangerous', 'Bees help grow the food we eat', 'Bees make honey only', 'Bees are pets'], correct: 'Bees help grow the food we eat', hint: 'Connect it to pollination' },
    ],
  },
  {
    id: 'comp-2',
    title: 'The Recycling Robot',
    content: 'At Greenfield School, a robot named Sorty helps students recycle. When someone brings rubbish to Sorty, it uses a camera to look at the item and a mechanical arm to sort it into the right bin — paper, plastic, or food waste. Sorty was built by a group of older students for a science project. Since Sorty arrived, the school has recycled twice as much as before, and much less rubbish ends up in the wrong bin. The head teacher says Sorty has taught everyone that small actions, done correctly, can make a big difference.',
    questions: [
      { id: 'comp-2-q1', question: 'What is the robot\'s name?', options: ['Sorty', 'Robbie', 'Bin-Bot', 'Greeny'], correct: 'Sorty', hint: 'Related to what it does — sorting' },
      { id: 'comp-2-q2', question: 'How does Sorty decide which bin to use?', options: ['It guesses randomly', 'It uses a camera to look at the item', 'A teacher tells it', 'It weighs the item'], correct: 'It uses a camera to look at the item', hint: 'Mentioned alongside the mechanical arm' },
      { id: 'comp-2-q3', question: 'Who built Sorty?', options: ['Teachers', 'A company', 'Older students', 'Parents'], correct: 'Older students', hint: 'For a science project' },
      { id: 'comp-2-q4', question: 'What happened to recycling after Sorty arrived?', options: ['It stayed the same', 'It doubled', 'It stopped', 'It became messier'], correct: 'It doubled', hint: '"twice as much as before"' },
      { id: 'comp-2-q5', question: 'What lesson does the head teacher mention?', options: ['Robots are expensive', 'Small correct actions can make a big difference', 'Recycling is difficult', 'Science projects take a long time'], correct: 'Small correct actions can make a big difference', hint: 'The last sentence of the passage' },
    ],
  },
  {
    id: 'comp-3',
    title: 'Grandma\'s Garden',
    content: 'Every summer, Priya visits her grandmother, who grows vegetables in a small garden behind her house. This year, Grandma taught Priya how to plant tomato seeds, water them gently every morning, and pull out weeds that steal their sunlight. At first, Priya found the work slow and a little boring. But after a few weeks, tiny green tomatoes began to appear on the vines. Priya checked on them every single day, amazed that something so small could grow into food. By the end of summer, she picked the first ripe tomato herself and proudly made a salad for the whole family.',
    questions: [
      { id: 'comp-3-q1', question: 'Whose garden does Priya visit?', options: ['Her mother\'s', 'Her grandmother\'s', 'Her teacher\'s', 'Her neighbor\'s'], correct: 'Her grandmother\'s', hint: 'Look at the title' },
      { id: 'comp-3-q2', question: 'Why does Grandma pull out weeds?', options: ['They look messy', 'They steal sunlight from the plants', 'They attract bugs', 'They are poisonous'], correct: 'They steal sunlight from the plants', hint: 'Directly stated in the passage' },
      { id: 'comp-3-q3', question: 'How did Priya feel about the work at first?', options: ['Excited', 'Slow and a little boring', 'Frightened', 'Angry'], correct: 'Slow and a little boring', hint: 'Read the third sentence' },
      { id: 'comp-3-q4', question: 'What changed Priya\'s feelings about the garden?', options: ['She got a prize', 'Tiny tomatoes began to appear', 'Grandma stopped teaching her', 'She went home early'], correct: 'Tiny tomatoes began to appear', hint: 'Watching them grow amazed her' },
      { id: 'comp-3-q5', question: 'What did Priya do with the first ripe tomato?', options: ['Gave it away', 'Made a salad for the family', 'Sold it', 'Planted it again'], correct: 'Made a salad for the family', hint: 'The last sentence' },
    ],
  },
];

export const englishQuizzes: Record<string, { title: string; questions: QuizQuestion[] }> = {
  vocabulary: {
    title: 'Vocabulary',
    questions: [
      { id: 'vocab-1', question: 'What does "enormous" mean?', options: ['Tiny', 'Huge', 'Soft', 'Loud'], correct: 'Huge', hint: 'Think of something very, very big' },
      { id: 'vocab-2', question: 'What does "delighted" mean?', options: ['Very happy', 'Very tired', 'Very angry', 'Very cold'], correct: 'Very happy', hint: 'A strong positive feeling' },
      { id: 'vocab-3', question: 'Which word means the same as "quick"?', options: ['Slow', 'Fast', 'Heavy', 'Quiet'], correct: 'Fast', hint: 'The opposite of slow' },
      { id: 'vocab-4', question: 'What is the opposite of "brave"?', options: ['Fearful', 'Strong', 'Kind', 'Tall'], correct: 'Fearful', hint: 'Think of the opposite of courage' },
      { id: 'vocab-5', question: 'What does "ancient" mean?', options: ['Very new', 'Very old', 'Very small', 'Very fast'], correct: 'Very old', hint: 'Like something from long, long ago' },
      { id: 'vocab-6', question: 'Which word means "to look at something closely"?', options: ['Examine', 'Ignore', 'Forget', 'Whisper'], correct: 'Examine', hint: 'Detectives do this' },
      { id: 'vocab-7', question: 'What does "furious" mean?', options: ['Very calm', 'Very angry', 'Very sleepy', 'Very shy'], correct: 'Very angry', hint: 'A strong negative feeling' },
      { id: 'vocab-8', question: 'What is a synonym for "begin"?', options: ['End', 'Start', 'Stop', 'Pause'], correct: 'Start', hint: 'The opposite of finish' },
      { id: 'vocab-9', question: 'What does "cautious" mean?', options: ['Careless', 'Careful', 'Curious', 'Confused'], correct: 'Careful', hint: 'Being careful about danger' },
      { id: 'vocab-10', question: 'What does "assist" mean?', options: ['To help', 'To hide', 'To leave', 'To break'], correct: 'To help', hint: 'A synonym for helping someone' },
    ],
  },
  grammar: {
    title: 'Grammar',
    questions: [
      { id: 'gram-1', question: 'Which word is a noun in this sentence: "The dog ran quickly"?', options: ['The', 'dog', 'ran', 'quickly'], correct: 'dog', hint: 'A noun names a person, place, or thing' },
      { id: 'gram-2', question: 'Which word is a verb in this sentence: "Sara sings beautifully"?', options: ['Sara', 'sings', 'beautifully', 'the'], correct: 'sings', hint: 'A verb is an action word' },
      { id: 'gram-3', question: 'Which sentence uses correct punctuation?', options: ['what is your name', 'What is your name?', 'What is your name!', 'what is your name.'], correct: 'What is your name?', hint: 'Questions need a capital letter and a question mark' },
      { id: 'gram-4', question: 'What is the plural of "child"?', options: ['Childs', 'Childes', 'Children', 'Child\'s'], correct: 'Children', hint: 'This one is irregular' },
      { id: 'gram-5', question: 'Which word is an adjective in "the tall tree"?', options: ['the', 'tall', 'tree', 'None'], correct: 'tall', hint: 'An adjective describes a noun' },
      { id: 'gram-6', question: 'Which sentence is in the past tense?', options: ['She walks to school', 'She will walk to school', 'She walked to school', 'She is walking to school'], correct: 'She walked to school', hint: 'Look for the "-ed" ending' },
      { id: 'gram-7', question: 'What is the plural of "box"?', options: ['Boxs', 'Boxes', 'Boxies', 'Box'], correct: 'Boxes', hint: 'Words ending in x usually add "es"' },
      { id: 'gram-8', question: 'Which word correctly completes: "___ dog is barking"?', options: ['A', 'An', 'The', 'the'], correct: 'The', hint: 'It needs a capital letter to start the sentence' },
      { id: 'gram-9', question: 'Which is a complete sentence?', options: ['Running fast today', 'The boy ran fast', 'Fast the boy', 'Ran the fast'], correct: 'The boy ran fast', hint: 'It needs a subject and a verb in the right order' },
      { id: 'gram-10', question: 'Which word is a pronoun in "She likes ice cream"?', options: ['She', 'likes', 'ice', 'cream'], correct: 'She', hint: 'A pronoun replaces a name' },
    ],
  },
  'sentence-building': {
    title: 'Sentence Building',
    questions: [
      { id: 'sent-1', question: 'Which is a correctly ordered sentence?', options: ['Ball the kicked boy', 'The boy kicked the ball', 'Kicked ball the boy', 'The kicked boy ball'], correct: 'The boy kicked the ball', hint: 'Subject, then verb, then object' },
      { id: 'sent-2', question: 'Which sentence makes sense?', options: ['Sun the is bright', 'Bright is the sun', 'The sun is bright', 'Is bright the sun'], correct: 'The sun is bright', hint: 'Start with "The"' },
      { id: 'sent-3', question: 'Which is the correct word order?', options: ['Cat sleeping is the', 'The cat is sleeping', 'Is the cat sleeping the', 'Sleeping the cat is'], correct: 'The cat is sleeping', hint: 'Subject, then verb' },
      { id: 'sent-4', question: 'Choose the sentence with correct order:', options: ['Happily played children the', 'The children played happily', 'Played the happily children', 'Children happily the played'], correct: 'The children played happily', hint: 'Adverbs usually come after the verb' },
      { id: 'sent-5', question: 'Which sentence is correctly ordered?', options: ['I to school walk', 'To school I walk', 'I walk to school', 'Walk I to school'], correct: 'I walk to school', hint: 'Subject, verb, then place' },
      { id: 'sent-6', question: 'Pick the properly ordered sentence:', options: ['Reading a book she is', 'She is reading a book', 'Book a reading is she', 'Is she a book reading'], correct: 'She is reading a book', hint: 'Subject, then "is", then the action' },
      { id: 'sent-7', question: 'Which sentence is correct?', options: ['My friend is my best', 'My best friend is', 'My friend my best is', 'Best my friend is'], correct: 'My best friend is', hint: 'Adjective comes before the noun it describes' },
      { id: 'sent-8', question: 'Choose the correctly ordered sentence:', options: ['We tomorrow the beach to are going', 'We are going to the beach tomorrow', 'Tomorrow beach the to going are we', 'Going we are tomorrow the beach to'], correct: 'We are going to the beach tomorrow', hint: 'Time words usually come at the end' },
      { id: 'sent-9', question: 'Which word order is correct?', options: ['Loudly the dog barked', 'The dog barked loudly', 'Barked loudly the dog', 'Dog the barked loudly'], correct: 'The dog barked loudly', hint: 'Subject, verb, then how' },
      { id: 'sent-10', question: 'Which sentence is complete and correct?', options: ['Under the table the cat', 'The cat is under the table', 'Table the under is cat', 'Is under cat the table'], correct: 'The cat is under the table', hint: 'It needs a subject and a verb' },
    ],
  },
};

export type PhonicsSound = {
  id: string;
  sound: string;
  example: string;
  pronunciation: string;
};

/**
 * One quick multiple-choice check per sound: which word actually contains it.
 * Used by the "Take Quiz" button on the phonics lesson screen.
 */
function buildPhonicsQuiz(sounds: PhonicsSound[]): QuizQuestion[] {
  return sounds.map((sound, index) => {
    // Pick 3 wrong-but-plausible example words from other sounds in the same list.
    const distractors = sounds
      .filter((_, i) => i !== index)
      .map((s) => s.example);
    const wrongOptions = [distractors[index % distractors.length], distractors[(index + 1) % distractors.length], distractors[(index + 2) % distractors.length]];
    const options = [sound.example, ...wrongOptions].sort(() => 0.5 - ((index * 37) % 100) / 100);
    return {
      id: `${sound.id}-quiz`,
      question: `Which word has the "${sound.sound}" sound?`,
      options,
      correct: sound.example,
      hint: `Say the words out loud and listen for "${sound.sound}"`,
    };
  });
}

export const phonicsSounds = {
  doubleVowels: [
    { id: 'ai', sound: 'ai', example: 'rain', pronunciation: 'Long A sound' },
    { id: 'ay', sound: 'ay', example: 'play', pronunciation: 'Long A sound' },
    { id: 'ee', sound: 'ee', example: 'tree', pronunciation: 'Long E sound' },
    { id: 'ea', sound: 'ea', example: 'beach', pronunciation: 'Long E sound' },
    { id: 'oa', sound: 'oa', example: 'boat', pronunciation: 'Long O sound' },
    { id: 'oo', sound: 'oo', example: 'moon', pronunciation: 'Long OO sound' },
    { id: 'oi', sound: 'oi', example: 'coin', pronunciation: 'OI sound' },
    { id: 'oy', sound: 'oy', example: 'toy', pronunciation: 'OY sound' },
    { id: 'ie', sound: 'ie', example: 'pie', pronunciation: 'Long I sound' },
    { id: 'ue', sound: 'ue', example: 'blue', pronunciation: 'Long U sound' },
  ],
  doubleConsonants: [
    { id: 'll', sound: 'll', example: 'bell', pronunciation: 'L sound' },
    { id: 'ss', sound: 'ss', example: 'grass', pronunciation: 'S sound' },
    { id: 'ff', sound: 'ff', example: 'cliff', pronunciation: 'F sound' },
    { id: 'tt', sound: 'tt', example: 'butter', pronunciation: 'T sound' },
    { id: 'pp', sound: 'pp', example: 'happy', pronunciation: 'P sound' },
    { id: 'nn', sound: 'nn', example: 'funny', pronunciation: 'N sound' },
    { id: 'rr', sound: 'rr', example: 'mirror', pronunciation: 'R sound' },
    { id: 'bb', sound: 'bb', example: 'rabbit', pronunciation: 'B sound' },
    { id: 'dd', sound: 'dd', example: 'ladder', pronunciation: 'D sound' },
    { id: 'mm', sound: 'mm', example: 'hammer', pronunciation: 'M sound' },
  ],
  digraphs: [
    { id: 'ch', sound: 'ch', example: 'chair', pronunciation: 'CH sound' },
    { id: 'sh', sound: 'sh', example: 'ship', pronunciation: 'SH sound' },
    { id: 'th', sound: 'th', example: 'thumb', pronunciation: 'TH sound' },
    { id: 'wh', sound: 'wh', example: 'whale', pronunciation: 'WH sound' },
    { id: 'ph', sound: 'ph', example: 'phone', pronunciation: 'F sound' },
    { id: 'ck', sound: 'ck', example: 'duck', pronunciation: 'K sound' },
    { id: 'ng', sound: 'ng', example: 'ring', pronunciation: 'NG sound' },
    { id: 'nk', sound: 'nk', example: 'think', pronunciation: 'NK sound' },
    { id: 'qu', sound: 'qu', example: 'queen', pronunciation: 'KW sound' },
  ],
};

export const phonicsQuizzes: Record<string, QuizQuestion[]> = {
  doubleVowels: buildPhonicsQuiz(phonicsSounds.doubleVowels),
  doubleConsonants: buildPhonicsQuiz(phonicsSounds.doubleConsonants),
  digraphs: buildPhonicsQuiz(phonicsSounds.digraphs),
};
