/**
 * Purpose: Marathi dataset for Basic Grammar games suite.
 * Module: Grammar Challenge — Datasets
 * Folder: frontend/src/screens/games/GrammarChallenge/datasets
 */

import { GrammarQuestionItem } from '../types';

export const MR_GRAMMAR_DATASET: GrammarQuestionItem[] = [
  // ==========================================
  // AGE 6: NOUN OR VERB (नाम किंवा क्रियापद)
  // ==========================================
  {
    id: 'mr_nv_1',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'हत्ती',
    visualIcon: '🐘',
    options: [
      { label: 'नाम (नाव)', isCorrect: true },
      { label: 'क्रियापद (कृती)', isCorrect: false },
    ],
    explanation: 'हत्ती हे एका प्राण्याचे नाव आहे, म्हणून ते नाम आहे!',
  },
  {
    id: 'mr_nv_2',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'धावणे',
    visualIcon: '🏃',
    options: [
      { label: 'नाम (नाव)', isCorrect: false },
      { label: 'क्रियापद (कृती)', isCorrect: true },
    ],
    explanation: 'धावणे ही एक कृती आहे, म्हणून ते क्रियापद आहे!',
  },
  {
    id: 'mr_nv_3',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'आंबा',
    visualIcon: '🥭',
    options: [
      { label: 'नाम (नाव)', isCorrect: true },
      { label: 'क्रियापद (कृती)', isCorrect: false },
    ],
    explanation: 'आंबा हे एका फळाचे नाव आहे!',
  },
  {
    id: 'mr_nv_4',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'हसणे',
    visualIcon: '😄',
    options: [
      { label: 'नाम (नाव)', isCorrect: false },
      { label: 'क्रियापद (कृती)', isCorrect: true },
    ],
    explanation: 'हसणे ही एक कृती आहे!',
  },
  {
    id: 'mr_nv_5',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'सूर्य',
    visualIcon: '☀️',
    options: [
      { label: 'नाम (नाव)', isCorrect: true },
      { label: 'क्रियापद (कृती)', isCorrect: false },
    ],
    explanation: 'सूर्य हे आकाशातील सूर्याचे नाव आहे!',
  },
  {
    id: 'mr_nv_6',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'वाचणे',
    visualIcon: '📖',
    options: [
      { label: 'नाम (नाव)', isCorrect: false },
      { label: 'क्रियापद (कृती)', isCorrect: true },
    ],
    explanation: 'पुस्तक वाचणे ही कृती आहे, म्हणून ते क्रियापद आहे!',
  },

  // ==========================================
  // AGE 6: SINGULAR OR PLURAL (एकवचन किंवा अनेकवचन)
  // ==========================================
  {
    id: 'mr_sp_1',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'मांजर',
    visualIcon: '🐱',
    options: [
      { label: 'एकवचन (एक)', isCorrect: true },
      { label: 'अनेकवचन (अनेक)', isCorrect: false },
    ],
    explanation: 'मांजर म्हणजे एकच मांजर!',
  },
  {
    id: 'mr_sp_2',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'मांजरी',
    visualIcon: '🐱🐱',
    options: [
      { label: 'एकवचन (एक)', isCorrect: false },
      { label: 'अनेकवचन (अनेक)', isCorrect: true },
    ],
    explanation: 'मांजरी म्हणजे एकापेक्षा जास्त मांजरी!',
  },
  {
    id: 'mr_sp_3',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'पुस्तक',
    visualIcon: '📕',
    options: [
      { label: 'एकवचन (एक)', isCorrect: true },
      { label: 'अनेकवचन (अनेक)', isCorrect: false },
    ],
    explanation: 'पुस्तक हे एकवचन रूप आहे!',
  },
  {
    id: 'mr_sp_4',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'तारे',
    visualIcon: '⭐⭐',
    options: [
      { label: 'एकवचन (एक)', isCorrect: false },
      { label: 'अनेकवचन (अनेक)', isCorrect: true },
    ],
    explanation: 'तारे म्हणजे आकाशातील अनेक तारे!',
  },
  {
    id: 'mr_sp_5',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'मुलगा',
    visualIcon: '👦',
    options: [
      { label: 'एकवचन (एक)', isCorrect: true },
      { label: 'अनेकवचन (अनेक)', isCorrect: false },
    ],
    explanation: 'मुलगा म्हणजे एकच मुलगा!',
  },
  {
    id: 'mr_sp_6',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'झाडे',
    visualIcon: '🌳🌳',
    options: [
      { label: 'एकवचन (एक)', isCorrect: false },
      { label: 'अनेकवचन (अनेक)', isCorrect: true },
    ],
    explanation: 'झाडे म्हणजे अनेक झाडे!',
  },

  // ==========================================
  // AGE 6: COMPLETE THE SENTENCE (वाक्य पूर्ण करा)
  // ==========================================
  {
    id: 'mr_cs_1',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'मुलगा चेंडूने खेळत ___ आहे.',
    visualIcon: '👦',
    options: [
      { label: 'आहे', isCorrect: true },
      { label: 'आहेत', isCorrect: false },
      { label: 'आहोत', isCorrect: false },
    ],
    explanation: 'मुलगा एकवचन आहे, म्हणून "आहे" येईल!',
  },
  {
    id: 'mr_cs_2',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'मुले मैदानात पळत ___ आहेत.',
    visualIcon: '🏃‍♂️🏃‍♀️',
    options: [
      { label: 'आहेत', isCorrect: true },
      { label: 'आहे', isCorrect: false },
      { label: 'आहोत', isCorrect: false },
    ],
    explanation: 'मुले अनेकवचन आहेत, म्हणून "आहेत" येईल!',
  },
  {
    id: 'mr_cs_3',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'मी छान चित्र काढत ___ आहे.',
    visualIcon: '🎨',
    options: [
      { label: 'आहे', isCorrect: true },
      { label: 'आहेत', isCorrect: false },
      { label: 'आहोत', isCorrect: false },
    ],
    explanation: 'एकवचनी "मी" सोबत "आहे" येते!',
  },
  {
    id: 'mr_cs_4',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'आम्ही सगळे मित्र आनंदी ___ आहोत.',
    visualIcon: '👫',
    options: [
      { label: 'आहोत', isCorrect: true },
      { label: 'आहे', isCorrect: false },
      { label: 'आहेत', isCorrect: false },
    ],
    explanation: '"आम्ही" सोबत "आहोत" येते!',
  },
  {
    id: 'mr_cs_5',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'गाय हिरवे गवत खात ___ आहे.',
    visualIcon: '🐄',
    options: [
      { label: 'आहे', isCorrect: true },
      { label: 'आहेत', isCorrect: false },
      { label: 'आहोत', isCorrect: false },
    ],
    explanation: 'गाय एकवचनी असल्याने "आहे" येईल!',
  },

  // ==========================================
  // AGE 7: ARTICLES / DETERMINERS (निर्धारक व दर्शक शब्द)
  // ==========================================
  {
    id: 'mr_art_1',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'टेबलावर ___ गोड आंबा ठेवला आहे.',
    visualIcon: '🥭',
    options: [
      { label: 'एक', isCorrect: true },
      { label: 'अनेक', isCorrect: false },
      { label: 'सर्व', isCorrect: false },
    ],
    explanation: 'एकवचनी वस्तूसाठी "एक" योग्य शब्द आहे!',
  },
  {
    id: 'mr_art_2',
    topic: 'articles_determiners',
    age: 7,
    sentence: '___ माझे आवडते पुस्तक आहे.',
    visualIcon: '📕',
    options: [
      { label: 'हे', isCorrect: true },
      { label: 'काही', isCorrect: false },
      { label: 'सर्व', isCorrect: false },
    ],
    explanation: 'जवळची वस्तू दाखवण्यासाठी "हे" योग्य दर्शक शब्द आहे!',
  },
  {
    id: 'mr_art_3',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'आकाशात ___ चांदण्या चमकत आहेत.',
    visualIcon: '✨',
    options: [
      { label: 'अनेक', isCorrect: true },
      { label: 'एक', isCorrect: false },
      { label: 'हे', isCorrect: false },
    ],
    explanation: 'चांदण्या खूप साऱ्या असल्याने "अनेक" योग्य आहे!',
  },
  {
    id: 'mr_art_4',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'मला प्यायला ___ पाणी हवे आहे.',
    visualIcon: '🥛',
    options: [
      { label: 'थोडे', isCorrect: true },
      { label: 'एक', isCorrect: false },
      { label: 'ते', isCorrect: false },
    ],
    explanation: 'पाण्यासाठी "थोडे" हे प्रमाणवाचक विशेषण वापरतात!',
  },
  {
    id: 'mr_art_5',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'झाडावर ___ गोड गाणारा पक्षी बसला आहे.',
    visualIcon: '🐦',
    options: [
      { label: 'एक', isCorrect: true },
      { label: 'सर्व', isCorrect: false },
      { label: 'काही', isCorrect: false },
    ],
    explanation: 'एका पक्ष्यासाठी "एक" योग्य आहे!',
  },

  // ==========================================
  // AGE 7: PRONOUNS (सर्वनाम)
  // ==========================================
  {
    id: 'mr_pro_1',
    topic: 'pronouns',
    age: 7,
    sentence: 'रोहन हुशार आहे. ___ अभ्यास करतो.',
    visualIcon: '👦',
    options: [
      { label: 'तो', isCorrect: true },
      { label: 'ती', isCorrect: false },
      { label: 'ते', isCorrect: false },
    ],
    explanation: 'मुलगा (पुल्लिंगी) नामासाठी सर्वनाम "तो" येते!',
  },
  {
    id: 'mr_pro_2',
    topic: 'pronouns',
    age: 7,
    sentence: 'रिया नाचत आहे. ___ खूप आनंदी आहे.',
    visualIcon: '👧',
    options: [
      { label: 'ती', isCorrect: true },
      { label: 'तो', isCorrect: false },
      { label: 'ते', isCorrect: false },
    ],
    explanation: 'मुलगी (स्त्रीलिंगी) नामासाठी सर्वनाम "ती" येते!',
  },
  {
    id: 'mr_pro_3',
    topic: 'pronouns',
    age: 7,
    sentence: 'अमित आणि मी मित्र आहोत. ___ सोबत खेळतो.',
    visualIcon: '👫',
    options: [
      { label: 'आम्ही', isCorrect: true },
      { label: 'तो', isCorrect: false },
      { label: 'ती', isCorrect: false },
    ],
    explanation: 'स्वतः आणि इतरांसाठी "आम्ही" हे सर्वनाम येते!',
  },
  {
    id: 'mr_pro_4',
    topic: 'pronouns',
    age: 7,
    sentence: 'मुले मैदानात आहेत. ___ क्रिकेट खेळत आहेत.',
    visualIcon: '⚽',
    options: [
      { label: 'ती', isCorrect: true },
      { label: 'तो', isCorrect: false },
      { label: 'आम्ही', isCorrect: false },
    ],
    explanation: 'अनेकवचनी मुलांसाठी "ती मुले" सर्वनाम "ती" येते!',
  },
  {
    id: 'mr_pro_5',
    topic: 'pronouns',
    age: 7,
    sentence: 'माझे नाव आरव आहे. ___ दुसऱ्या इयत्तेत आहे.',
    visualIcon: '🙋‍♂️',
    options: [
      { label: 'मी', isCorrect: true },
      { label: 'तो', isCorrect: false },
      { label: 'तू', isCorrect: false },
    ],
    explanation: 'स्वतःचा उल्लेख करताना "मी" वापरतात!',
  },

  // ==========================================
  // AGE 7: PREPOSITIONS (शब्दयोगी अव्यये / स्थिती)
  // ==========================================
  {
    id: 'mr_prep_1',
    topic: 'prepositions',
    age: 7,
    sentence: 'पुस्तक टेबलाच्या ___ आहे.',
    visualIcon: '📖',
    options: [
      { label: 'वर', isCorrect: true },
      { label: 'खाली', isCorrect: false },
      { label: 'आत', isCorrect: false },
    ],
    explanation: 'पुस्तक टेबलाच्या पृष्ठभागावर म्हणजेच "वर" आहे!',
  },
  {
    id: 'mr_prep_2',
    topic: 'prepositions',
    age: 7,
    sentence: 'मासा पाण्याच्या ___ पोहतो.',
    visualIcon: '🐟',
    options: [
      { label: 'आत', isCorrect: true },
      { label: 'वर', isCorrect: false },
      { label: 'मागे', isCorrect: false },
    ],
    explanation: 'मासा पाण्याच्या "आत" राहतो आणि पोहतो!',
  },
  {
    id: 'mr_prep_3',
    topic: 'prepositions',
    age: 7,
    sentence: 'मांजर खुर्चीच्या ___ बसली आहे.',
    visualIcon: '🐱',
    options: [
      { label: 'खाली', isCorrect: true },
      { label: 'आत', isCorrect: false },
      { label: 'मागे', isCorrect: false },
    ],
    explanation: 'खुर्चीच्या तळाशी म्हणजे "खाली" मांजर बसली आहे!',
  },
  {
    id: 'mr_prep_4',
    topic: 'prepositions',
    age: 7,
    sentence: 'फळे टोपलीच्या ___ ठेवली आहेत.',
    visualIcon: '🧺',
    options: [
      { label: 'आत', isCorrect: true },
      { label: 'वर', isCorrect: false },
      { label: 'खाली', isCorrect: false },
    ],
    explanation: 'फळे टोपलीच्या "आत" ठेवली जातात!',
  },
  {
    id: 'mr_prep_5',
    topic: 'prepositions',
    age: 7,
    sentence: 'पक्षी झाडाच्या फांदी___ बसला आहे.',
    visualIcon: '🐦',
    options: [
      { label: 'वर', isCorrect: true },
      { label: 'आत', isCorrect: false },
      { label: 'खाली', isCorrect: false },
    ],
    explanation: 'पक्षी फांदीवर म्हणजे "वर" बसतो!',
  },

  // ==========================================
  // AGE 7: BASIC TENSES (काळ)
  // ==========================================
  {
    id: 'mr_ten_1',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'काल मी आजीच्या घरी ___ होतो.',
    visualIcon: '👵',
    options: [
      { label: 'गेलो', isCorrect: true },
      { label: 'जाईन', isCorrect: false },
      { label: 'जातो', isCorrect: false },
    ],
    explanation: '"काल" म्हणजे भूतकाळ, म्हणून "गेलो होतो" योग्य आहे!',
  },
  {
    id: 'mr_ten_2',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'रोहन रोज सकाळी दूध ___ आहे.',
    visualIcon: '🥛',
    options: [
      { label: 'पितो', isCorrect: true },
      { label: 'प्यायला', isCorrect: false },
      { label: 'पिईल', isCorrect: false },
    ],
    explanation: 'दैनंदिन सवय वर्तमानकाळात "पितो" अशी दर्शवतात!',
  },
  {
    id: 'mr_ten_3',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'उद्या आम्ही सर्व प्राणीसंग्रहालयात ___.',
    visualIcon: '🦁',
    options: [
      { label: 'जाऊ', isCorrect: true },
      { label: 'गेलो', isCorrect: false },
      { label: 'जातो', isCorrect: false },
    ],
    explanation: '"उद्या" म्हणजे भविष्यकाळ, म्हणून "जाऊ" योग्य आहे!',
  },
  {
    id: 'mr_ten_4',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'काल रात्री खूप पाऊस ___ होता.',
    visualIcon: '🌧️',
    options: [
      { label: 'पडला', isCorrect: true },
      { label: 'पडेल', isCorrect: false },
      { label: 'पडतो', isCorrect: false },
    ],
    explanation: 'गेलेल्या रात्रीसाठी भूतकाळात "पडला होता" योग्य आहे!',
  },
  {
    id: 'mr_ten_5',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'उद्या सकाळी सूर्य पुन्हा ___.',
    visualIcon: '🌅',
    options: [
      { label: 'उगवेल', isCorrect: true },
      { label: 'उगवला', isCorrect: false },
      { label: 'उगवत होता', isCorrect: false },
    ],
    explanation: 'येणाऱ्या उद्यासाठी भविष्यकाळात "उगवेल" योग्य आहे!',
  },

  // ==========================================
  // AGE 7: SENTENCE CORRECTION (अचूक वाक्य निवड)
  // ==========================================
  {
    id: 'mr_sc_1',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'अचूक वाक्य निवडा:',
    visualIcon: '✏️',
    options: [
      { label: 'तो छान गाणे गातो.', isCorrect: true },
      { label: 'तो छान गाणे गाते.', isCorrect: false },
      { label: 'तो छान गाणे गातात.', isCorrect: false },
    ],
    explanation: 'पुल्लिंगी कर्ता "तो" सोबत "गातो" योग्य क्रियापद आहे!',
  },
  {
    id: 'mr_sc_2',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'अचूक वाक्य निवडा:',
    visualIcon: '✏️',
    options: [
      { label: 'मुले मैदानात खेळत आहेत.', isCorrect: true },
      { label: 'मुले मैदानात खेळत आहे.', isCorrect: false },
      { label: 'मुले मैदानात खेळत आहोत.', isCorrect: false },
    ],
    explanation: 'अनेकवचनी "मुले" सोबत "खेळत आहेत" योग्य आहे!',
  },
  {
    id: 'mr_sc_3',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'अचूक वाक्य निवडा:',
    visualIcon: '✏️',
    options: [
      { label: 'मी दूध पितो.', isCorrect: true },
      { label: 'मी दूध पितात.', isCorrect: false },
      { label: 'मी दूध पित आहेस.', isCorrect: false },
    ],
    explanation: '"मी" सोबत "पितो" योग्य रूप आहे!',
  },
  {
    id: 'mr_sc_4',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'अचूक वाक्य निवडा:',
    visualIcon: '✏️',
    options: [
      { label: 'मुलगी सुंदर नाचते.', isCorrect: true },
      { label: 'मुलगी सुंदर नाचतो.', isCorrect: false },
      { label: 'मुलगी सुंदर नाचतात.', isCorrect: false },
    ],
    explanation: 'स्त्रीलिंगी "मुलगी" सोबत "नाचते" योग्य आहे!',
  },
  {
    id: 'mr_sc_5',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'अचूक वाक्य निवडा:',
    visualIcon: '✏️',
    options: [
      { label: 'आम्ही शाळेत जातो.', isCorrect: true },
      { label: 'आम्ही शाळेत जातोस.', isCorrect: false },
      { label: 'आम्ही शाळेत जाते.', isCorrect: false },
    ],
    explanation: '"आम्ही" सोबत "जातो" योग्य क्रियापद आहे!',
  },
];
