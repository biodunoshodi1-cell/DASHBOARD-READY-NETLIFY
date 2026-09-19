// Hardcoded question banks for daily challenges and lessons

export interface Question {
  id: string;
  subject: "math" | "english" | "phonics";
  question: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export const mathQuestions: Question[] = [
  { id: "m1", subject: "math", question: "5 + 3 = ?", options: ["7", "8", "9", "6"], correctAnswer: "8", hint: "Count on from 5" },
  { id: "m2", subject: "math", question: "10 - 4 = ?", options: ["5", "7", "6", "8"], correctAnswer: "6", hint: "Take away 4 from 10" },
  { id: "m3", subject: "math", question: "3 × 4 = ?", options: ["10", "14", "12", "11"], correctAnswer: "12", hint: "3 groups of 4" },
  { id: "m4", subject: "math", question: "15 ÷ 3 = ?", options: ["4", "6", "5", "3"], correctAnswer: "5", hint: "How many 3s in 15?" },
  { id: "m5", subject: "math", question: "7 + 8 = ?", options: ["14", "16", "15", "13"], correctAnswer: "15", hint: "7 + 8 = 7 + 3 + 5" },
  { id: "m6", subject: "math", question: "20 - 7 = ?", options: ["12", "14", "13", "11"], correctAnswer: "13", hint: "20 - 7, count back from 20" },
  { id: "m7", subject: "math", question: "6 × 5 = ?", options: ["25", "35", "30", "28"], correctAnswer: "30", hint: "6 groups of 5" },
  { id: "m8", subject: "math", question: "24 ÷ 4 = ?", options: ["5", "7", "6", "8"], correctAnswer: "6", hint: "How many 4s in 24?" },
  { id: "m9", subject: "math", question: "What is half of 18?", options: ["8", "10", "9", "7"], correctAnswer: "9", hint: "Divide 18 into 2 equal groups" },
  { id: "m10", subject: "math", question: "12 + 15 = ?", options: ["25", "28", "27", "26"], correctAnswer: "27", hint: "Add the tens, then the ones" },
  { id: "m11", subject: "math", question: "Which shape has 3 sides?", options: ["Square", "Circle", "Triangle", "Rectangle"], correctAnswer: "Triangle", hint: "Think of a 3-cornered shape" },
  { id: "m12", subject: "math", question: "What time is it when both hands point to 12?", options: ["12:30", "12:00", "6:00", "12:15"], correctAnswer: "12:00", hint: "Both hands at the top" },
  { id: "m13", subject: "math", question: "Count: 2, 4, 6, 8, __?", options: ["9", "11", "10", "12"], correctAnswer: "10", hint: "Add 2 each time" },
  { id: "m14", subject: "math", question: "9 × 3 = ?", options: ["27", "24", "30", "21"], correctAnswer: "27", hint: "9 groups of 3" },
  { id: "m15", subject: "math", question: "What is 1/4 of 20?", options: ["4", "6", "5", "8"], correctAnswer: "5", hint: "Divide 20 into 4 equal parts" },
];

export const englishQuestions: Question[] = [
  { id: "e1", subject: "english", question: "Which word is a noun?", options: ["Run", "Apple", "Happy", "Quickly"], correctAnswer: "Apple", hint: "A noun is a person, place, or thing" },
  { id: "e2", subject: "english", question: "Choose the correct spelling:", options: ["Frend", "Friend", "Freind", "Freiend"], correctAnswer: "Friend", hint: "'i' before 'e' except after 'c'" },
  { id: "e3", subject: "english", question: "What is the opposite of 'hot'?", options: ["Warm", "Cool", "Cold", "Mild"], correctAnswer: "Cold", hint: "Think of winter" },
  { id: "e4", subject: "english", question: "Complete: 'The cat ___ on the mat.'", options: ["sit", "sitting", "sat", "sits"], correctAnswer: "sat", hint: "Past tense of 'sit'" },
  { id: "e5", subject: "english", question: "Which is a verb?", options: ["Beautiful", "House", "Jump", "Slowly"], correctAnswer: "Jump", hint: "A verb is an action word" },
  { id: "e6", subject: "english", question: "How many syllables in 'butterfly'?", options: ["2", "4", "3", "1"], correctAnswer: "3", hint: "Clap the word: but-ter-fly" },
  { id: "e7", subject: "english", question: "Choose the correct sentence:", options: ["I goed to school.", "I went to school.", "I go to school yesterday.", "I going to school."], correctAnswer: "I went to school.", hint: "Past tense of 'go' is 'went'" },
  { id: "e8", subject: "english", question: "What is a synonym for 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], correctAnswer: "Joyful", hint: "A word that means the same thing" },
  { id: "e9", subject: "english", question: "What punctuation ends a question?", options: ["Full stop", "Exclamation mark", "Comma", "Question mark"], correctAnswer: "Question mark", hint: "Think of the '?' symbol" },
  { id: "e10", subject: "english", question: "Which word is an adjective?", options: ["Run", "Dog", "Tall", "Eat"], correctAnswer: "Tall", hint: "An adjective describes a noun" },
  { id: "e11", subject: "english", question: "The plural of 'child' is:", options: ["Childs", "Childrens", "Children", "Childes"], correctAnswer: "Children", hint: "Irregular plural" },
  { id: "e12", subject: "english", question: "What does 'enormous' mean?", options: ["Small", "Very large", "Colorful", "Fast"], correctAnswer: "Very large", hint: "Think of a very big elephant" },
  { id: "e13", subject: "english", question: "Choose the correct article: '___ elephant'", options: ["A", "An", "The", "Some"], correctAnswer: "An", hint: "Use 'an' before vowel sounds" },
  { id: "e14", subject: "english", question: "'She ___ the book.' (present tense)", options: ["reads", "read", "readed", "reading"], correctAnswer: "reads", hint: "Add -s for he/she/it" },
  { id: "e15", subject: "english", question: "A story has a beginning, middle, and ___?", options: ["Picture", "Title", "End", "Author"], correctAnswer: "End", hint: "Think about story structure" },
];

export const phonicsQuestions: Question[] = [
  { id: "p1", subject: "phonics", question: "Which word contains the 'ai' sound?", options: ["Cat", "Rain", "Red", "Cup"], correctAnswer: "Rain", hint: "ai makes the long 'a' sound" },
  { id: "p2", subject: "phonics", question: "Which word has the 'ee' sound?", options: ["Bed", "Tree", "Bag", "Hot"], correctAnswer: "Tree", hint: "ee makes a long 'e' sound" },
  { id: "p3", subject: "phonics", question: "What sound does 'ch' make in 'chair'?", options: ["/k/", "/sh/", "/ch/", "/s/"], correctAnswer: "/ch/", hint: "Like in 'cheese' or 'chocolate'" },
  { id: "p4", subject: "phonics", question: "Which word ends with the 'ck' sound?", options: ["Bag", "Duck", "Bus", "Hat"], correctAnswer: "Duck", hint: "ck comes after short vowels" },
  { id: "p5", subject: "phonics", question: "Which word has the 'oo' sound?", options: ["Book", "Moon", "Dog", "Pen"], correctAnswer: "Moon", hint: "Think of the moon at night" },
  { id: "p6", subject: "phonics", question: "What does 'sh' sound like in 'ship'?", options: ["/s/", "/h/", "/sh/", "/ch/"], correctAnswer: "/sh/", hint: "Like the sound you make for quiet" },
  { id: "p7", subject: "phonics", question: "Which word has double letters 'll'?", options: ["Rabbit", "Bell", "Happy", "Summer"], correctAnswer: "Bell", hint: "Listen for ll at the end" },
  { id: "p8", subject: "phonics", question: "Which word contains the 'oy' sound?", options: ["Oil", "Boy", "Boat", "Owl"], correctAnswer: "Boy", hint: "oy is at the end of words" },
  { id: "p9", subject: "phonics", question: "What sound does 'th' make in 'thumb'?", options: ["/t/", "/h/", "/th/", "/d/"], correctAnswer: "/th/", hint: "Put your tongue between your teeth" },
  { id: "p10", subject: "phonics", question: "Which word has the 'ay' sound?", options: ["Day", "Dog", "Dig", "Dug"], correctAnswer: "Day", hint: "ay makes the long 'a' sound" },
  { id: "p11", subject: "phonics", question: "Which word has the 'ph' sound (like /f/)?", options: ["Ship", "Phone", "Chin", "When"], correctAnswer: "Phone", hint: "ph makes an /f/ sound" },
  { id: "p12", subject: "phonics", question: "Which word has double 'ss'?", options: ["Miss", "Rabbit", "Bell", "Happy"], correctAnswer: "Miss", hint: "Listen for ss at the end" },
  { id: "p13", subject: "phonics", question: "What sound does 'wh' make in 'whale'?", options: ["/v/", "/w/", "/h/", "/wh/"], correctAnswer: "/w/", hint: "wh usually makes a /w/ sound" },
  { id: "p14", subject: "phonics", question: "Which word has the 'oa' sound?", options: ["Coat", "Cat", "Cot", "Cut"], correctAnswer: "Coat", hint: "oa makes the long 'o' sound" },
  { id: "p15", subject: "phonics", question: "What sound does 'ng' make in 'ring'?", options: ["/n/", "/g/", "/ng/", "/nk/"], correctAnswer: "/ng/", hint: "Like the sound at the end of 'sing'" },
];

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function generateDailyChallenge(date: string) {
  // Deterministically select 5 questions per subject based on date
  const seed = date.split("-").reduce((acc, part) => acc + parseInt(part, 10), 0);
  const pickFive = (arr: Question[], offset: number) => {
    const start = (seed + offset) % (arr.length - 4);
    return arr.slice(start, start + 5).map(q => ({ ...q }));
  };
  return {
    date,
    mathQuestions: pickFive(mathQuestions, 0),
    englishQuestions: pickFive(englishQuestions, 3),
    phonicsQuestions: pickFive(phonicsQuestions, 7),
  };
}
