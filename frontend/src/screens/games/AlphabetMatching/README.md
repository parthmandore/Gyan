# Alphabet Matching Game Module

## Purpose of Module
An educational game module designed to help early learners recognize and match letters (alphabets) through interactive visual and audio feedback.

## Folder Overview
```
frontend/src/screens/games/AlphabetMatching/
├── ModeSelectionScreen.tsx          # Game mode selection screen (Alphabetical / Mixed)
├── GameScreen.tsx                   # Core gameplay screen (Grid rendering, audio playback, non-punitive teaching)
├── SessionCompleteScreen.tsx        # Session completion, XP/rewards, and earned badges screen
├── letterExamples.ts                # Multilingual A-Z example word and phrase mappings (en/hi/mr)
├── index.ts                         # Public barrel exports
├── types.ts                         # Type interfaces for local state and navigation
├── README.md                        # Module documentation & accessibility audit report
├── utils/                           # Spatial grid separation & difficulty configuration
└── store/                           # Zustand local state stores
    ├── alphabetMatchingStore.ts     # Game progress & score state
    └── speechPlaybackStore.ts       # Audio playback state
```

---

## Final Accessibility & Quality Audit Report

### 1. Touch Target Size (84dp Enforcement)
- **Base Rule**: All touchable targets utilize `BigTouchTarget`, which enforces a base style of `minWidth: 84, minHeight: 84` (exceeding standard 48dp Android / 44pt iOS guidance for young children).
- **Audited Components**: `ModeSelectionScreen` (mode cards), `GameScreen` (exit button, audio cue banner, letter tiles), `SessionCompleteScreen` (Play Again, Choose Another Game buttons), `TeachingOverlay` (Got it button), `FriendlyModal` (dismiss button), `MascotCharacter` (mascot container).
- **Fix Applied**: In `ModeSelectionScreen.tsx`, the `styles.previewButton` had an explicit `minHeight: 48` overriding `BigTouchTarget`'s default `minHeight: 84`. Updated `previewButton` to `minHeight: 84`. Added `accessibilityRole="header"` to the header title.

### 2. Color Palette & Contrast Verification
- **Token Migration**: Audited all component files for un-tokenized inline hex values. Migrated 7 inline values in `FriendlyModal.tsx` and `MascotCharacter.tsx` to centralized tokens in `theme/colors.ts` (added `Colors.neutral.backdrop`).
- **Contrast Ratios**: Verified all text-bearing surfaces against WCAG AA standards ($\ge 4.5:1$ for normal text):
  - Primary text on background: 13.58:1 (AAA)
  - Tile text on default tile: 14.63:1 (AAA)
  - Teaching header text on card: 8.72:1 (AAA)
  - XP count text on XP card: 7.14:1 (AAA)
  - Level badge text on badge bg: 6.26:1 (AA)
  - Earned badge text on badge card bg: 5.71:1 (AA)
  - Score summary text on green card: 6.49:1 (AA)

### 3. Non-Color State Indicators
- **LetterTile Component**: State changes do not rely on color alone.
  - `correct` state: Green background + **`✓`** badge icon in top-right corner.
  - `highlighted` state: Blue background + **`★`** badge icon in top-right corner.
  - `incorrect` state: Red background + **`✕`** badge icon.
- **Non-Punitive Pedagogical Design**: Confirmed in `GameScreen.tsx` that when a wrong tile is tapped, its state remains `'default'` (never marked as `'incorrect'`). Only the target correct letter receives the `'highlighted'` state with the **`★`** badge to guide the child gently.
- **LetterTile Component Reusability**: Note that `LetterTile`'s `'incorrect'` state (red background + **`✕`** badge) is intentionally retained in the shared component for potential reuse in other games with different feedback needs, not leftover from an earlier punitive design that was later corrected.

