// ---------------------------------------------------------------------------
// Social Stories — short, first-person picture-book style stories that help
// children understand and navigate everyday social and emotional
// situations, following the well-established "Social Stories" approach
// (simple, positive, descriptive language; one idea per page; ends on an
// encouraging note). Meant to be read together with a trusted adult, or
// read aloud by the app, as often as helpful.
// ---------------------------------------------------------------------------

export type StoryPage = {
  emoji: string;
  text: string;
};

export type SocialStory = {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  color: string;
  pages: StoryPage[];
};

export const socialStories: SocialStory[] = [
  {
    id: 'asking-for-what-i-want',
    title: 'When I Want Something',
    emoji: '🙋',
    summary: 'For when asking turns into crying or shouting for things',
    color: 'from-rose-400 to-pink-500',
    pages: [
      { emoji: '🙂', text: 'Sometimes I see something I really want.' },
      { emoji: '😢', text: "It's easy to feel like crying or shouting when I want it right away." },
      { emoji: '🤔', text: "But crying and shouting don't tell people exactly what I need." },
      { emoji: '🗣️', text: 'I can use my words instead: "Can I have that, please?"' },
      { emoji: '⏳', text: 'Sometimes the answer is yes. Sometimes I have to wait, or the answer is no.' },
      { emoji: '💪', text: 'Waiting can feel hard, but I can take a deep breath and stay calm.' },
      { emoji: '🌟', text: 'When I ask nicely, grown-ups are proud of me and want to help me.' },
      { emoji: '🎉', text: 'I am learning to use my words. I can do it!' },
    ],
  },
  {
    id: 'staying-safe-in-class',
    title: 'Staying Safe in Class',
    emoji: '🏫',
    summary: 'For when running toward the door or gate feels tempting',
    color: 'from-amber-400 to-orange-500',
    pages: [
      { emoji: '🏫', text: 'I go to school to learn and play with my friends.' },
      { emoji: '🚪', text: 'Sometimes I feel like running out of the classroom or toward the gate.' },
      { emoji: '⚠️', text: 'The gate and the road outside can be dangerous for children on their own.' },
      { emoji: '🧑\u200d🏫', text: "My teacher's job is to keep me safe in the classroom and playground." },
      { emoji: '🖐️', text: 'If I feel like running, I can put my hand up and say "I need a break."' },
      { emoji: '🚶', text: 'My teacher can walk with me to a calm, safe space to feel better.' },
      { emoji: '🛡️', text: 'Staying with my teacher and my class keeps me safe.' },
      { emoji: '🌟', text: 'I am safe, and I can ask for a break instead of running. I am doing great.' },
    ],
  },
  {
    id: 'goodbye-at-school',
    title: 'Goodbye at School',
    emoji: '👋',
    summary: 'For when drop-off time brings big feelings',
    color: 'from-sky-400 to-blue-500',
    pages: [
      { emoji: '🌞', text: 'Every morning, my parents bring me to school.' },
      { emoji: '🥹', text: 'Sometimes saying goodbye feels hard, and I want to cry.' },
      { emoji: '❤️', text: "It's okay to feel sad when parents leave — lots of children feel this way too." },
      { emoji: '🙋', text: 'My parents always come back to pick me up after school.' },
      { emoji: '👋', text: 'We can make a special goodbye, like a wave, a high-five, or a hug.' },
      { emoji: '🧑\u200d🏫', text: 'My teacher is there to help me feel better and keep me busy with fun things.' },
      { emoji: '🎨', text: 'Soon I will be playing, learning, and having fun with my friends.' },
      { emoji: '🌟', text: 'Saying goodbye gets easier every day. I am brave, and my parents always come back.' },
    ],
  },
  {
    id: 'waiting-my-turn',
    title: 'Waiting My Turn',
    emoji: '⏳',
    summary: 'For sharing toys, turns, and attention',
    color: 'from-emerald-400 to-teal-500',
    pages: [
      { emoji: '🎲', text: 'Sometimes I want to play with a toy or go first, but someone else is using it.' },
      { emoji: '⏱️', text: 'Waiting for my turn can feel hard, especially when I really want something.' },
      { emoji: '🧘', text: 'I can wait by counting slowly, taking deep breaths, or watching quietly.' },
      { emoji: '🗣️', text: 'I can say, "Can I have a turn next, please?"' },
      { emoji: '🔁', text: 'Everybody gets a turn, and my turn will come.' },
      { emoji: '😊', text: 'When I wait nicely, my friends like playing with me.' },
      { emoji: '🌟', text: 'I am learning to wait, and I am getting better at it every day.' },
    ],
  },
  {
    id: 'using-kind-hands',
    title: 'Using Kind Hands',
    emoji: '🤝',
    summary: 'For when frustration makes hands want to hit or push',
    color: 'from-violet-400 to-purple-500',
    pages: [
      { emoji: '😤', text: 'Sometimes I feel angry or frustrated, and my body wants to hit or push.' },
      { emoji: '🛑', text: "Hitting can hurt other people, even if I don't mean to." },
      { emoji: '🫂', text: 'When I feel angry, I can hug myself tightly instead.' },
      { emoji: '🗣️', text: 'I can also say "I feel angry" or "I need space."' },
      { emoji: '🧑\u200d🏫', text: 'A grown-up can help me feel calm again.' },
      { emoji: '🤝', text: 'Kind hands help me stay friends with others.' },
      { emoji: '🌟', text: 'I am learning to use kind hands, even when I feel upset. I am proud of myself.' },
    ],
  },
  {
    id: 'trying-new-foods',
    title: 'Trying New Foods',
    emoji: '🍽️',
    summary: 'For mealtimes with unfamiliar foods',
    color: 'from-lime-400 to-green-500',
    pages: [
      { emoji: '🍽️', text: "Sometimes there is a new food on my plate that I haven't tried before." },
      { emoji: '😕', text: "New foods can look, smell, or feel different, and that's okay." },
      { emoji: '👃', text: "I can look at it and smell it first, without needing to eat it right away." },
      { emoji: '🤏', text: 'I can try just one tiny bite if I feel ready.' },
      { emoji: '👍', text: "If I don't like it, that's okay too — I can try again another day." },
      { emoji: '🌟', text: 'Trying new foods is brave, and I get braver every time I try.' },
    ],
  },
  {
    id: 'when-plans-change',
    title: 'When Plans Change',
    emoji: '🔄',
    summary: 'For surprises and changes to routine',
    color: 'from-cyan-400 to-sky-500',
    pages: [
      { emoji: '📅', text: 'Sometimes I know what is going to happen, like going to the park.' },
      { emoji: '😲', text: 'Sometimes plans change, and that can feel surprising or upsetting.' },
      { emoji: '🌦️', text: 'Plans change for lots of reasons, like weather or grown-ups being busy.' },
      { emoji: '💬', text: 'A grown-up will tell me when a plan changes and explain why.' },
      { emoji: '🧘', text: 'I can take a deep breath and say, "Okay, what will we do instead?"' },
      { emoji: '🌈', text: 'Sometimes new plans can be fun too, even if they are different.' },
      { emoji: '🌟', text: 'I am learning that plans can change, and I can handle it.' },
    ],
  },
  {
    id: 'asking-for-a-break',
    title: 'Asking for a Break',
    emoji: '🌿',
    summary: 'For when noise, light, or busy places feel like too much',
    color: 'from-teal-400 to-emerald-500',
    pages: [
      { emoji: '🎧', text: 'Sometimes loud noises, bright lights, or busy places feel like too much.' },
      { emoji: '😣', text: 'When this happens, my body might feel tense, and I may want to cover my ears or cry.' },
      { emoji: '🖐️', text: 'I can ask for a break by saying "break, please" or showing a break card.' },
      { emoji: '🌿', text: 'A quiet space can help my body feel calm again.' },
      { emoji: '🧑\u200d🏫', text: 'Grown-ups want to help me feel comfortable and safe.' },
      { emoji: '🌟', text: 'Asking for a break is a great way to look after myself. I am strong for asking.' },
    ],
  },
];
