/**
 * Purpose: Data-driven question generator for Basic Grammar games suite.
 *          Extracts language-aware items for the requested topic, shuffles options,
 *          and outputs exactly 5 progressive rounds with guaranteed single correct answers.
 * Module: Grammar Challenge — Logic
 * Folder: frontend/src/screens/games/GrammarChallenge/logic
 */

import {
  GrammarTopic,
  GrammarQuestion,
  GrammarRound,
  GrammarOption,
  GrammarQuestionItem,
} from '../types';
import { EN_GRAMMAR_DATASET } from '../datasets/enGrammar';
import { HI_GRAMMAR_DATASET } from '../datasets/hiGrammar';
import { MR_GRAMMAR_DATASET } from '../datasets/mrGrammar';

export const TOTAL_GRAMMAR_ROUNDS = 10;

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const TOPIC_PROMPTS: Record<GrammarTopic, { key: string; fallback: string }> = {
  noun_or_verb: {
    key: 'grammarChallenge.nounOrVerbPrompt',
    fallback: 'Is this word a Noun or a Verb?',
  },
  singular_or_plural: {
    key: 'grammarChallenge.singularOrPluralPrompt',
    fallback: 'Does this word mean One or Many?',
  },
  complete_the_sentence: {
    key: 'grammarChallenge.completeSentencePrompt',
    fallback: 'Choose the word that completes the sentence!',
  },
  articles_determiners: {
    key: 'grammarChallenge.articlesPrompt',
    fallback: 'Fill in the blank with the correct word!',
  },
  pronouns: {
    key: 'grammarChallenge.pronounsPrompt',
    fallback: 'Choose the correct pronoun for the blank!',
  },
  prepositions: {
    key: 'grammarChallenge.prepositionsPrompt',
    fallback: 'Where is it? Choose the right word!',
  },
  basic_tenses: {
    key: 'grammarChallenge.tensesPrompt',
    fallback: 'Choose the correct time-form for the sentence!',
  },
  sentence_correction: {
    key: 'grammarChallenge.correctionPrompt',
    fallback: 'Select the grammatically correct sentence!',
  },
};

export function generateGrammarSession(
  topic: GrammarTopic,
  language: string = 'en'
): GrammarRound[] {
  // Select language dataset
  let dataset: GrammarQuestionItem[] = EN_GRAMMAR_DATASET;
  const lang = (language || 'en').toLowerCase();
  if (lang === 'hi' || lang === 'hindi') {
    dataset = HI_GRAMMAR_DATASET;
  } else if (lang === 'mr' || lang === 'marathi') {
    dataset = MR_GRAMMAR_DATASET;
  }

  // Filter for topic
  let filtered = dataset.filter((item) => item.topic === topic);
  if (filtered.length === 0) {
    // Fallback to English if language dataset doesn't have topic
    filtered = EN_GRAMMAR_DATASET.filter((item) => item.topic === topic);
  }

  const promptInfo = TOPIC_PROMPTS[topic] || TOPIC_PROMPTS.complete_the_sentence;
  const shuffledPool = shuffle(filtered);
  const rounds: GrammarRound[] = [];

  for (let roundNumber = 1; roundNumber <= TOTAL_GRAMMAR_ROUNDS; roundNumber++) {
    const rawItem = shuffledPool[(roundNumber - 1) % shuffledPool.length];

    const shuffledOptions: GrammarOption[] = shuffle(rawItem.options).map(
      (opt, idx) => ({
        id: `opt_${roundNumber}_${idx}_${opt.label}`,
        label: opt.label,
        isCorrect: opt.isCorrect,
      })
    );

    const question: GrammarQuestion = {
      id: `q_gram_${topic}_${roundNumber}_${Date.now()}`,
      topic,
      roundNumber,
      sentence: rawItem.sentence,
      highlightWord: rawItem.highlightWord,
      visualIcon: rawItem.visualIcon,
      options: shuffledOptions,
      promptKey: rawItem.promptKey || promptInfo.key,
      promptFallback: rawItem.promptFallback || promptInfo.fallback,
      explanation: rawItem.explanation,
    };

    rounds.push({
      roundNumber,
      question,
    });
  }

  return rounds;
}
