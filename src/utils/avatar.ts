// ===================================================================
// TechKwiz Avatar Utility Functions
// ===================================================================
// This file contains utility functions for managing avatars in the
// TechKwiz application. These functions provide helper methods for
// avatar selection, validation, and management.

import { Avatar } from '@/types/avatar';
import { AVATARS } from '@/data/avatars';

/**
 * Get all available avatars
 * @returns Array of all avatars
 */
export const getAllAvatars = (): Avatar[] => {
  return [...AVATARS];
};

/**
 * Validate if an avatar ID is valid
 * @param avatarId - The avatar ID to validate
 * @returns Boolean indicating if the avatar ID is valid
 */
export const isValidAvatarId = (avatarId: string): boolean => {
  return AVATARS.some(avatar => avatar.id === avatarId);
};

/**
 * Get a random avatar
 * @returns A randomly selected avatar
 */
export const getRandomAvatar = (): Avatar => {
  const randomIndex = Math.floor(Math.random() * AVATARS.length);
  return AVATARS[randomIndex];
};

/**
 * Get default avatar (fallback)
 * @returns The default avatar
 */
export const getDefaultAvatar = (): Avatar => {
  // Return the first avatar as default
  return AVATARS[0];
};

/**
 * Get avatar emoji by ID
 * @param avatarId - The avatar ID to look up
 * @returns The emoji for the avatar or a default emoji if not found
 */
export const getAvatarEmojiById = (avatarId: string): string => {
  const avatar = AVATARS.find(a => a.id === avatarId);
  return avatar ? avatar.emoji : '👤';
};

/**
 * Check if an avatar is from a premium category
 * @param avatar - The avatar to check
 * @returns Boolean indicating if the avatar is premium
 */
export const isPremiumAvatar = (avatar: Avatar): boolean => {
  // For now, no avatars are premium
  // This is a placeholder for future premium avatar functionality
  return avatar.isPremium || false;
};

/**
 * Get avatars grouped by category
 * @returns Object with categories as keys and arrays of avatars as values
 */
export const getAvatarsByCategoryGrouped = (): Record<string, Avatar[]> => {
  const grouped: Record<string, Avatar[]> = {};
  
  AVATARS.forEach(avatar => {
    if (!grouped[avatar.category]) {
      grouped[avatar.category] = [];
    }
    grouped[avatar.category].push(avatar);
  });
  
  return grouped;
};

// Export searchAvatars function from the data file
export { searchAvatars } from '@/data/avatars';
