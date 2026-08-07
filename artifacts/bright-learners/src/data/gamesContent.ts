import type { QuizQuestion } from './lessonContent';

// ---------------------------------------------------------------------------
// Word Builder & Sentence Builder: tap scrambled tokens (letters or words)
// in the right order to build the target.
// ---------------------------------------------------------------------------
export type OrderBuilderItem = {
  id: string;
  /** The tokens in their correct order — letters for Word Builder, words for Sentence Builder */
  tokens: string[];
  /** Optional hint / clue shown above the tiles */
  clue: string;
};

export const wordBuilderItems: OrderBuilderItem[] = [
  { id: 'wb-1', tokens: ['C', 'A', 'T'], clue: 'A furry pet that says "meow"' },
  { id: 'wb-2', tokens: ['D', 'O', 'G'], clue: 'A loyal pet that barks' },
  { id: 'wb-3', tokens: ['S', 'U', 'N'], clue: 'It shines in the sky in the daytime' },
  { id: 'wb-4', tokens: ['F', 'I', 'S', 'H'], clue: 'It swims in water' },
  { id: 'wb-5', tokens: ['B', 'I', 'R', 'D'], clue: 'It has feathers and can fly' },
  { id: 'wb-6', tokens: ['S', 'T', 'A', 'R'], clue: 'You can see it twinkle at night' },
  { id: 'wb-7', tokens: ['T', 'R', 'E', 'E'], clue: 'It grows tall with leaves and branches' },
  { id: 'wb-8', tokens: ['B', 'O', 'O', 'K'], clue: 'You read this' },
  { id: 'wb-9', tokens: ['M', 'O', 'O', 'N'], clue: 'It shines in the sky at night' },
  { id: 'wb-10', tokens: ['F', 'R', 'O', 'G'], clue: 'It hops and says "ribbit"' },
];

export const sentenceBuilderItems: OrderBuilderItem[] = [
  { id: 'sb-1', tokens: ['The', 'cat', 'is', 'sleeping'], clue: 'Build a sentence about a sleepy cat' },
  { id: 'sb-2', tokens: ['I', 'like', 'to', 'read', 'books'], clue: 'Build a sentence about reading' },
  { id: 'sb-3', tokens: ['She', 'plays', 'in', 'the', 'park'], clue: 'Build a sentence about playing outside' },
  { id: 'sb-4', tokens: ['We', 'are', 'going', 'to', 'school'], clue: 'Build a sentence about school' },
  { id: 'sb-5', tokens: ['The', 'sun', 'is', 'very', 'bright'], clue: 'Build a sentence about the sun' },
  { id: 'sb-6', tokens: ['My', 'dog', 'loves', 'to', 'run'], clue: 'Build a sentence about a dog' },
  { id: 'sb-7', tokens: ['They', 'ate', 'lunch', 'together'], clue: 'Build a sentence about eating lunch' },
  { id: 'sb-8', tokens: ['He', 'can', 'ride', 'a', 'bike'], clue: 'Build a sentence about riding a bike' },
  { id: 'sb-9', tokens: ['Birds', 'fly', 'in', 'the', 'sky'], clue: 'Build a sentence about birds' },
  { id: 'sb-10', tokens: ['We', 'had', 'fun', 'at', 'the', 'beach'], clue: 'Build a sentence about the beach' },
];

// ---------------------------------------------------------------------------
// Balloon Pop, Treasure Hunt, Picture Puzzle, Number Puzzle: all reuse the
// same timed multiple-choice engine with different flavor/content.
// Shape Match reuses it too, built from the math "shapes" topic elsewhere.
// ---------------------------------------------------------------------------
export const balloonPopQuestions: QuizQuestion[] = [
  { id: 'balloon-1', question: 'Which balloon shows an even number?', options: ['3', '4', '7', '9'], correct: '4', hint: 'Even numbers can be split into two equal groups' },
  { id: 'balloon-2', question: 'Which of these is a color?', options: ['Jump', 'Red', 'Table', 'Run'], correct: 'Red', hint: 'Think of the colors of the rainbow' },
  { id: 'balloon-3', question: 'Which balloon shows the biggest number?', options: ['12', '21', '8', '15'], correct: '21', hint: 'Compare the tens digit first' },
  { id: 'balloon-4', question: 'Which of these is an animal?', options: ['Chair', 'Lion', 'Spoon', 'Cloud'], correct: 'Lion', hint: 'It roars!' },
  { id: 'balloon-5', question: 'Which balloon shows an odd number?', options: ['6', '10', '5', '8'], correct: '5', hint: 'Odd numbers cannot be split evenly' },
  { id: 'balloon-6', question: 'Which of these is a fruit?', options: ['Carrot', 'Apple', 'Potato', 'Bread'], correct: 'Apple', hint: 'It grows on trees and can be red or green' },
  { id: 'balloon-7', question: 'Which balloon shows the smallest number?', options: ['30', '13', '3', '31'], correct: '3', hint: 'Look at how many digits each number has' },
  { id: 'balloon-8', question: 'Which of these is a shape?', options: ['Circle', 'Jump', 'Blue', 'Happy'], correct: 'Circle', hint: 'It is perfectly round' },
  { id: 'balloon-9', question: 'What comes after 7?', options: ['6', '9', '8', '10'], correct: '8', hint: 'Count up by one' },
  { id: 'balloon-10', question: 'Which of these is a season?', options: ['Summer', 'Monday', 'Green', 'Square'], correct: 'Summer', hint: 'It is the hottest time of year' },
];

