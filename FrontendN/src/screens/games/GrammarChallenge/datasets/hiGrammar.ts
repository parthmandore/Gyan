/**
 * Purpose: Hindi dataset for Basic Grammar games suite.
 * Module: Grammar Challenge — Datasets
 * Folder: frontend/src/screens/games/GrammarChallenge/datasets
 */

import { GrammarQuestionItem } from '../types';

export const HI_GRAMMAR_DATASET: GrammarQuestionItem[] = [
  // ==========================================
  // AGE 6: NOUN OR VERB (संज्ञा या क्रिया)
  // ==========================================
  {
    id: 'hi_nv_1',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'हाथी',
    visualIcon: '🐘',
    options: [
      { label: 'संज्ञा (नाम)', isCorrect: true },
      { label: 'क्रिया (काम)', isCorrect: false },
    ],
    explanation: 'हाथी एक जानवर का नाम है, इसलिए यह संज्ञा है!',
  },
  {
    id: 'hi_nv_2',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'दौड़ना',
    visualIcon: '🏃',
    options: [
      { label: 'संज्ञा (नाम)', isCorrect: false },
      { label: 'क्रिया (काम)', isCorrect: true },
    ],
    explanation: 'दौड़ना एक कार्य या क्रिया है!',
  },
  {
    id: 'hi_nv_3',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'आम',
    visualIcon: '🥭',
    options: [
      { label: 'संज्ञा (नाम)', isCorrect: true },
      { label: 'क्रिया (काम)', isCorrect: false },
    ],
    explanation: 'आम एक फल का नाम है, इसलिए यह संज्ञा है!',
  },
  {
    id: 'hi_nv_4',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'हँसना',
    visualIcon: '😄',
    options: [
      { label: 'संज्ञा (नाम)', isCorrect: false },
      { label: 'क्रिया (काम)', isCorrect: true },
    ],
    explanation: 'हँसना एक क्रिया (काम) है!',
  },
  {
    id: 'hi_nv_5',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'सूरज',
    visualIcon: '☀️',
    options: [
      { label: 'संज्ञा (नाम)', isCorrect: true },
      { label: 'क्रिया (काम)', isCorrect: false },
    ],
    explanation: 'सूरज एक आकाशीय पिंड का नाम है!',
  },
  {
    id: 'hi_nv_6',
    topic: 'noun_or_verb',
    age: 6,
    sentence: 'पढ़ना',
    visualIcon: '📖',
    options: [
      { label: 'संज्ञा (नाम)', isCorrect: false },
      { label: 'क्रिया (काम)', isCorrect: true },
    ],
    explanation: 'किताब पढ़ना एक क्रिया (काम) है!',
  },

  // ==========================================
  // AGE 6: SINGULAR OR PLURAL (एकवचन या बहुवचन)
  // ==========================================
  {
    id: 'hi_sp_1',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'बिल्ली',
    visualIcon: '🐱',
    options: [
      { label: 'एकवचन (एक)', isCorrect: true },
      { label: 'बहुवचन (अनेक)', isCorrect: false },
    ],
    explanation: 'बिल्ली से केवल एक का बोध होता है!',
  },
  {
    id: 'hi_sp_2',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'बिल्लियाँ',
    visualIcon: '🐱🐱',
    options: [
      { label: 'एकवचन (एक)', isCorrect: false },
      { label: 'बहुवचन (अनेक)', isCorrect: true },
    ],
    explanation: 'बिल्लियाँ यानी एक से अधिक बिल्लियाँ!',
  },
  {
    id: 'hi_sp_3',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'किताब',
    visualIcon: '📕',
    options: [
      { label: 'एकवचन (एक)', isCorrect: true },
      { label: 'बहुवचन (अनेक)', isCorrect: false },
    ],
    explanation: 'किताब एकवचन शब्द है!',
  },
  {
    id: 'hi_sp_4',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'तारे',
    visualIcon: '⭐⭐',
    options: [
      { label: 'एकवचन (एक)', isCorrect: false },
      { label: 'बहुवचन (अनेक)', isCorrect: true },
    ],
    explanation: 'तारे बहुवचन शब्द है, यानी कई तारे!',
  },
  {
    id: 'hi_sp_5',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'लड़का',
    visualIcon: '👦',
    options: [
      { label: 'एकवचन (एक)', isCorrect: true },
      { label: 'बहुवचन (अनेक)', isCorrect: false },
    ],
    explanation: 'लड़का एकवचन है!',
  },
  {
    id: 'hi_sp_6',
    topic: 'singular_or_plural',
    age: 6,
    sentence: 'गेंदें',
    visualIcon: '⚽⚽',
    options: [
      { label: 'एकवचन (एक)', isCorrect: false },
      { label: 'बहुवचन (अनेक)', isCorrect: true },
    ],
    explanation: 'गेंदें बहुवचन रूप है!',
  },

  // ==========================================
  // AGE 6: COMPLETE THE SENTENCE (वाक्य पूरा करो)
  // ==========================================
  {
    id: 'hi_cs_1',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'लड़का गेंद से खेल ___ है।',
    visualIcon: '👦',
    options: [
      { label: 'रहा', isCorrect: true },
      { label: 'रही', isCorrect: false },
      { label: 'रहे', isCorrect: false },
    ],
    explanation: 'लड़का पुल्लिंग एकवचन है, इसलिए "रहा" आएगा!',
  },
  {
    id: 'hi_cs_2',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'लड़की मधुर गाना गा ___ है।',
    visualIcon: '👧',
    options: [
      { label: 'रही', isCorrect: true },
      { label: 'रहा', isCorrect: false },
      { label: 'रहे', isCorrect: false },
    ],
    explanation: 'लड़की स्त्रीलिंग है, इसलिए "रही" आएगा!',
  },
  {
    id: 'hi_cs_3',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'बच्चे मैदान में दौड़ ___ हैं।',
    visualIcon: '🏃‍♂️🏃‍♀️',
    options: [
      { label: 'रहे', isCorrect: true },
      { label: 'रहा', isCorrect: false },
      { label: 'रही', isCorrect: false },
    ],
    explanation: 'बच्चे बहुवचन हैं, इसलिए "रहे" आएगा!',
  },
  {
    id: 'hi_cs_4',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'गाय हरी घास खाती ___।',
    visualIcon: '🐄',
    options: [
      { label: 'है', isCorrect: true },
      { label: 'हैं', isCorrect: false },
      { label: 'हूँ', isCorrect: false },
    ],
    explanation: 'गाय एकवचन है, इसलिए "है" आएगा!',
  },
  {
    id: 'hi_cs_5',
    topic: 'complete_the_sentence',
    age: 6,
    sentence: 'मैं रोज़ स्कूल जाता ___।',
    visualIcon: '🎒',
    options: [
      { label: 'हूँ', isCorrect: true },
      { label: 'है', isCorrect: false },
      { label: 'हैं', isCorrect: false },
    ],
    explanation: '"मैं" के साथ हमेशा "हूँ" आता है!',
  },

  // ==========================================
  // AGE 7: ARTICLES / DETERMINERS (विशेषण व निर्धारक)
  // ==========================================
  {
    id: 'hi_art_1',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'मेज पर ___ सेब रखा है।',
    visualIcon: '🍎',
    options: [
      { label: 'एक', isCorrect: true },
      { label: 'अनेक', isCorrect: false },
      { label: 'सब', isCorrect: false },
    ],
    explanation: 'एकवचन संज्ञा के लिए "एक" सही निर्धारक है!',
  },
  {
    id: 'hi_art_2',
    topic: 'articles_determiners',
    age: 7,
    sentence: '___ मेरी पसंदीदा किताब है।',
    visualIcon: '📕',
    options: [
      { label: 'यह', isCorrect: true },
      { label: 'कुछ', isCorrect: false },
      { label: 'कई', isCorrect: false },
    ],
    explanation: 'नजदीक की वस्तु दर्शाने के लिए "यह" आता है!',
  },
  {
    id: 'hi_art_3',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'आसमान में ___ तारे चमक रहे हैं।',
    visualIcon: '✨',
    options: [
      { label: 'अनेक', isCorrect: true },
      { label: 'एक', isCorrect: false },
      { label: 'यह', isCorrect: false },
    ],
    explanation: 'तारे बहुत सारे हैं, इसलिए "अनेक" सही है!',
  },
  {
    id: 'hi_art_4',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'मुझे ___ पानी पीना है।',
    visualIcon: '🥛',
    options: [
      { label: 'थोड़ा', isCorrect: true },
      { label: 'एक', isCorrect: false },
      { label: 'वह', isCorrect: false },
    ],
    explanation: 'पानी के लिए मात्रात्मक शब्द "थोड़ा" आता है!',
  },
  {
    id: 'hi_art_5',
    topic: 'articles_determiners',
    age: 7,
    sentence: 'पेड़ पर ___ सुंदर चिड़िया बैठी है।',
    visualIcon: '🐦',
    options: [
      { label: 'एक', isCorrect: true },
      { label: 'सभी', isCorrect: false },
      { label: 'कई', isCorrect: false },
    ],
    explanation: 'एक चिड़िया के लिए "एक" सही है!',
  },

  // ==========================================
  // AGE 7: PRONOUNS (सर्वनाम)
  // ==========================================
  {
    id: 'hi_pro_1',
    topic: 'pronouns',
    age: 7,
    sentence: 'रोहन पढ़ रहा है। ___ बहुत होशियार है।',
    visualIcon: '👦',
    options: [
      { label: 'वह', isCorrect: true },
      { label: 'मैं', isCorrect: false },
      { label: 'हम', isCorrect: false },
    ],
    explanation: 'रोहन के स्थान पर सर्वनाम "वह" आएगा!',
  },
  {
    id: 'hi_pro_2',
    topic: 'pronouns',
    age: 7,
    sentence: 'रिया नाच रही है। ___ बहुत खुश है।',
    visualIcon: '👧',
    options: [
      { label: 'वह', isCorrect: true },
      { label: 'तुम', isCorrect: false },
      { label: 'हम', isCorrect: false },
    ],
    explanation: 'रिया के लिए सर्वनाम "वह" आएगा!',
  },
  {
    id: 'hi_pro_3',
    topic: 'pronouns',
    age: 7,
    sentence: 'अमित और मैं दोस्त हैं। ___ साथ खेलते हैं।',
    visualIcon: '👫',
    options: [
      { label: 'हम', isCorrect: true },
      { label: 'वह', isCorrect: false },
      { label: 'वे', isCorrect: false },
    ],
    explanation: 'अपने और दूसरे के लिए "हम" का प्रयोग होता है!',
  },
  {
    id: 'hi_pro_4',
    topic: 'pronouns',
    age: 7,
    sentence: 'बच्चे मैदान में हैं। ___ फुटबॉल खेल रहे हैं।',
    visualIcon: '⚽',
    options: [
      { label: 'वे', isCorrect: true },
      { label: 'वह', isCorrect: false },
      { label: 'मैं', isCorrect: false },
    ],
    explanation: 'अन्य बहुवचन के लिए "वे" आता है!',
  },
  {
    id: 'hi_pro_5',
    topic: 'pronouns',
    age: 7,
    sentence: 'मेरा नाम आरव है। ___ दूसरी कक्षा में हूँ।',
    visualIcon: '🙋‍♂️',
    options: [
      { label: 'मैं', isCorrect: true },
      { label: 'वह', isCorrect: false },
      { label: 'तुम', isCorrect: false },
    ],
    explanation: 'स्वयं के लिए सर्वनाम "मैं" आता है!',
  },

  // ==========================================
  // AGE 7: PREPOSITIONS (संबंधबोधक / स्थिति)
  // ==========================================
  {
    id: 'hi_prep_1',
    topic: 'prepositions',
    age: 7,
    sentence: 'किताब मेज के ___ रखी है।',
    visualIcon: '📖',
    options: [
      { label: 'ऊपर', isCorrect: true },
      { label: 'नीचे', isCorrect: false },
      { label: 'अंदर', isCorrect: false },
    ],
    explanation: 'किताब मेज की सतह पर यानी "ऊपर" रखी है!',
  },
  {
    id: 'hi_prep_2',
    topic: 'prepositions',
    age: 7,
    sentence: 'मछली पानी के ___ तैरती है।',
    visualIcon: '🐟',
    options: [
      { label: 'अंदर', isCorrect: true },
      { label: 'ऊपर', isCorrect: false },
      { label: 'पीछे', isCorrect: false },
    ],
    explanation: 'मछली पानी के भीतर यानी "अंदर" तैरती है!',
  },
  {
    id: 'hi_prep_3',
    topic: 'prepositions',
    age: 7,
    sentence: 'बिल्ली कुर्सी के ___ बैठी है।',
    visualIcon: '🐱',
    options: [
      { label: 'नीचे', isCorrect: true },
      { label: 'अंदर', isCorrect: false },
      { label: 'पीछे', isCorrect: false },
    ],
    explanation: 'कुर्सी के तल में यानी "नीचे" बिल्ली बैठी है!',
  },
  {
    id: 'hi_prep_4',
    topic: 'prepositions',
    age: 7,
    sentence: 'फल टोकरी के ___ रखे हैं।',
    visualIcon: '🧺',
    options: [
      { label: 'अंदर', isCorrect: true },
      { label: 'ऊपर', isCorrect: false },
      { label: 'नीचे', isCorrect: false },
    ],
    explanation: 'फल टोकरी के "अंदर" रखे जाते हैं!',
  },
  {
    id: 'hi_prep_5',
    topic: 'prepositions',
    age: 7,
    sentence: 'चिड़िया पेड़ की डाल ___ बैठी है।',
    visualIcon: '🐦',
    options: [
      { label: 'पर', isCorrect: true },
      { label: 'अंदर', isCorrect: false },
      { label: 'नीचे', isCorrect: false },
    ],
    explanation: 'डाल की सतह के लिए "पर" सही संबंधबोधक है!',
  },

  // ==========================================
  // AGE 7: BASIC TENSES (काल)
  // ==========================================
  {
    id: 'hi_ten_1',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'कल मैं नानी के घर ___ था।',
    visualIcon: '👵',
    options: [
      { label: 'गया', isCorrect: true },
      { label: 'जाऊँगा', isCorrect: false },
      { label: 'जाता', isCorrect: false },
    ],
    explanation: '"कल था" यानी भूतकाल, इसलिए "गया था" सही है!',
  },
  {
    id: 'hi_ten_2',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'रोहन रोज़ सुबह दूध ___ है।',
    visualIcon: '🥛',
    options: [
      { label: 'पीता', isCorrect: true },
      { label: 'पिया', isCorrect: false },
      { label: 'पिएगा', isCorrect: false },
    ],
    explanation: 'दैनिक आदत वर्तमान काल में होती है, इसलिए "पीता है" सही है!',
  },
  {
    id: 'hi_ten_3',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'कल हम सब चिड़ियाघर देखने ___।',
    visualIcon: '🦁',
    options: [
      { label: 'जाएँगे', isCorrect: true },
      { label: 'गए थे', isCorrect: false },
      { label: 'जाते हैं', isCorrect: false },
    ],
    explanation: 'आने वाला कल भविष्य काल है, इसलिए "जाएँगे" सही है!',
  },
  {
    id: 'hi_ten_4',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'कल रात तेज़ बारिश ___ थी।',
    visualIcon: '🌧️',
    options: [
      { label: 'हुई', isCorrect: true },
      { label: 'होगी', isCorrect: false },
      { label: 'होती', isCorrect: false },
    ],
    explanation: 'बीती हुई रात के लिए भूतकाल "हुई थी" सही है!',
  },
  {
    id: 'hi_ten_5',
    topic: 'basic_tenses',
    age: 7,
    sentence: 'कल सुबह सूरज फिर ___।',
    visualIcon: '🌅',
    options: [
      { label: 'निकलेगा', isCorrect: true },
      { label: 'निकला', isCorrect: false },
      { label: 'निकलता था', isCorrect: false },
    ],
    explanation: 'आने वाले कल के लिए भविष्य काल "निकलेगा" सही है!',
  },

  // ==========================================
  // AGE 7: SENTENCE CORRECTION (शुद्ध वाक्य चयन)
  // ==========================================
  {
    id: 'hi_sc_1',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'सही वाक्य पहचानें:',
    visualIcon: '✏️',
    options: [
      { label: 'वह गाना गाता है।', isCorrect: true },
      { label: 'वह गाना गाते है।', isCorrect: false },
      { label: 'वह गाना गाती हूँ।', isCorrect: false },
    ],
    explanation: 'पुल्लिंग एकवचन "वह" के साथ "गाता है" सही है!',
  },
  {
    id: 'hi_sc_2',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'सही वाक्य पहचानें:',
    visualIcon: '✏️',
    options: [
      { label: 'बच्चे खेल रहे हैं।', isCorrect: true },
      { label: 'बच्चे खेल रहा है।', isCorrect: false },
      { label: 'बच्चे खेल रही हैं।', isCorrect: false },
    ],
    explanation: '"बच्चे" बहुवचन हैं, इसलिए "खेल रहे हैं" सही है!',
  },
  {
    id: 'hi_sc_3',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'सही वाक्य पहचानें:',
    visualIcon: '✏️',
    options: [
      { label: 'मैं दूध पीता हूँ।', isCorrect: true },
      { label: 'मैं दूध पीता है।', isCorrect: false },
      { label: 'मैं दूध पीते हैं।', isCorrect: false },
    ],
    explanation: '"मैं" के साथ हमेशा "हूँ" का प्रयोग होता है!',
  },
  {
    id: 'hi_sc_4',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'सही वाक्य पहचानें:',
    visualIcon: '✏️',
    options: [
      { label: 'लड़की नाचती है।', isCorrect: true },
      { label: 'लड़की नाचता है।', isCorrect: false },
      { label: 'लड़की नाचते हैं।', isCorrect: false },
    ],
    explanation: 'स्त्रीलिंग "लड़की" के साथ "नाचती है" सही रूप है!',
  },
  {
    id: 'hi_sc_5',
    topic: 'sentence_correction',
    age: 7,
    sentence: 'सही वाक्य पहचानें:',
    visualIcon: '✏️',
    options: [
      { label: 'हम स्कूल जाते हैं।', isCorrect: true },
      { label: 'हम स्कूल जाता है।', isCorrect: false },
      { label: 'हम स्कूल जाती हूँ।', isCorrect: false },
    ],
    explanation: '"हम" के साथ बहुवचन क्रिया "जाते हैं" सही है!',
  },
];
