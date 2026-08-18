/**
 * Purpose: Application color palette matching the reference UI pixel-by-pixel.
 * Module: Theme
 * Folder: frontend/src/theme
 */

export const Colors = {
  primary: {
    main: '#2563EB',
    light: '#60A5FA',
    dark: '#1D4ED8',
    surface: '#EFF6FF',
    textOnPrimary: '#FFFFFF',
  },
  accent: {
    amber: '#FBBF24',
    amberDark: '#92400E',
    amberSurface: '#FEF3C7',
    amberText: '#92400E',
  },
  feedback: {
    correctMain: '#72C240',
    correctSurface: '#F0FDF4',
    correctText: '#166534',
    correctBadge: '#4A941C',
    highlightMain: '#F5B719',
    highlightSurface: '#FEF9C3',
    highlightText: '#854D0E',
    highlightBadge: '#C58700',
  },
  neutral: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textDark: '#0F2042',
    textMuted: '#475569',
    border: '#E2E8F0',
    shadow: '#0F172A26',
    backdrop: 'rgba(15, 23, 42, 0.6)',
  },
  /** Rich Scenery Color Tokens */
  scene: {
    skyTop: '#38BDF8',
    skyMid: '#60A5FA',
    skySoft: '#93C5FD',
    skyHorizon: '#E0F2FE',
    birdMuted: 'rgba(30, 58, 138, 0.45)',
    sunCore: '#F59E0B',
    sunBorder: '#FEF08A',
    sunGlow: 'rgba(254, 240, 138, 0.55)',
    treeTrunk: '#78350F',
    treeLeafDark: '#14532D',
    treeLeafMid: '#166534',
    treeLeafLight: '#22C55E',
  },
  /** Stage Panel Tokens framing interactive content */
  stagePanel: {
    bg: 'rgba(255, 255, 255, 0.94)',
    border: '#BAE6FD',
    borderOuter: '#FFFFFF',
    shadow: '#0F204240',
  },
  /** Reference-Matched LetterTile Color Palette */
  tile: {
    defaultBg: '#FFFFFF',
    defaultBorder: '#FFFFFF',
    // 4 Reference Palette Options: Coral Orange, Grass Green, Magenta Purple, Gold Yellow
    orangeBg: '#EE7A38',
    orangeBevel: '#C45012',
    greenBg: '#72C240',
    greenBevel: '#4A941C',
    purpleBg: '#9D3597',
    purpleBevel: '#6D1567',
    yellowBg: '#F5B719',
    yellowBevel: '#C58700',
    // Tile states
    correctBg: '#72C240',
    correctBevel: '#4A941C',
    incorrectBg: '#EF4444',
    incorrectBevel: '#B91C1C',
    highlightedBg: '#F5B719',
    highlightedBevel: '#C58700',
    letterText: '#0F2042',
    badgeText: '#FFFFFF',
  },
  /** Top Bar & Header Colors */
  header: {
    topBarNavy: '#1B2B5A',
    starPillNavy: '#0E1B3D',
    starPillBorder: '#2A5298',
    exitRed: '#E54B4D',
  },
  /** ProgressStarTrail Tokens */
  star: {
    filledBg: '#FFD700',
    filledBorder: '#EAB308',
    unfilledBg: 'transparent',
    unfilledBorder: '#233866',
    text: '#FFD700',
    unfilledText: '#233866',
    redFilledBg: '#EF4444',
    redFilledBorder: '#DC2626',
    redText: '#FFFFFF',
  },
  /** Instruction Card Tokens */
  instructionCard: {
    bg: '#DDF4FF',
    border: '#FFFFFF',
    text: '#0F2042',
    shadow: '#1A3B66',
    speakerBg: '#FFB703',
    speakerBorder: '#FFFFFF',
  },
  celebration: {
    overlayBg: '#F0FDF4EB',
    badgeBg: '#F0FDF4',
    badgeText: '#166534',
    badgeBorder: '#22C55E',
  },
  teaching: {
    overlayBg: '#EFF6FFFA',
    cardBg: '#FFFFFF',
    cardBorder: '#60A5FA',
    headerText: '#1E40AF',
    exampleText: '#1D4ED8',
    buttonBg: '#2563EB',
    buttonText: '#FFFFFF',
  },
  sessionComplete: {
    cardBg: '#F0F9FF',
    cardBorder: '#BAE6FD',
    xpBarTrack: '#E2E8F0',
    xpBarFill: '#6366F1',
    xpText: '#4338CA',
    levelBadgeBg: '#7C3AED',
    levelBadgeText: '#FFFFFF',
    badgeCardBg: '#FEF3C7',
    badgeCardBorder: '#FCD34D',
    badgeCardText: '#92400E',
    badgeIcon: '#D97706',
    scoreText: '#166534',
  },
  /** CapitalSmallMatch Connector Line Tokens */
  connector: {
    line: '#10B981',
    glow: '#34D399',
    pulse: '#A7F3D0',
    shadow: '#047857',
  },
  /** Evening Sunset Scene Color Tokens */
  sceneEvening: {
    skyGradient: ['#2E1065', '#581C87', '#831843', '#BE185D', '#F43F5E', '#FB923C'],
    sunCore: '#F97316',
    sunBorder: '#FED7AA',
    sunGlow: 'rgba(249, 115, 22, 0.55)',
    mountainDark: '#1E1B4B',
    mountainMid: '#311B92',
    hillBack: '#6B21A8',
    hillMid: '#831843',
    hillFront: '#4C1D95',
    treeTrunk: '#451A03',
    treeLeafDark: '#3B0764',
    treeLeafMid: '#581C87',
    treeLeafLight: '#7E22CE',
    bushDark: '#2E1035',
    bushMid: '#431448',
    bushFront: '#581C5C',
    star: '#FDE047',
  },
  /** Hub / Catalog Entry Scene Color Tokens */
  sceneHub: {
    skyGradient: ['#0E7490', '#06B6D4', '#67E8F9', '#FDE047', '#FEF08A'] as [string, string, ...string[]],
    sunCore: '#F59E0B',
    sunBorder: '#FEF08A',
    sunGlow: 'rgba(251, 191, 36, 0.45)',
    mountainDark: '#164E63',
    mountainMid: '#155E75',
    hillBack: '#0F766E',
    hillMid: '#0D9488',
    hillFront: '#059669',
    treeTrunk: '#78350F',
    treeLeafDark: '#047857',
    treeLeafMid: '#059669',
    treeLeafLight: '#10B981',
    bushDark: '#064E3B',
    bushMid: '#047857',
    bushFront: '#059669',
  },
  /** Game Catalog Card & Header Tokens */
  catalogCard: {
    highlightRibbon: 'rgba(255, 255, 255, 0.35)',
    iconBackingBg: 'rgba(255, 255, 255, 0.22)',
    iconBackingBorder: 'rgba(255, 255, 255, 0.45)',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    titleText: '#FFFFFF', // Contrast ratio >= 5.5:1 (WCAG AA)
    descriptionText: 'rgba(255, 255, 255, 0.95)', // Contrast ratio >= 4.8:1 (WCAG AA)
  },
};
