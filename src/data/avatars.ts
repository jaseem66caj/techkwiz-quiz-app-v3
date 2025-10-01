// ===================================================================
// TechKwiz Avatar Database
// ===================================================================
// This file contains the complete avatar database with categorized options
// for the TechKwiz application. It provides a rich selection of avatars
// organized by categories to enhance user personalization.

import { Avatar, AvatarCategoryInfo } from '@/types/avatar';

/**
 * Avatar categories with metadata
 */
export const AVATAR_CATEGORIES: AvatarCategoryInfo[] = [
  {
    id: 'animals',
    name: 'Animals',
    icon: '🐾'
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '📦'
  },
  {
    id: 'emojis',
    name: 'Emojis',
    icon: '😀'
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍔'
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿'
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🧙'
  }
];

/**
 * Complete collection of avatars organized by category
 */
export const AVATARS: Avatar[] = [
  // Animals
  { id: 'dog', emoji: '🐶', name: 'Dog', category: 'animals' },
  { id: 'cat', emoji: '🐱', name: 'Cat', category: 'animals' },
  { id: 'panda', emoji: '🐼', name: 'Panda', category: 'animals' },
  { id: 'lion', emoji: '🦁', name: 'Lion', category: 'animals' },
  { id: 'elephant', emoji: '🐘', name: 'Elephant', category: 'animals' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', category: 'animals' },
  { id: 'fox', emoji: '🦊', name: 'Fox', category: 'animals' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle', category: 'animals' },
  
  // Objects
  { id: 'gamepad', emoji: '🎮', name: 'Gamepad', category: 'objects' },
  { id: 'phone', emoji: '📱', name: 'Phone', category: 'objects' },
  { id: 'computer', emoji: '💻', name: 'Computer', category: 'objects' },
  { id: 'headphones', emoji: '🎧', name: 'Headphones', category: 'objects' },
  { id: 'palette', emoji: '🎨', name: 'Palette', category: 'objects' },
  { id: 'book', emoji: '📚', name: 'Book', category: 'objects' },
  { id: 'soccer', emoji: '⚽', name: 'Soccer Ball', category: 'objects' },
  { id: 'guitar', emoji: '🎸', name: 'Guitar', category: 'objects' },
  
  // Emojis
  { id: 'smile', emoji: '😀', name: 'Smile', category: 'emojis' },
  { id: 'cool', emoji: '😎', name: 'Cool', category: 'emojis' },
  { id: 'nerd', emoji: '🤓', name: 'Nerd', category: 'emojis' },
  { id: 'robot', emoji: '🤖', name: 'Robot', category: 'emojis' },
  { id: 'crown', emoji: '👑', name: 'Crown', category: 'emojis' },
  { id: 'gem', emoji: '💎', name: 'Gem', category: 'emojis' },
  { id: 'fire', emoji: '🔥', name: 'Fire', category: 'emojis' },
  { id: 'star', emoji: '🌟', name: 'Star', category: 'emojis' },
  
  // Food
  { id: 'pizza', emoji: '🍕', name: 'Pizza', category: 'food' },
  { id: 'burger', emoji: '🍔', name: 'Burger', category: 'food' },
  { id: 'cake', emoji: '🍰', name: 'Cake', category: 'food' },
  { id: 'apple', emoji: '🍎', name: 'Apple', category: 'food' },
  { id: 'sushi', emoji: '🍣', name: 'Sushi', category: 'food' },
  { id: 'drink', emoji: '🥤', name: 'Drink', category: 'food' },
  { id: 'popcorn', emoji: '🍿', name: 'Popcorn', category: 'food' },
  { id: 'lollipop', emoji: '🍭', name: 'Lollipop', category: 'food' },
  
  // Nature
  { id: 'tree', emoji: '🌳', name: 'Tree', category: 'nature' },
  { id: 'flower', emoji: '🌺', name: 'Flower', category: 'nature' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', category: 'nature' },
  { id: 'cloud', emoji: '⛅', name: 'Cloud', category: 'nature' },
  { id: 'wave', emoji: '🌊', name: 'Wave', category: 'nature' },
  { id: 'moon', emoji: '🌙', name: 'Moon', category: 'nature' },
  { id: 'sun', emoji: '☀️', name: 'Sun', category: 'nature' },
  { id: 'volcano', emoji: '🌋', name: 'Volcano', category: 'nature' },
  
  // Fantasy
  { id: 'wizard', emoji: '🧙', name: 'Wizard', category: 'fantasy' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', category: 'fantasy' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon', category: 'fantasy' },
  { id: 'fairy', emoji: '🧚', name: 'Fairy', category: 'fantasy' },
  { id: 'vampire', emoji: '🧛', name: 'Vampire', category: 'fantasy' },
  { id: 'mermaid', emoji: '🧜', name: 'Mermaid', category: 'fantasy' },
  { id: 'genie', emoji: '🧞', name: 'Genie', category: 'fantasy' },
  { id: 'alien', emoji: '👽', name: 'Alien', category: 'fantasy' }
];

/**
 * Get avatars filtered by category
 * @param category - The category to filter by
 * @returns Array of avatars in the specified category
 */
export const getAvatarsByCategory = (category: string): Avatar[] => {
  return AVATARS.filter(avatar => avatar.category === category);
};

/**
 * Search avatars by name or category
 * @param query - The search query
 * @returns Array of avatars matching the search query
 */
export const searchAvatars = (query: string): Avatar[] => {
  const lowerQuery = query.toLowerCase();
  return AVATARS.filter(avatar => 
    avatar.name.toLowerCase().includes(lowerQuery) || 
    avatar.category.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get a specific avatar by ID
 * @param id - The avatar ID to find
 * @returns The avatar object or undefined if not found
 */
export const getAvatarById = (id: string): Avatar | undefined => {
  return AVATARS.find(avatar => avatar.id === id);
};
