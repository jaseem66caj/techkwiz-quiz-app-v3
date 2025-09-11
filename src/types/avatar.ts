// ===================================================================
// TechKwiz Avatar Type Definitions
// ===================================================================
// This file contains TypeScript interface definitions for avatar-related
// data structures used throughout the TechKwiz application. These types
// ensure type safety and provide clear documentation for avatar data models.

/**
 * Avatar category types
 */
export type AvatarCategory = 'animals' | 'objects' | 'emojis' | 'food' | 'nature' | 'fantasy' | 'premium';

/**
 * Interface defining the structure of an avatar
 */
export interface Avatar {
  // Unique identifier for the avatar
  id: string;
  // The emoji character representing the avatar
  emoji: string;
  // Display name of the avatar
  name: string;
  // Category this avatar belongs to
  category: AvatarCategory;
  // Whether this is a premium avatar (future feature)
  isPremium?: boolean;
  // Requirement to unlock this avatar (future feature)
  unlockRequirement?: string;
}

/**
 * Interface defining the structure of avatar category
 */
export interface AvatarCategoryInfo {
  // Category identifier
  id: AvatarCategory;
  // Display name of the category
  name: string;
  // Emoji icon for the category
  icon: string;
}