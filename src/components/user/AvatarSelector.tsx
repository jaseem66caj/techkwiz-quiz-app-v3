'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AVATAR_CATEGORIES } from '@/data/avatars';
import { getAllAvatars, getAvatarsByCategoryGrouped, searchAvatars } from '@/utils/avatar';
import { Avatar as AvatarType } from '@/types/avatar';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (_avatarId: string) => void;
  onClose: () => void;
}

export function AvatarSelector({ selectedAvatar, onAvatarSelect, onClose }: AvatarSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredAvatars, setFilteredAvatars] = useState<AvatarType[]>([]);
  const [groupedAvatars, setGroupedAvatars] = useState<Record<string, AvatarType[]>>({});

  // Initialize avatars
  useEffect(() => {
    const avatars = getAllAvatars();
    setFilteredAvatars(avatars);
    
    const grouped = getAvatarsByCategoryGrouped();
    setGroupedAvatars(grouped);
  }, []);

  // Filter avatars based on category and search query
  useEffect(() => {
    let result: AvatarType[] = [];
    
    if (searchQuery) {
      // Search across all categories
      result = searchAvatars(searchQuery);
    } else if (activeCategory === 'all') {
      // Show all avatars
      result = getAllAvatars();
    } else {
      // Show avatars from specific category
      result = groupedAvatars[activeCategory] || [];
    }
    
    setFilteredAvatars(result);
  }, [activeCategory, searchQuery, groupedAvatars]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="glass-effect p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Choose Your Avatar</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search avatars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/10 text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Category Tabs */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeCategory === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All
            </button>
            {AVATAR_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Avatar Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredAvatars.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {filteredAvatars.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAvatarSelect(avatar.id)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                    selectedAvatar === avatar.id
                      ? 'bg-orange-500/20 ring-2 ring-orange-500'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  aria-label={`Select ${avatar.name} avatar`}
                >
                  <span className="text-2xl mb-1">{avatar.emoji}</span>
                  <span className="text-xs text-white/80 truncate w-full px-1">{avatar.name}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-white/80">No avatars found matching your search.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="glass-effect p-4 border-t border-white/10 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-white/80 text-sm">Selected:</span>
            <div className="ml-2 flex items-center">
              <span className="text-xl mr-2">
                {filteredAvatars.find(a => a.id === selectedAvatar)?.emoji || '👤'}
              </span>
              <span className="text-white font-medium">
                {filteredAvatars.find(a => a.id === selectedAvatar)?.name || 'None'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
