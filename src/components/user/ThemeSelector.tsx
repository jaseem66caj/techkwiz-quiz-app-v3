'use client'

import { motion } from 'framer-motion'
import { getAllThemes } from '../../utils/theme'
import { useApp } from '../../app/providers'
import { saveUser } from '../../utils/auth'

interface ThemeSelectorProps {
  selectedTheme: string
  onThemeSelect: (_themeId: string) => void
  onClose: () => void
}

export function ThemeSelector({ selectedTheme, onThemeSelect, onClose }: ThemeSelectorProps) {
  const { state, dispatch } = useApp()
  const themes = getAllThemes()

  const handleThemeSelect = (themeId: string) => {
    if (state.user) {
      const updatedUser = { ...state.user, theme: themeId }
      saveUser(updatedUser)
      dispatch({ type: 'LOGIN_SUCCESS', payload: updatedUser })
      onThemeSelect(themeId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Profile Themes</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close theme selector"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 mt-2">Choose a theme to personalize your profile</p>
        </div>

        {/* Theme Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const isSelected = selectedTheme === theme.id

              return (
                <motion.div
                  key={theme.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`
                    rounded-xl p-4 cursor-pointer transition-all duration-300
                    ${isSelected 
                      ? 'ring-2 ring-white ring-opacity-50' 
                      : 'ring-1 ring-gray-700 hover:ring-gray-500'
                    }
                  `}
                  style={{
                    background: `linear-gradient(135deg, ${getGradientColors(theme.backgroundGradient)})`
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{theme.name}</h3>
                    {isSelected && (
                      <div className="bg-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-200 mb-4">{theme.description}</p>
                  
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                    <div className="w-6 h-6 rounded-full bg-pink-500"></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Helper function to convert Tailwind gradient classes to actual colors
function getGradientColors(gradientClass: string): string {
  // This is a simplified version - in a real app, you might want to map these properly
  const colorMap: Record<string, string> = {
    'from-gray-900': '#111827',
    'via-blue-900': '#1e3a8a',
    'to-purple-900': '#581c87',
    'from-orange-500': '#f97316',
    'via-red-500': '#ef4444',
    'to-pink-500': '#ec4899',
    'from-cyan-500': '#06b6d4',
    'via-blue-500': '#3b82f6',
    'to-teal-500': '#14b8a6',
    'from-green-600': '#16a34a',
    'via-green-500': '#22c55e',
    'to-emerald-500': '#10b981',
    'from-purple-900': '#581c87',
    'via-purple-900': '#581c87',
    'to-indigo-900': '#312e81',
    'from-pink-400': '#f472b6',
    'via-purple-400': '#c084fc',
    'to-fuchsia-400': '#e879f9'
  }

  const classes = gradientClass.split(' ')
  const fromColor = colorMap[classes[0]] || '#111827'
  const viaColor = colorMap[classes[1]] || colorMap[classes[0]] || '#1e3a8a'
  const toColor = colorMap[classes[2]] || colorMap[classes[1]] || '#581c87'
  
  return `${fromColor}, ${viaColor}, ${toColor}`
}
