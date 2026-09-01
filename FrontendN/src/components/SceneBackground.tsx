/**
 * Purpose: Code-drawn cartoon illustrated scene background component.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React from 'react';
import { CartoonBackground } from './CartoonBackground';

export const SceneBackground: React.FC = React.memo(() => {
  return <CartoonBackground />;
});

SceneBackground.displayName = 'SceneBackground';
