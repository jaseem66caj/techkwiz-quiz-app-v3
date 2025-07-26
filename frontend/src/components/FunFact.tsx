'use client'

import { motion } from 'framer-motion'

interface FunFactProps {
  fact: string
}

export function FunFact({ fact }: FunFactProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-effect p-4 sm:p-6 rounded-xl w-full max-w-full sm:max-w-md md:max-w-lg mx-auto text-center"
    >
      <h4 className="text-yellow-400 font-bold text-base sm:text-lg mb-3 flex items-center justify-center">
        <span className="mr-2">💡</span>
        #Fun Fact
      </h4>
      <p className="text-blue-200 text-sm sm:text-base leading-relaxed px-2">
        {fact}
      </p>
    </motion.div>
  )
}