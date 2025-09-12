// ===================================================================
// TechKwiz Theme Database
// ===================================================================
// This file contains the complete theme database with predefined options
// for the TechKwiz application. It provides a rich selection of themes
// to enhance user personalization.

import { ProfileTheme } from '../types/theme';

/**
 * Complete collection of themes
 */
export const THEMES: ProfileTheme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'The classic TechKwiz blue and purple gradient',
    backgroundGradient: 'from-gray-900 via-blue-900 to-purple-900',
    primaryColor: 'bg-blue-500',
    secondaryColor: 'bg-purple-500',
    textColor: 'text-white',
    glassColor: 'rgba(30, 60, 114, 0.8)'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink gradients of a beautiful sunset',
    backgroundGradient: 'from-orange-500 via-red-500 to-pink-500',
    primaryColor: 'bg-orange-500',
    secondaryColor: 'bg-pink-500',
    textColor: 'text-white',
    glassColor: 'rgba(255, 165, 0, 0.8)'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue and teal gradients of the deep ocean',
    backgroundGradient: 'from-cyan-500 via-blue-500 to-teal-500',
    primaryColor: 'bg-cyan-500',
    secondaryColor: 'bg-teal-500',
    textColor: 'text-white',
    glassColor: 'rgba(0, 200, 255, 0.8)'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Green gradients inspired by lush forest landscapes',
    backgroundGradient: 'from-green-600 via-green-500 to-emerald-500',
    primaryColor: 'bg-green-500',
    secondaryColor: 'bg-emerald-500',
    textColor: 'text-white',
    glassColor: 'rgba(34, 197, 94, 0.8)'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark purple and indigo gradients of a starry night',
    backgroundGradient: 'from-gray-900 via-purple-900 to-indigo-900',
    primaryColor: 'bg-purple-600',
    secondaryColor: 'bg-indigo-600',
    textColor: 'text-white',
    glassColor: 'rgba(75, 0, 130, 0.8)'
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Sweet pink and purple gradients of candy land',
    backgroundGradient: 'from-pink-400 via-purple-400 to-fuchsia-400',
    primaryColor: 'bg-pink-400',
    secondaryColor: 'bg-fuchsia-400',
    textColor: 'text-white',
    glassColor: 'rgba(244, 114, 182, 0.8)'
  }
];

/**
 * Get a specific theme by ID
 * @param id - The theme ID to find
 * @returns The theme object or undefined if not found
 */
export const getThemeById = (id: string): ProfileTheme | undefined => {
  return THEMES.find(theme => theme.id === id);
};

/**
 * Get the default theme
 * @returns The default theme
 */
export const getDefaultTheme = (): ProfileTheme => {
  return THEMES[0]; // Default theme is the first one
};