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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-effect p-8 rounded-2xl text-center max-w-md mx-auto mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Create Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-blue-200 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-blue-200 text-sm font-bold mb-2">
            Choose Your Avatar
          </label>
          <div className="flex justify-center space-x-4">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`text-4xl p-2 rounded-full transition-all ${selectedAvatar === avatar ? 'bg-orange-500' : 'hover:bg-white/20'}`}>
                {avatar}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Create Profile
        </button>
      </form>
    </motion.div>
  );
}
