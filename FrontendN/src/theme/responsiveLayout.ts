/**
 * Purpose: Centralized responsive sizing and layout utilities for Gyan educational games.
 *          Provides screen-size breakpoints, responsive container widths, and compact
 *          spacings ensuring gameplay never requires scrolling on mobile devices.
 * Module: Theme
 * Folder: frontend/src/theme
 */

export interface ResponsiveDimensions {
  isCompact: boolean; // width <= 360px
  isStandard: boolean; // 361px - 414px
  isWide: boolean; // > 414px
  containerWidth: number;
  cloudClearance: number;
  cardWidth: number;
}

/**
 * Returns standard playable container width capping content cleanly on tablets
 * while giving full breathing room on small phones.
 */
export const getContainerWidth = (screenWidth: number): number => {
  if (screenWidth <= 360) {
    return screenWidth - 16;
  }
  if (screenWidth <= 414) {
    return screenWidth - 24;
  }
  return Math.min(screenWidth - 32, 440);
};

/**
 * Calculates responsive top clearance for cartoon clouds.
 * Replaces fixed 125px clearance with a slim 12-28px spacer so game content
 * fits entirely on mobile screens without requiring scrolling.
 */
export const getCloudClearanceHeight = (screenHeight: number): number => {
  if (screenHeight <= 680) {
    return 8;
  }
  if (screenHeight <= 800) {
    return 16;
  }
  return 24;
};

/**
 * Calculates responsive 2-column option card width.
 */
export const getOptionCardWidth = (screenWidth: number): number => {
  const container = getContainerWidth(screenWidth);
  return Math.floor((container - 16) / 2);
};
