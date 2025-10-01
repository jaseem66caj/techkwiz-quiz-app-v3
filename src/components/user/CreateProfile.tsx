'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarSelector } from './AvatarSelector';
import { getAvatarEmojiById } from '@/utils/avatar';

interface CreateProfileProps {
  onProfileCreated: (_username: string, _avatar: string) => void;
}

export function CreateProfile({ onProfileCreated }: CreateProfileProps) {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('robot');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onProfileCreated(username.trim(), selectedAvatar);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {showAvatarSelector && (
        <AvatarSelector 
          selectedAvatar={selectedAvatar}
          onAvatarSelect={setSelectedAvatar}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg glass-effect rounded-2xl text-center border border-white/10 shadow-xl p-6 sm:p-8"
      >
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Your Profile</h2>
        <p className="text-blue-200 mb-6 text-sm">Pick a username and an avatar to save your progress.</p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="username" className="block text-blue-200 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your display name"
              autoFocus
              className="w-full rounded-xl bg-white/95 text-gray-900 placeholder-gray-400 px-4 py-3 shadow-inner focus:outline-none focus:ring-4 focus:ring-orange-400/40"
              required
            />
          </div>

          <div>
            <label className="block text-blue-200 text-sm font-semibold mb-3">Choose Your Avatar</label>
            <button
              type="button"
              onClick={() => setShowAvatarSelector(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">
                  {getAvatarEmojiById(selectedAvatar)}
                </span>
                <span className="text-white font-medium">Select Avatar</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-900/20 transition-all"
          >
            Create Profile
          </button>
        </form>
      </motion.div>
    </div>
  );
}
