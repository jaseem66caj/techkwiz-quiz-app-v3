// ===================================================================
// TechKwiz Theme Utility Functions
// ===================================================================
// This file contains utility functions for managing themes in the
// TechKwiz application. These functions provide helper methods for
// theme selection, validation, and management.

import { ProfileTheme } from '@/types/theme';
import { THEMES, getThemeById as _getThemeById } from '@/data/themes';

/**
 * Get all available themes
 * @returns Array of all themes
 */
export const getAllThemes = (): ProfileTheme[] => {
  return [...THEMES];
};

/**
 * Get a specific theme by ID
 * @param id - The theme ID to find
 * @returns The theme object or undefined if not found
 */
export const getThemeById = (id: string): ProfileTheme | undefined => {
  return _getThemeById(id);
};

/**
 * Validate if a theme ID is valid
 * @param themeId - The theme ID to validate
 * @returns Boolean indicating if the theme ID is valid
 */
export const isValidThemeId = (themeId: string): boolean => {
  return THEMES.some(theme => theme.id === themeId);
};

/**
 * Get a random theme
 * @returns A randomly selected theme
 */
export const getRandomTheme = (): ProfileTheme => {
  const randomIndex = Math.floor(Math.random() * THEMES.length);
  return THEMES[randomIndex];
};

/**
 * Check if a theme is from a premium category
 * @param theme - The theme to check
 * @returns Boolean indicating if the theme is premium
 */
export const isPremiumTheme = (theme: ProfileTheme): boolean => {
  // For now, no themes are premium
  // This is a placeholder for future premium theme functionality
  return theme.isPremium || false;
};

/**
 * Apply theme to document
 * @param theme - The theme to apply
 */
export const applyThemeToDocument = (theme: ProfileTheme): void => {
  // This function would apply the theme to the document
  // For now, we're just setting a CSS variable that can be used in components
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--theme-background', theme.backgroundGradient);
    document.documentElement.style.setProperty('--theme-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--theme-text', theme.textColor);
    document.documentElement.style.setProperty('--theme-glass', theme.glassColor);
  }
};
