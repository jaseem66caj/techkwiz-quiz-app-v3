'use client'

import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
  subcategories: string[]
  entry_fee: number
  prize_pool: number
}

interface CategoryCardProps {
  category: Category
  onSelect: (categoryId: string) => void
  userCoins: number
}

export function CategoryCard({ category, onSelect, userCoins }: CategoryCardProps) {
  const canAfford = userCoins >= category.entry_fee
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-effect p-6 rounded-2xl cursor-pointer group transition-all duration-300 hover:shadow-2xl"
      onClick={() => canAfford && onSelect(category.id)}
    >
      {/* Category Icon and Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {category.icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {category.name}
        </h3>
        <p className="text-blue-200 text-sm">
          {category.description}
        </p>
      </div>

      {/* Subcategories */}
      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3 text-sm">Topics:</h4>
        <div className="flex flex-wrap gap-2">
          {category.subcategories.slice(0, 4).map((sub, index) => (
            <span
              key={index}
              className="bg-white/10 text-blue-200 px-3 py-1 rounded-full text-xs"
            >
              {sub}
            </span>
          ))}
          {category.subcategories.length > 4 && (
            <span className="bg-white/10 text-blue-200 px-3 py-1 rounded-full text-xs">
              +{category.subcategories.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Entry Fee and Prize Pool */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-blue-200 text-sm">Entry Fee:</span>
          <span className="text-yellow-400 font-semibold flex items-center">
            <span className="text-lg mr-1">🪙</span>
            {category.entry_fee}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-blue-200 text-sm">Prize Pool:</span>
          <span className="text-green-400 font-semibold flex items-center">
            <span className="text-lg mr-1">🏆</span>
            {category.prize_pool}
          </span>
        </div>
      </div>

      {/* Play Button */}
      <button
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
          canAfford
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-400 hover:to-orange-400 shadow-lg hover:shadow-xl'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!canAfford}
      >
        <span className="text-xl">▶️</span>
        <span>
          {canAfford ? 'Play and Win' : 'Not Enough Coins'}
        </span>
      </button>

      {/* Insufficient Coins Message */}
      {!canAfford && (
        <p className="text-red-400 text-xs text-center mt-2">
          You need {category.entry_fee - userCoins} more coins to play
        </p>
      )}
    </motion.div>
  )
}