export const treasureHuntQuestions: QuizQuestion[] = [
  { id: 'treasure-1', question: 'Which chest holds the answer to 5 + 5?', options: ['8', '9', '10', '11'], correct: '10', hint: 'Double 5' },
  { id: 'treasure-2', question: 'Which chest holds a capital city?', options: ['London', 'Banana', 'Purple', 'Jumping'], correct: 'London', hint: 'It is the capital of England' },
  { id: 'treasure-3', question: 'Which chest holds the answer to 3 × 3?', options: ['6', '9', '12', '3'], correct: '9', hint: '3 groups of 3' },
  { id: 'treasure-4', question: 'Which chest holds a planet?', options: ['Mars', 'Table', 'Circle', 'Purple'], correct: 'Mars', hint: 'It is known as the Red Planet' },
  { id: 'treasure-5', question: 'Which chest holds the answer to 10 - 4?', options: ['5', '6', '7', '4'], correct: '6', hint: 'Count backward from 10' },
  { id: 'treasure-6', question: 'Which chest holds an ocean animal?', options: ['Dolphin', 'Chair', 'Book', 'Cloud'], correct: 'Dolphin', hint: 'It lives in the sea and is very smart' },
  { id: 'treasure-7', question: 'Which chest holds the answer to 2 × 6?', options: ['10', '12', '8', '14'], correct: '12', hint: '2 groups of 6' },
  { id: 'treasure-8', question: 'Which chest holds a musical instrument?', options: ['Piano', 'Window', 'Cloud', 'Spoon'], correct: 'Piano', hint: 'It has black and white keys' },
  { id: 'treasure-9', question: 'Which chest holds the answer to 9 - 3?', options: ['5', '6', '7', '4'], correct: '6', hint: 'Count backward from 9' },
  { id: 'treasure-10', question: 'Which chest holds a body of water bigger than a lake?', options: ['Ocean', 'Puddle', 'Cup', 'Bottle'], correct: 'Ocean', hint: 'The biggest body of water on Earth' },
];

export const numberPuzzleQuestions: QuizQuestion[] = [
  { id: 'num-1', question: 'I am a number between 10 and 20. I am even. I am also a multiple of 4. What number am I?', options: ['12', '13', '15', '18'], correct: '12', hint: 'Multiples of 4: 4, 8, 12, 16...' },
  { id: 'num-2', question: 'I am a number less than 10. If you double me, you get 8. What number am I?', options: ['2', '4', '6', '8'], correct: '4', hint: 'Half of 8' },
  { id: 'num-3', question: 'I am an odd number between 20 and 30. My digits add up to 5. What number am I?', options: ['21', '23', '25', '27'], correct: '23', hint: '2 + 3 = 5' },
  { id: 'num-4', question: 'I am a number. If you add 7 to me, you get 15. What number am I?', options: ['7', '8', '9', '22'], correct: '8', hint: '15 - 7' },
  { id: 'num-5', question: 'I am a number between 1 and 10. I am the only even prime number. What number am I?', options: ['1', '2', '4', '9'], correct: '2', hint: 'A prime number has only two factors: 1 and itself' },
  { id: 'num-6', question: 'I am a two-digit number. My tens digit is 3 and my ones digit is double my tens digit. What number am I?', options: ['32', '33', '34', '36'], correct: '36', hint: 'Double of 3 is 6' },
  { id: 'num-7', question: 'I am a number. Half of me is 9. What number am I?', options: ['9', '18', '20', '27'], correct: '18', hint: 'Double 9' },
  { id: 'num-8', question: 'I am the smallest number you can make with the digits 4, 1, and 7. What number am I?', options: ['147', '174', '417', '741'], correct: '147', hint: 'Put the smallest digit first' },
  { id: 'num-9', question: 'I am a number between 40 and 50. I am a multiple of 9. What number am I?', options: ['42', '45', '48', '49'], correct: '45', hint: 'Multiples of 9: 36, 45, 54...' },
  { id: 'num-10', question: 'I am a number. Three times me is 21. What number am I?', options: ['6', '7', '8', '9'], correct: '7', hint: '21 ÷ 3' },
];

