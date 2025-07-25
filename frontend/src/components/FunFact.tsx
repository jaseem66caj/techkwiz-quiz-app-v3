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
      className="glass-effect p-6 rounded-xl max-w-md mx-auto text-center"
    >
      <h4 className="text-yellow-400 font-bold text-lg mb-3 flex items-center justify-center">
        <span className="mr-2">💡</span>
        #Fun Fact
      </h4>
      <p className="text-blue-200 text-sm leading-relaxed">
        {fact}
      </p>
    </motion.div>
  )
}