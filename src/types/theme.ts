// ===================================================================
// TechKwiz Theme Type Definitions
// ===================================================================
// This file contains TypeScript interface definitions for theme-related
// data structures used throughout the TechKwiz application. These types
// ensure type safety and provide clear documentation for theme data models.

/**
 * Theme category types
 */
export type ThemeCategory = 'default' | 'sunset' | 'ocean' | 'forest' | 'midnight' | 'candy' | 'premium';

/**
 * Interface defining the structure of a profile theme
 */
export interface ProfileTheme {
  // Unique identifier for the theme
  id: string;
  // Display name of the theme
  name: string;
  // Description of the theme
  description: string;
  // Background gradient for the theme
  backgroundGradient: string;
  // Primary color for buttons and highlights
  primaryColor: string;
  // Secondary color for accents
  secondaryColor: string;
  // Text color
  textColor: string;
  // Glass effect background color
  glassColor: string;
  // Whether this is a premium theme (future feature)
  isPremium?: boolean;
  // Requirement to unlock this theme (future feature)
  unlockRequirement?: string;
}