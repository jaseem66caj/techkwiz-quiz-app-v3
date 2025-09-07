'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CreateProfileProps {
  onProfileCreated: (username: string, avatar: string) => void;
}

const avatars = ['🤖', '🧑‍💻', '🚀', '🧠', '🧙‍♂️', '👾'];

export function CreateProfile({ onProfileCreated }: CreateProfileProps) {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onProfileCreated(username.trim(), selectedAvatar);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
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
            <div className="grid grid-cols-6 gap-3 justify-items-center">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  aria-label={`Select avatar ${avatar}`}
                  aria-pressed={selectedAvatar === avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl sm:text-4xl p-2 sm:p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 ${
                    selectedAvatar === avatar
                      ? 'bg-orange-500/90 text-white ring-orange-400/50 scale-110 shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 ring-transparent'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
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