export const pictureRevealQuestions: QuizQuestion[] = [
  { id: 'pic-1', question: 'What sound does a cow make?', options: ['Moo', 'Woof', 'Meow', 'Oink'], correct: 'Moo', hint: 'Think of a farm animal that gives milk' },
  { id: 'pic-2', question: 'What do bees make?', options: ['Milk', 'Honey', 'Butter', 'Silk'], correct: 'Honey', hint: 'It is sweet and golden' },
  { id: 'pic-3', question: 'Which of these can fly?', options: ['Elephant', 'Butterfly', 'Turtle', 'Fish'], correct: 'Butterfly', hint: 'It has colorful wings' },
  { id: 'pic-4', question: 'What do plants need to grow, along with water and soil?', options: ['Sunlight', 'Ice', 'Sand', 'Smoke'], correct: 'Sunlight', hint: 'It comes from the sky' },
  { id: 'pic-5', question: 'What season comes after winter?', options: ['Summer', 'Spring', 'Autumn', 'Fall'], correct: 'Spring', hint: 'Flowers start to bloom' },
  { id: 'pic-6', question: 'Which animal is known as "man\'s best friend"?', options: ['Cat', 'Dog', 'Bird', 'Fish'], correct: 'Dog', hint: 'It loves to fetch and play' },
  { id: 'pic-7', question: 'What do we call baby frogs?', options: ['Cubs', 'Tadpoles', 'Kittens', 'Chicks'], correct: 'Tadpoles', hint: 'They live in water before becoming frogs' },
  { id: 'pic-8', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correct: 'Jupiter', hint: 'It is a giant gas planet' },
  { id: 'pic-9', question: 'What do caterpillars turn into?', options: ['Bees', 'Butterflies', 'Beetles', 'Moths only'], correct: 'Butterflies', hint: 'A beautiful transformation' },
  { id: 'pic-10', question: 'Which of these is a baby dog called?', options: ['Puppy', 'Kitten', 'Cub', 'Calf'], correct: 'Puppy', hint: 'A very common pet word' },
];

export const shapeMatchQuestions: QuizQuestion[] = [
  { id: 'shapematch-1', question: 'Which shape has 3 sides?', options: ['Triangle', 'Square', 'Pentagon', 'Circle'], correct: 'Triangle', hint: 'Tri means three' },
  { id: 'shapematch-2', question: 'Which shape has 4 equal sides?', options: ['Rectangle', 'Square', 'Triangle', 'Hexagon'], correct: 'Square', hint: 'All sides are the same length' },
  { id: 'shapematch-3', question: 'Which shape is perfectly round?', options: ['Circle', 'Square', 'Triangle', 'Rectangle'], correct: 'Circle', hint: 'It has no corners' },
  { id: 'shapematch-4', question: 'Which shape has 6 sides?', options: ['Pentagon', 'Hexagon', 'Square', 'Triangle'], correct: 'Hexagon', hint: 'Hexa means six' },
  { id: 'shapematch-5', question: 'Which shape has 5 sides?', options: ['Pentagon', 'Square', 'Circle', 'Hexagon'], correct: 'Pentagon', hint: 'Penta means five' },
  { id: 'shapematch-6', question: 'A rectangle has how many corners?', options: ['2', '3', '4', '5'], correct: '4', hint: 'Count each corner' },
  { id: 'shapematch-7', question: 'Which 3D shape is perfectly round like a ball?', options: ['Cube', 'Sphere', 'Cone', 'Cylinder'], correct: 'Sphere', hint: 'Think of a football' },
  { id: 'shapematch-8', question: 'Which 3D shape has 6 flat square faces?', options: ['Sphere', 'Cube', 'Cone', 'Cylinder'], correct: 'Cube', hint: 'Think of a dice' },
  { id: 'shapematch-9', question: 'Which shape looks like a stop sign?', options: ['Octagon', 'Triangle', 'Circle', 'Square'], correct: 'Octagon', hint: 'It has 8 sides' },
  { id: 'shapematch-10', question: 'Which shape has one curved side and one flat side (like a slice of pizza folded)?', options: ['Semicircle', 'Square', 'Hexagon', 'Rectangle'], correct: 'Semicircle', hint: 'Half of a circle' },
];

// ---------------------------------------------------------------------------
// Letter Match: memory-flip pairs matching uppercase to lowercase letters.
// ---------------------------------------------------------------------------
export const letterMatchPairs = ['A', 'B', 'C', 'D', 'E', 'F'];
