# 🎮 Game Registry Architecture & Developer Guide

## 🚨 MANDATORY REQUIREMENT FOR ALL FUTURE GAMES
> **CRITICAL RULE**: Every new game created in this repository (e.g., Game #3, Game #4, Game #5) **MUST** be registered in `frontend/src/config/gameRegistry.ts` with an accurate `supportedLanguages` array.
>
> **Failure to register a game in `gameRegistry.ts` will cause it to silently go missing from the Game Catalog for ALL languages.**

---

## 📌 How Game Registration Works

The application uses a **centralized, registry-driven catalog system**. The `GameCatalogScreen` inspects `GAME_REGISTRY` in `gameRegistry.ts` and dynamically filters games based on the user's active learning language (`'en'`, `'hi'`, `'mr'`).

### File Location
`frontend/src/config/gameRegistry.ts`

---

## 📝 Step-by-Step Checklist for Adding a New Game

When adding a new game (e.g., `WordBuilder` or `PhonicsMatch`):

1. **Create the Game Directory Structure**:
   ```
   src/screens/games/WordBuilder/
   ├── GameScreen.tsx
   ├── ModeSelectionScreen.tsx
   ├── types.ts
   └── index.ts
   ```

2. **Register the Stack Navigator in `GamesNavigator.tsx`**:
   Add the new game screen routes to `src/navigation/GamesNavigator.tsx`.

3. **Add i18n Translation Keys**:
   Add title and description keys in `src/localization/locales/en.json`, `hi.json`, and `mr.json`:
   ```json
   "games": {
     "wordBuilder": {
       "title": "Word Builder",
       "description": "Construct words from letter blocks!"
     }
   }
   ```

4. **Register the Game in `gameRegistry.ts`**:
   Add an entry to the `GAME_REGISTRY` array:
   ```typescript
   {
     id: 'word_builder',
     titleKey: 'games.wordBuilder.title',
     descriptionKey: 'games.wordBuilder.description',
     iconAsset: '🧩',
     bgColor: '#EC4899',
     bevelColor: '#BE185D',
     navigatorRoute: 'WordBuilderModeSelection',
     supportedLanguages: ['en'], // Add 'hi', 'mr' ONLY when real Hindi/Marathi content exists
   }
   ```

---

## ⚠️ Important Rules for `supportedLanguages`

- **Do NOT mark a language as supported until real content exists for it.**
- If a game only has English content built, set `supportedLanguages: ['en']`.
- When Hindi or Marathi content is verified and production-ready, update `supportedLanguages: ['en', 'hi', 'mr']`.
- If a language has 0 registered games, `GameCatalogScreen` automatically presents a friendly mascot empty state directing the user to switch languages.