### 4. String Localization (i18next)
- **Centralized Keys**: Added 27 new translation keys across `src/localization/locales/en.json`, `hi.json`, and `mr.json` under `accessibility` and `game` namespaces.
- **Refactored Codebase**: Replaced all hardcoded English strings in `GameScreen.tsx`, `SessionCompleteScreen.tsx`, `TeachingOverlay.tsx`, `CelebrationOverlay.tsx`, `FriendlyModal.tsx`, `MascotCharacter.tsx`, `ProgressStarTrail.tsx`, and `LetterTile.tsx` with `t()` translation calls.

### 5. Reduced Motion Accessibility
- **Setting Checks**: Integrated `AccessibilityInfo.isReduceMotionEnabled()` checks and `reduceMotionChanged` event listeners across all animated elements in the module.
- **Fallback Behavior**:
  - `BigTouchTarget`: Disables scale spring press transform.
  - `CelebrationOverlay`: Skips Lottie confetti animation; presents star-burst and text immediately at opacity 1 / scale 1.
  - `TeachingOverlay`: Disables continuous card glow pulse loop and scale entrance spring; displays card statically.
  - `MascotCharacter`: Disables Lottie `autoPlay` and `loop`; displays static mascot character image.
  - `ProgressStarTrail`: Disables scale pop spring on earned star increment.
  - `GameScreen`: Disables grid entrance scale/opacity animation and loading speaker pulse loop.
  - `SessionCompleteScreen`: Disables staggered scale/slide-up entrance animations for mascot, title, cards, and buttons.
  - `ModeSelectionScreen`: Disables header and card entrance slide-up springs.

### 6. Screen Reader End-to-End Navigability
- **Header Roles**: Added `accessibilityRole="header"` to screen title headers in `ModeSelectionScreen`, `GameScreen`, and `SessionCompleteScreen`.
- **Live Regions**: Overlays (`CelebrationOverlay`, `TeachingOverlay`) use `accessibilityRole="alert"` and `accessibilityLiveRegion="assertive"`.
- **Progress Tracking**: `ProgressStarTrail` uses `accessibilityRole="progressbar"` with dynamic `accessibilityValue` and localized screen reader summary strings.
- **Badge Descriptions**: Earned badges in `SessionCompleteScreen` read localized description keys (e.g. `"Badge earned: Quick Learner"`), never raw IDs.

### 7. Zero UI Timers
- Confirmed zero countdown displays, clock icons, or time-pressure UI elements exist anywhere in the child interface.
- Wall-clock time tracking (`sessionStartTime`) is recorded silently and sent to Backend upon session completion (`POST /api/progress/submit`) for progress analytics, without exposing time pressure to the child.

### 8. Known Open Item: Audio Failure Visual Fallback
- **Issue**: To preserve target letter secrecy, the target letter is not revealed visually in the header banner. If letter audio fails after retries, `hasPlayedOnce` is set to keep the round answerable, but a child with severe hearing impairment would have no visual prompt for that specific round.
- **Status**: Documented as a known architectural item for product/pedagogy review in future iterations (e.g. introducing a hint button or visual clue toggle).

### 9. Performance & Re-render Profiling
- Zustand selectors in `useAlphabetMatchingStore` and `useSpeechPlaybackStore` use primitive field subscriptions (e.g. `useAlphabetMatchingStore(state => state.roundIndex)`) to prevent unnecessary component re-renders during gameplay transitions.

### 10. Localization Pattern Consistency
- **UI Strings**: Resolved through `i18next` `t('namespace.key')` referencing `en.json`, `hi.json`, `mr.json`.
- **Content Mock (`letterExamples.ts`)**: `letterExamples.ts` uses an inline tri-lingual object `{ en, hi, mr }` accessed directly by language key. This is a temporary client-side mock pattern used because Backend is offline. Note: The actual `/api/games/{game_type}/content` contract takes a `?lang=` query parameter and returns single-language content already filtered by Backend. Therefore, the mock's shape (and not just its data source) will need to change when real Backend content replaces it, as Backend will not return all three languages in a single response.

