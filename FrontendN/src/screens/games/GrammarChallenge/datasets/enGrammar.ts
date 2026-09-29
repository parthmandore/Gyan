/**
 * Purpose: English dataset for Basic Grammar games suite.
 * Module: Grammar Challenge — Datasets
 * Folder: frontend/src/screens/games/GrammarChallenge/datasets
 */

import { GrammarQuestionItem } from '../types';

export const EN_GRAMMAR_DATASET: GrammarQuestionItem[] = [
  // ==========================================
  // AGE 6: NOUN OR VERB
  // ==========================================
  {
    id: 'en_nv_1',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Dog',
    visualIcon: '🐶',
    options: [
      { label: 'Noun (Name)', isCorrect: true },
      { label: 'Verb (Action)', isCorrect: false },
    ],
    explanation: 'A dog is an animal, so it is a Noun!',
  },
  {
    id: 'en_nv_2',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Run',
    visualIcon: '🏃',
    options: [
      { label: 'Noun (Name)', isCorrect: false },
      { label: 'Verb (Action)', isCorrect: true },
    ],
    explanation: 'Running is an action, so it is a Verb!',
  },
  {
    id: 'en_nv_3',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Apple',
    visualIcon: '🍎',
    options: [
      { label: 'Noun (Name)', isCorrect: true },
      { label: 'Verb (Action)', isCorrect: false },
    ],
    explanation: 'An apple is a thing, so it is a Noun!',
  },
  {
    id: 'en_nv_4',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Jump',
    visualIcon: '🦘',
    options: [
      { label: 'Noun (Name)', isCorrect: false },
      { label: 'Verb (Action)', isCorrect: true },
    ],
    explanation: 'Jumping is an action, so it is a Verb!',
  },
  {
    id: 'en_nv_5',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Car',
    visualIcon: '🚗',
    options: [
      { label: 'Noun (Name)', isCorrect: true },
      { label: 'Verb (Action)', isCorrect: false },
    ],
    explanation: 'A car is an object, so it is a Noun!',
  },
  {
    id: 'en_nv_6',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Sleep',
    visualIcon: '😴',
    options: [
      { label: 'Noun (Name)', isCorrect: false },
      { label: 'Verb (Action)', isCorrect: true },
    ],
    explanation: 'Sleeping is an action, so it is a Verb!',
  },
  {
    id: 'en_nv_7',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'Tree',
    visualIcon: '🌳',
    options: [
      { label: 'Noun (Name)', isCorrect: true },
      { label: 'Verb (Action)', isCorrect: false },
    ],
    explanation: 'A tree is a living plant, so it is a Noun!',
  },

  // ==========================================
  // AGE 6: SINGULAR OR PLURAL
  // ==========================================
  {
    id: 'en_sp_1',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'Cat',
    visualIcon: '🐱',
    options: [
      { label: 'Singular (One)', isCorrect: true },
      { label: 'Plural (Many)', isCorrect: false },
    ],
    explanation: 'Cat means just one cat!',
  },
  {
    id: 'en_sp_2',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'Dogs',
    visualIcon: '🐕🐕',
    options: [
      { label: 'Singular (One)', isCorrect: false },
      { label: 'Plural (Many)', isCorrect: true },
    ],
    explanation: 'Dogs ends with -s, which means more than one!',
  },
  {
    id: 'en_sp_3',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'Bird',
    visualIcon: '🐦',
    options: [
      { label: 'Singular (One)', isCorrect: true },
      { label: 'Plural (Many)', isCorrect: false },
    ],
    explanation: 'Bird means one single bird!',
  },
  {
    id: 'en_sp_4',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'Apples',
    visualIcon: '🍎🍎',
    options: [
      { label: 'Singular (One)', isCorrect: false },
      { label: 'Plural (Many)', isCorrect: true },
    ],
    explanation: 'Apples means multiple apples!',
  },
  {
    id: 'en_sp_5',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'Star',
    visualIcon: '⭐',
    options: [
      { label: 'Singular (One)', isCorrect: true },
      { label: 'Plural (Many)', isCorrect: false },
    ],
    explanation: 'Star means one shining star!',
  },
  {
    id: 'en_sp_6',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'Toys',
    visualIcon: '🧸🚗',
    options: [
      { label: 'Singular (One)', isCorrect: false },
      { label: 'Plural (Many)', isCorrect: true },
    ],
    explanation: 'Toys means more than one toy!',
  },

  // ==========================================
  // AGE 6: COMPLETE THE SENTENCE
  // ==========================================
  {
    id: 'en_cs_1',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'The cat ___ sleeping.',
    visualIcon: '🐱',
    options: [
      { label: 'is', isCorrect: true },
      { label: 'are', isCorrect: false },
      { label: 'am', isCorrect: false },
    ],
    explanation: 'We use "is" for one cat!',
  },
  {
    id: 'en_cs_2',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'Birds ___ flying high.',
    visualIcon: '🐦',
    options: [
      { label: 'is', isCorrect: false },
      { label: 'are', isCorrect: true },
      { label: 'am', isCorrect: false },
    ],
    explanation: 'We use "are" for many birds!',
  },
  {
    id: 'en_cs_3',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'I ___ playing with toys.',
    visualIcon: '🧒',
    options: [
      { label: 'am', isCorrect: true },
      { label: 'is', isCorrect: false },
      { label: 'are', isCorrect: false },
    ],
    explanation: 'We always say "I am"!',
  },
  {
    id: 'en_cs_4',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'The sun ___ very bright.',
    visualIcon: '☀️',
    options: [
      { label: 'is', isCorrect: true },
      { label: 'are', isCorrect: false },
      { label: 'am', isCorrect: false },
    ],
    explanation: 'The sun is singular, so we use "is"!',
  },
  {
    id: 'en_cs_5',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'We ___ happy friends.',
    visualIcon: '👫',
    options: [
      { label: 'are', isCorrect: true },
      { label: 'is', isCorrect: false },
      { label: 'am', isCorrect: false },
    ],
    explanation: 'We use "are" with "we"!',
  },
  {
    id: 'en_cs_6',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'She ___ reading a story.',
    visualIcon: '👧',
    options: [
      { label: 'is', isCorrect: true },
      { label: 'are', isCorrect: false },
      { label: 'am', isCorrect: false },
    ],
    explanation: 'We use "is" for "she"!',
  },

  // ==========================================
  // AGE 7: ARTICLES / DETERMINERS
  // ==========================================
  {
    id: 'en_art_1',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'I ate ___ apple for breakfast.',
    visualIcon: '🍎',
    options: [
      { label: 'an', isCorrect: true },
      { label: 'a', isCorrect: false },
      { label: 'the', isCorrect: false },
    ],
    explanation: '"Apple" starts with a vowel sound, so we use "an"!',
  },
  {
    id: 'en_art_2',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'She has ___ cute puppy.',
    visualIcon: '🐶',
    options: [
      { label: 'a', isCorrect: true },
      { label: 'an', isCorrect: false },
      { label: 'the', isCorrect: false },
    ],
    explanation: '"Cute" starts with a consonant sound, so we use "a"!',
  },
  {
    id: 'en_art_3',
    topic: 'articles_determiners',
    age: 7,
    sentence: '___ sun shines in the sky.',
    visualIcon: '☀️',
    options: [
      { label: 'The', isCorrect: true },
      { label: 'A', isCorrect: false },
      { label: 'An', isCorrect: false },
    ],
    explanation: 'There is only one sun, so we use "The"!',
  },
  {
    id: 'en_art_4',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'He saw ___ elephant at the zoo.',
    visualIcon: '🐘',
    options: [
      { label: 'an', isCorrect: true },
      { label: 'a', isCorrect: false },
      { label: 'the', isCorrect: false },
    ],
    explanation: '"Elephant" starts with a vowel sound (E), so we use "an"!',
  },
  {
    id: 'en_art_5',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'Look at ___ moon tonight!',
    visualIcon: '🌙',
    options: [
      { label: 'the', isCorrect: true },
      { label: 'a', isCorrect: false },
      { label: 'an', isCorrect: false },
    ],
    explanation: 'We say "the moon" because it is unique!',
  },
  {
    id: 'en_art_6',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'Give me ___ umbrella, please.',
    visualIcon: '☂️',
    options: [
      { label: 'an', isCorrect: true },
      { label: 'a', isCorrect: false },
      { label: 'the', isCorrect: false },
    ],
    explanation: '"Umbrella" begins with a vowel sound, so we use "an"!',
  },

  // ==========================================
  // AGE 7: PRONOUNS
  // ==========================================
  {
    id: 'en_pro_1',
    topic: 'pronouns',
    age: 7,
    sentence: 'Riya is smiling. ___ is happy.',
    visualIcon: '👧',
    options: [
      { label: 'She', isCorrect: true },
      { label: 'He', isCorrect: false },
      { label: 'They', isCorrect: false },
    ],
    explanation: 'Riya is a girl, so we use "She"!',
  },
  {
    id: 'en_pro_2',
    topic: 'pronouns',
    age: 7,
    sentence: 'Rohan has a ball. ___ loves football.',
    visualIcon: '👦',
    options: [
      { label: 'He', isCorrect: true },
      { label: 'She', isCorrect: false },
      { label: 'It', isCorrect: false },
    ],
    explanation: 'Rohan is a boy, so we use "He"!',
  },
  {
    id: 'en_pro_3',
    topic: 'pronouns',
    age: 7,
    sentence: 'The puppy is tired. ___ is sleeping.',
    visualIcon: '🐶',
    options: [
      { label: 'It', isCorrect: true },
      { label: 'He', isCorrect: false },
      { label: 'We', isCorrect: false },
    ],
    explanation: 'We use "It" for animals and objects!',
  },
  {
    id: 'en_pro_4',
    topic: 'pronouns',
    age: 7,
    sentence: 'Amit and I are friends. ___ play together.',
    visualIcon: '👫',
    options: [
      { label: 'We', isCorrect: true },
      { label: 'They', isCorrect: false },
      { label: 'She', isCorrect: false },
    ],
    explanation: 'When talking about yourself and someone else, use "We"!',
  },
  {
    id: 'en_pro_5',
    topic: 'pronouns',
    age: 7,
    sentence: 'Look at the kids. ___ are dancing.',
    visualIcon: '🎉',
    options: [
      { label: 'They', isCorrect: true },
      { label: 'He', isCorrect: false },
      { label: 'She', isCorrect: false },
    ],
    explanation: 'For a group of other people, we use "They"!',
  },

  // ==========================================
  // AGE 7: PREPOSITIONS
  // ==========================================
  {
    id: 'en_prep_1',
    topic: 'prepositions',
    age: 7,
    sentence: 'The book is ___ the table.',
    visualIcon: '📖',
    options: [
      { label: 'on', isCorrect: true },
      { label: 'under', isCorrect: false },
      { label: 'in', isCorrect: false },
    ],
    explanation: 'The book rests on top of the surface, so it is "on" the table!',
  },
  {
    id: 'en_prep_2',
    topic: 'prepositions',
    age: 7,
    sentence: 'The fish swims ___ the water.',
    visualIcon: '🐟',
    options: [
      { label: 'in', isCorrect: true },
      { label: 'on', isCorrect: false },
      { label: 'under', isCorrect: false },
    ],
    explanation: 'Fish live inside the water, so it swims "in" the water!',
  },
  {
    id: 'en_prep_3',
    topic: 'prepositions',
    age: 7,
    sentence: 'The cat is hiding ___ the bed.',
    visualIcon: '🐱',
    options: [
      { label: 'under', isCorrect: true },
      { label: 'on', isCorrect: false },
      { label: 'in', isCorrect: false },
    ],
    explanation: 'The cat is beneath the bed, so it is "under"!',
  },
  {
    id: 'en_prep_4',
    topic: 'prepositions',
    age: 7,
    sentence: 'Put the apples ___ the basket.',
    visualIcon: '🧺',
    options: [
      { label: 'in', isCorrect: true },
      { label: 'on', isCorrect: false },
      { label: 'under', isCorrect: false },
    ],
    explanation: 'The apples go inside the basket, so we use "in"!',
  },
  {
    id: 'en_prep_5',
    topic: 'prepositions',
    age: 7,
    sentence: 'The bird sits ___ the branch.',
    visualIcon: '🐦',
    options: [
      { label: 'on', isCorrect: true },
      { label: 'in', isCorrect: false },
      { label: 'under', isCorrect: false },
    ],
    explanation: 'The bird sits on top of the branch, so it is "on"!',
  },

  // ==========================================
  // AGE 7: BASIC TENSES
  // ==========================================
  {
    id: 'en_ten_1',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'Yesterday, I ___ to the park.',
    visualIcon: '🏞️',
    options: [
      { label: 'went', isCorrect: true },
      { label: 'go', isCorrect: false },
      { label: 'will go', isCorrect: false },
    ],
    explanation: '"Yesterday" happened in the past, so we use "went"!',
  },
  {
    id: 'en_ten_2',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'Every day, she ___ fresh milk.',
    visualIcon: '🥛',
    options: [
      { label: 'drinks', isCorrect: true },
      { label: 'drank', isCorrect: false },
      { label: 'will drink', isCorrect: false },
    ],
    explanation: 'A daily habit happens in the present, so we use "drinks"!',
  },
  {
    id: 'en_ten_3',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'Tomorrow, we ___ a big cake.',
    visualIcon: '🎂',
    options: [
      { label: 'will bake', isCorrect: true },
      { label: 'baked', isCorrect: false },
      { label: 'bake', isCorrect: false },
    ],
    explanation: '"Tomorrow" is in the future, so we use "will bake"!',
  },
  {
    id: 'en_ten_4',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'Last night, he ___ a nice story.',
    visualIcon: '📚',
    options: [
      { label: 'read', isCorrect: true },
      { label: 'will read', isCorrect: false },
      { label: 'reading', isCorrect: false },
    ],
    explanation: '"Last night" is in the past, so we use past tense "read"!',
  },
  {
    id: 'en_ten_5',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'Tomorrow, the sun ___ again.',
    visualIcon: '🌅',
    options: [
      { label: 'will rise', isCorrect: true },
      { label: 'rose', isCorrect: false },
      { label: 'rises', isCorrect: false },
    ],
    explanation: 'Tomorrow is the future, so we say "will rise"!',
  },

  // ==========================================
  // AGE 7: SENTENCE CORRECTION
  // ==========================================
  {
    id: 'en_sc_1',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'Pick the correct sentence:',
    visualIcon: '✏️',
    options: [
      { label: 'He is happy.', isCorrect: true },
      { label: 'He are happy.', isCorrect: false },
      { label: 'He am happy.', isCorrect: false },
    ],
    explanation: 'We use "is" with "He"!',
  },
  {
    id: 'en_sc_2',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'Pick the correct sentence:',
    visualIcon: '✏️',
    options: [
      { label: 'They are playing.', isCorrect: true },
      { label: 'They is playing.', isCorrect: false },
      { label: 'They am playing.', isCorrect: false },
    ],
    explanation: '"They" is plural, so we use "are"!',
  },
  {
    id: 'en_sc_3',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'Pick the correct sentence:',
    visualIcon: '✏️',
    options: [
      { label: 'I am hungry.', isCorrect: true },
      { label: 'I is hungry.', isCorrect: false },
      { label: 'I are hungry.', isCorrect: false },
    ],
    explanation: 'Always say "I am"!',
  },
  {
    id: 'en_sc_4',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'Pick the correct sentence:',
    visualIcon: '✏️',
    options: [
      { label: 'The dog barks.', isCorrect: true },
      { label: 'The dog bark.', isCorrect: false },
      { label: 'The dog are bark.', isCorrect: false },
    ],
    explanation: 'One dog barks!',
  },
  {
    id: 'en_sc_5',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'Pick the correct sentence:',
    visualIcon: '✏️',
    options: [
      { label: 'She has a puppy.', isCorrect: true },
      { label: 'She have a puppy.', isCorrect: false },
      { label: 'She are puppy.', isCorrect: false },
    ],
    explanation: 'We use "has" with "She"!',
  },
];
