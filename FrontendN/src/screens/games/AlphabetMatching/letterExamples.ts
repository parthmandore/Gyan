/**
 * Purpose: Static configuration mapping letters to object examples with multi-lingual support (en/hi/mr) and guaranteed fallback emojis.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching
 */

export interface LocalizedText {
  en: string;
  hi: string;
  mr: string;
}

export interface LetterExample {
  letter: string;
  word: LocalizedText;
  imageUri: string;
  emoji: string;
  audioPhrase: LocalizedText;
}

export const LETTER_EXAMPLES: Record<string, LetterExample> = {
  A: {
    letter: 'A',
    word: { en: 'Apple', hi: 'सेब (Apple)', mr: 'सफरचंद (Apple)' },
    imageUri: 'https://img.icons8.com/emoji/96/apple-emoji.png',
    emoji: '🍎',
    audioPhrase: { en: 'This is A. A is for Apple', hi: 'A से Apple', mr: 'A म्हणजे Apple' },
  },
  B: {
    letter: 'B',
    word: { en: 'Ball', hi: 'गेंद (Ball)', mr: 'ेंडू (Ball)' },
    imageUri: 'https://img.icons8.com/emoji/96/tennis-ball.png',
    emoji: '⚽',
    audioPhrase: { en: 'This is B. B is for Ball', hi: 'B से Ball', mr: 'B म्हणजे Ball' },
  },
  C: {
    letter: 'C',
    word: { en: 'Cat', hi: 'बिल्ली (Cat)', mr: 'मांजर (Cat)' },
    imageUri: 'https://img.icons8.com/emoji/96/cat-face-emoji.png',
    emoji: '🐱',
    audioPhrase: { en: 'This is C. C is for Cat', hi: 'C से Cat', mr: 'C म्हणजे Cat' },
  },
  D: {
    letter: 'D',
    word: { en: 'Dog', hi: 'कुत्ता (Dog)', mr: 'कुत्रा (Dog)' },
    imageUri: 'https://img.icons8.com/emoji/96/dog-face-emoji.png',
    emoji: '🐶',
    audioPhrase: { en: 'This is D. D is for Dog', hi: 'D से Dog', mr: 'D म्हणजे Dog' },
  },
  E: {
    letter: 'E',
    word: { en: 'Elephant', hi: 'हाथी (Elephant)', mr: 'हत्ती (Elephant)' },
    imageUri: 'https://img.icons8.com/emoji/96/elephant-emoji.png',
    emoji: '🐘',
    audioPhrase: { en: 'This is E. E is for Elephant', hi: 'E से Elephant', mr: 'E म्हणजे Elephant' },
  },
  F: {
    letter: 'F',
    word: { en: 'Fish', hi: 'मछली (Fish)', mr: 'मासा (Fish)' },
    imageUri: 'https://img.icons8.com/emoji/96/fish-emoji.png',
    emoji: '🐟',
    audioPhrase: { en: 'This is F. F is for Fish', hi: 'F से Fish', mr: 'F म्हणजे Fish' },
  },
  G: {
    letter: 'G',
    word: { en: 'Grapes', hi: 'अंगूर (Grapes)', mr: 'द्राक्षे (Grapes)' },
    imageUri: 'https://img.icons8.com/emoji/96/grapes-emoji.png',
    emoji: '🍇',
    audioPhrase: { en: 'This is G. G is for Grapes', hi: 'G से Grapes', mr: 'G म्हणजे Grapes' },
  },
  H: {
    letter: 'H',
    word: { en: 'Hat', hi: 'टोपी (Hat)', mr: 'टोपी (Hat)' },
    imageUri: 'https://img.icons8.com/emoji/96/top-hat-emoji.png',
    emoji: '🎩',
    audioPhrase: { en: 'This is H. H is for Hat', hi: 'H से Hat', mr: 'H म्हणजे Hat' },
  },
  I: {
    letter: 'I',
    word: { en: 'Ice Cream', hi: 'आइसक्रीम (Ice Cream)', mr: 'आस्क्रीम (Ice Cream)' },
    imageUri: 'https://img.icons8.com/emoji/96/soft-ice-cream-emoji.png',
    emoji: '🍦',
    audioPhrase: { en: 'This is I. I is for Ice Cream', hi: 'I से Ice Cream', mr: 'I म्हणजे Ice Cream' },
  },
  J: {
    letter: 'J',
    word: { en: 'Juice', hi: 'जूस (Juice)', mr: 'ज्यूस (Juice)' },
    imageUri: 'https://img.icons8.com/emoji/96/beverage-box-emoji.png',
    emoji: '🧃',
    audioPhrase: { en: 'This is J. J is for Juice', hi: 'J से Juice', mr: 'J म्हणजे Juice' },
  },
  K: {
    letter: 'K',
    word: { en: 'Kite', hi: 'पतंग (Kite)', mr: 'पतंग (Kite)' },
    imageUri: 'https://img.icons8.com/emoji/96/kite-emoji.png',
    emoji: '🪁',
    audioPhrase: { en: 'This is K. K is for Kite', hi: 'K से Kite', mr: 'K म्हणजे Kite' },
  },
  L: {
    letter: 'L',
    word: { en: 'Lion', hi: 'शेर (Lion)', mr: 'सिंह (Lion)' },
    imageUri: 'https://img.icons8.com/emoji/96/lion-face-emoji.png',
    emoji: '🦁',
    audioPhrase: { en: 'This is L. L is for Lion', hi: 'L से Lion', mr: 'L म्हणजे Lion' },
  },
  M: {
    letter: 'M',
    word: { en: 'Monkey', hi: 'बंदर (Monkey)', mr: 'माकड (Monkey)' },
    imageUri: 'https://img.icons8.com/emoji/96/monkey-face-emoji.png',
    emoji: '🐵',
    audioPhrase: { en: 'This is M. M is for Monkey', hi: 'M से Monkey', mr: 'M म्हणजे Monkey' },
  },
  N: {
    letter: 'N',
    word: { en: 'Nest', hi: 'घोंसला (Nest)', mr: 'घरटे (Nest)' },
    imageUri: 'https://img.icons8.com/emoji/96/nest-with-eggs-emoji.png',
    emoji: '🪹',
    audioPhrase: { en: 'This is N. N is for Nest', hi: 'N से Nest', mr: 'N म्हणजे Nest' },
  },
  O: {
    letter: 'O',
    word: { en: 'Orange', hi: 'संतरा (Orange)', mr: 'संतरे (Orange)' },
    imageUri: 'https://img.icons8.com/emoji/96/tangerine-emoji.png',
    emoji: '🍊',
    audioPhrase: { en: 'This is O. O is for Orange', hi: 'O से Orange', mr: 'O म्हणजे Orange' },
  },
  P: {
    letter: 'P',
    word: { en: 'Penguin', hi: 'पेंगुइन (Penguin)', mr: 'पेन्गुइन (Penguin)' },
    imageUri: 'https://img.icons8.com/emoji/96/penguin-emoji.png',
    emoji: '🐧',
    audioPhrase: { en: 'This is P. P is for Penguin', hi: 'P से Penguin', mr: 'P म्हणजे Penguin' },
  },
  Q: {
    letter: 'Q',
    word: { en: 'Queen', hi: 'रानी (Queen)', mr: 'राणी (Queen)' },
    imageUri: 'https://img.icons8.com/emoji/96/princess-emoji.png',
    emoji: '👑',
    audioPhrase: { en: 'This is Q. Q is for Queen', hi: 'Q से Queen', mr: 'Q म्हणजे Queen' },
  },
  R: {
    letter: 'R',
    word: { en: 'Rabbit', hi: 'खरगोश (Rabbit)', mr: 'ससा (Rabbit)' },
    imageUri: 'https://img.icons8.com/emoji/96/rabbit-face-emoji.png',
    emoji: '🐰',
    audioPhrase: { en: 'This is R. R is for Rabbit', hi: 'R से Rabbit', mr: 'R म्हणजे Rabbit' },
  },
  S: {
    letter: 'S',
    word: { en: 'Sun', hi: 'सूरज (Sun)', mr: 'सूर्य (Sun)' },
    imageUri: 'https://img.icons8.com/emoji/96/sun-with-face-emoji.png',
    emoji: '☀️',
    audioPhrase: { en: 'This is S. S is for Sun', hi: 'S से Sun', mr: 'S म्हणजे Sun' },
  },
  T: {
    letter: 'T',
    word: { en: 'Tree', hi: 'पेड़ (Tree)', mr: 'झाड (Tree)' },
    imageUri: 'https://img.icons8.com/emoji/96/deciduous-tree-emoji.png',
    emoji: '🌲',
    audioPhrase: { en: 'This is T. T is for Tree', hi: 'T से Tree', mr: 'T म्हणजे Tree' },
  },
  U: {
    letter: 'U',
    word: { en: 'Umbrella', hi: 'छतरी (Umbrella)', mr: 'छत्री (Umbrella)' },
    imageUri: 'https://img.icons8.com/emoji/96/umbrella-emoji.png',
    emoji: '☂️',
    audioPhrase: { en: 'This is U. U is for Umbrella', hi: 'U से Umbrella', mr: 'U म्हणजे Umbrella' },
  },
  V: {
    letter: 'V',
    word: { en: 'Violin', hi: 'वायलिन (Violin)', mr: 'वायोलिन (Violin)' },
    imageUri: 'https://img.icons8.com/emoji/96/violin-emoji.png',
    emoji: '🎻',
    audioPhrase: { en: 'This is V. V is for Violin', hi: 'V से Violin', mr: 'V म्हणजे Violin' },
  },
  W: {
    letter: 'W',
    word: { en: 'Watermelon', hi: 'तरबूज (Watermelon)', mr: 'कलिंगड (Watermelon)' },
    imageUri: 'https://img.icons8.com/emoji/96/watermelon-emoji.png',
    emoji: '🍉',
    audioPhrase: { en: 'This is W. W is for Watermelon', hi: 'W से Watermelon', mr: 'W म्हणजे Watermelon' },
  },
  X: {
    letter: 'X',
    word: { en: 'Xylophone', hi: 'जायलोफोन (Xylophone)', mr: 'झायलोफोन (Xylophone)' },
    imageUri: 'https://img.icons8.com/emoji/96/musical-keyboard-emoji.png',
    emoji: '🎹',
    audioPhrase: { en: 'This is X. X is for Xylophone', hi: 'X से Xylophone', mr: 'X म्हणजे Xylophone' },
  },
  Y: {
    letter: 'Y',
    word: { en: 'Yacht', hi: 'नाव (Yacht)', mr: 'होडी (Yacht)' },
    imageUri: 'https://img.icons8.com/emoji/96/sailboat-emoji.png',
    emoji: '⛵',
    audioPhrase: { en: 'This is Y. Y is for Yacht', hi: 'Y से Yacht', mr: 'Y म्हणजे Yacht' },
  },
  Z: {
    letter: 'Z',
    word: { en: 'Zebra', hi: 'जेब्रा (Zebra)', mr: 'झिब्रा (Zebra)' },
    imageUri: 'https://img.icons8.com/emoji/96/zebra-emoji.png',
    emoji: '🦓',
    audioPhrase: { en: 'This is Z. Z is for Zebra', hi: 'Z से Zebra', mr: 'Z म्हणजे Zebra' },
  },
};

export const getLetterExample = (letter: string): LetterExample => {
  const upper = letter.toUpperCase();
  return (
    LETTER_EXAMPLES[upper] || {
      letter: upper,
      word: { en: 'Star', hi: 'तारा (Star)', mr: 'चांदणी (Star)' },
      imageUri: 'https://img.icons8.com/emoji/96/glowing-star-emoji.png',
      emoji: '⭐',
      audioPhrase: { en: `This is ${upper}. ${upper} is for Star`, hi: `${upper} से Star`, mr: `${upper} म्हणजे Star` },
    }
  );
};
