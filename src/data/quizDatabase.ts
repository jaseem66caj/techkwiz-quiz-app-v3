// ===================================================================
// TechKwiz Comprehensive Quiz Database
// ===================================================================
// This file contains the complete quiz database with original content
// featuring 50+ questions across 8 categories with multiple difficulty levels.
// It provides the core quiz content for the application including:
// - Quiz questions with multiple choice options
// - Category definitions with metadata
// - Utility functions for retrieving quiz content

import { calculateCategoryMaxCoins } from '@/utils/rewardCalculator'

// Interface defining the structure of a quiz question
export interface QuizQuestion {
  // Unique identifier for the question
  id: string
  // The question text to display to the user
  question: string
  // Array of answer options (typically 4 options)
  options: string[]
  // Index of the correct answer in the options array (-1 for personality questions with no correct answer)
  correct_answer: number
  // Difficulty level of the question (beginner, intermediate, advanced)
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  // Interesting fact related to the question to enhance learning
  fun_fact: string
  // Category identifier this question belongs to
  category: string
  // Subcategory within the main category for more granular organization
  subcategory: string
}

// Interface defining the structure of a quiz category
export interface QuizCategory {
  // Unique identifier for the category
  id: string
  // Display name of the category
  name: string
  // Emoji icon representing the category
  icon: string
  // Tailwind CSS gradient classes for visual styling
  color: string
  // Brief description of what the category covers
  description: string
  // Array of subcategories within this category
  subcategories: string[]
  // Coin cost to enter a quiz in this category
  entry_fee: number
  // Total coins available as prize pool for this category
  prize_pool: number
}

// ===================================================================
// Quiz Categories Configuration
// ===================================================================
// Defines all available quiz categories with their metadata and settings
// Each category has unique visual styling, entry costs, and prize pools
export const QUIZ_CATEGORIES: Record<string, QuizCategory> = {
  'swipe-personality': {
    id: 'swipe-personality',
    name: 'Swipe-Based Personality',
    icon: '🎉',
    color: 'from-pink-500 to-purple-600',
    description: 'Discover your vibe through rapid-fire choices',
    subcategories: ['Aesthetic', 'Lifestyle', 'Values', 'Preferences'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'pop-culture-flash': {
    id: 'pop-culture-flash',
    name: 'Pop Culture Flash',
    icon: '🎬',
    color: 'from-red-500 to-pink-600',
    description: 'Decode trends and viral moments',
    subcategories: ['TikTok', 'Music', 'Celebrities', 'Memes'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'micro-trivia': {
    id: 'micro-trivia',
    name: 'Micro-Trivia Tournaments',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-600',
    description: 'Lightning-fast knowledge battles',
    subcategories: ['Random Facts', 'Quick Fire', 'Brain Teasers', 'Speed Round'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'social-identity': {
    id: 'social-identity',
    name: 'Social Identity Quizzes',
    icon: '🤳',
    color: 'from-purple-500 to-indigo-600',
    description: 'Find your digital persona match',
    subcategories: ['Influencer Type', 'Content Style', 'Social Vibe', 'Online Persona'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'trend-vibes': {
    id: 'trend-vibes',
    name: 'Trend & Local Vibes',
    icon: '🎯',
    color: 'from-orange-500 to-yellow-600',
    description: 'Stay plugged into what\'s viral',
    subcategories: ['TikTok Slang', 'Viral Trends', 'Local Culture', 'Gen Z Language'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'future-you': {
    id: 'future-you',
    name: 'Future-You Simulations',
    icon: '🔮',
    color: 'from-green-500 to-teal-600',
    description: 'Predict your path and tech trends',
    subcategories: ['Career Paths', 'Tech Future', 'Life Predictions', 'AI vs Human'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'programming': {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    color: 'from-blue-500 to-purple-600',
    description: 'Test your coding knowledge',
    subcategories: ['JavaScript', 'Python', 'HTML', 'Algorithms'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
  'ai': {
    id: 'ai',
    name: 'Artificial Intelligence',
    icon: '🤖',
    color: 'from-purple-500 to-pink-600',
    description: 'Explore AI and machine learning',
    subcategories: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates based on QUIZ_DATABASE[this.id].length × 50 coins
  },
}

// ===================================================================
// Quiz Database Content
// ===================================================================
// Complete collection of quiz questions organized by category
// Contains 50+ original questions across 8 categories
// Each question includes educational content and fun facts
export const QUIZ_DATABASE: Record<string, QuizQuestion[]> = {
  'swipe-personality': [
    {
      id: 'swipe_001',
      question: 'Your ideal weekend vibe is...',
      options: ['Cozy café with a book ☕📚', 'Beach party with friends 🏖️🎉', 'Concert or music festival 🎵🎤', 'Hiking in nature trails 🌲🥾'],
      correct_answer: -1, // No correct answer for personality
      difficulty: 'beginner',
      fun_fact: 'Your leisure choices reflect your personality type and social energy preferences!',
      category: 'swipe-personality',
      subcategory: 'Lifestyle'
    },
    {
      id: 'swipe_002', 
      question: 'Pick your dream aesthetic...',
      options: ['Dark Academia ☕📚', 'Soft Girl 🌸✨', 'Y2K Cyber 💿🔮', 'Cottagecore 🍄🌿'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Aesthetics are visual representations of personality and lifestyle choices!',
      category: 'swipe-personality',
      subcategory: 'Aesthetic'
    },
    {
      id: 'swipe_003',
      question: 'Your social media energy is...',
      options: ['Main character energy ✨👑', 'Supportive bestie vibes 💝🤗', 'Mysterious and selective 🖤🔮', 'Authentic storyteller 📖💭'],
      correct_answer: -1,
      difficulty: 'beginner', 
      fun_fact: 'Social media presence often mirrors real-life personality traits!',
      category: 'swipe-personality',
      subcategory: 'Values'
    },
    {
      id: 'swipe_004',
      question: 'Your approach to new trends is...',
      options: ['First to try everything 🚀', 'Wait and see what sticks 👀', 'Only if it fits my vibe ✨', 'Create my own trends 🎨'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Innovation adoption styles reveal personality and risk tolerance!',
      category: 'swipe-personality', 
      subcategory: 'Preferences'
    },
    {
      id: 'swipe_005',
      question: 'Your friend group dynamic is...',
      options: ['The planner and organizer 📅', 'The mood lifter and comedian 😂', 'The advice giver and listener 💝', 'The adventure starter 🗺️'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Friend group roles often reflect natural leadership and social styles!',
      category: 'swipe-personality',
      subcategory: 'Values'
    }
  ],
  'pop-culture-flash': [
    {
      id: 'pop_001',
      question: 'Which app started the "For You Page" trend?',
      options: ['Instagram', 'TikTok', 'Snapchat', 'YouTube'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'TikTok\'s algorithm-driven "For You Page" revolutionized social media content discovery!',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_002',
      question: 'What does "VSCO girl" aesthetic include?',
      options: ['Heavy makeup and curls', 'Scrunchies and Hydroflasks', 'Gothic clothing', 'Sporty athletic wear'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'VSCO girl trend promoted environmental consciousness and casual comfort!',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_003',
      question: 'Which artist broke Spotify streaming records in 2024?',
      options: ['Taylor Swift', 'Bad Bunny', 'Billie Eilish', 'The Weeknd'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Taylor Swift\'s re-recorded albums have dominated streaming platforms!',
      category: 'pop-culture-flash', 
      subcategory: 'Music'
    },
    {
      id: 'pop_004',
      question: 'What does "periodt" mean in Gen Z slang?',
      options: ['Time period', 'End of discussion', 'Asking a question', 'Being confused'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'AAVE (African American Vernacular English) has heavily influenced Gen Z slang!',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    },
    {
      id: 'pop_005',
      question: 'Which meme format uses "Me explaining to my mom..."?',
      options: ['Drake pointing', 'Charlie conspiracy board', 'Distracted boyfriend', 'Woman yelling at cat'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Charlie Day\'s conspiracy theory scene became a popular meme for explaining complex ideas!',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    }
  ],
  'micro-trivia': [
    {
      id: 'micro_001',
      question: 'How many hearts does an octopus have?',
      options: ['1', '2', '3', '4'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Octopuses have three hearts - two pump blood to the gills, one to the body!',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_002',
      question: 'What\'s the only mammal capable of true flight?',
      options: ['Flying squirrel', 'Bat', 'Sugar glider', 'Flying lemur'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Bats are the only mammals with powered flight - others just glide!',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_003', 
      question: 'Which planet spins backwards?',
      options: ['Mars', 'Venus', 'Uranus', 'Neptune'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Venus rotates clockwise, opposite to most planets in our solar system!',
      category: 'micro-trivia',
      subcategory: 'Brain Teasers'
    },
    {
      id: 'micro_004',
      question: 'What\'s the fastest land animal?',
      options: ['Lion', 'Cheetah', 'Gazelle', 'Greyhound'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Cheetahs can reach speeds up to 70 mph in short bursts!',
      category: 'micro-trivia',
      subcategory: 'Speed Round'
    },
    {
      id: 'micro_005',
      question: 'How many bones are babies born with?',
      options: ['206', '270', '350', '400'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Babies are born with 270 bones, but many fuse together as they grow!',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    }
  ],
  'social-identity': [
    {
      id: 'social_001',
      question: 'Your ideal content creation style is...',
      options: ['Aesthetic photos and vibes ✨📸', 'Educational and informative 🧠📚', 'Comedy and entertainment 😂🎭', 'Authentic life sharing 💝📱'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Content style reflects personality and what you value sharing with others!',
      category: 'social-identity',
      subcategory: 'Content Style'
    },
    {
      id: 'social_002',
      question: 'Your online persona energy is...',
      options: ['Mysterious and intriguing 🖤🔮', 'Bubbly and positive ☀️💕', 'Cool and effortless 😎✨', 'Thoughtful and deep 🌙📖'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Online personas can amplify certain aspects of our real personalities!',
      category: 'social-identity',
      subcategory: 'Online Persona'
    },
    {
      id: 'social_003',
      question: 'Which social media platform suits your vibe?',
      options: ['Instagram for aesthetics 📸✨', 'TikTok for trends 🎵📱', 'Twitter for thoughts 💭🐦', 'YouTube for deep dives 🎥📚'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Platform preferences often align with communication styles and content consumption habits!',
      category: 'social-identity',
      subcategory: 'Social Vibe'
    },
    {
      id: 'social_004',
      question: 'Your ideal influencer collaboration is...',
      options: ['Lifestyle brand 🧴👗', 'Tech reviewer 📱🔧', 'Comedy creator 😂🎭', 'Educational content 📚🧠'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Influencer preferences often reflect our interests and values!',
      category: 'social-identity',
      subcategory: 'Influencer Type'
    },
    {
      id: 'social_005',
      question: 'What\'s your commenting personality?',
      options: ['Supportive with hearts ❤️', 'Funny with memes 😂', 'Thoughtful with insights 💭', 'First to engage 🚀'],
      correct_answer: -1,
      difficulty: 'beginner',
      fun_fact: 'Commenting styles reveal social interaction preferences and personality traits!',
      category: 'social-identity',
      subcategory: 'Online Persona'
    }
  ],
  'trend-vibes': [
    {
      id: 'trend_001',
      question: 'What does "delulu" mean in Gen Z slang?',
      options: ['Delusional', 'Delicious', 'Deluxe', 'Deliver'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: '"Delulu" became popular on social media to describe unrealistic expectations!',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    },
    {
      id: 'trend_002',
      question: 'Which dance trend was popularized by "Renegade"?',
      options: ['Flossing', 'The Dab', 'Whip and Nae Nae', 'Arm wave sequences'],
      correct_answer: 3,
      difficulty: 'intermediate',
      fun_fact: 'The Renegade dance had over 500 million views on TikTok within months!',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_003',
      question: 'What does "rizz" refer to?',
      options: ['Skill in picking up romantic partners', 'A type of car', 'A dance move', 'A food item'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: '"Rizz" was added to the Oxford English Dictionary in 2022!',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_004',
      question: 'Which TikTok trend involved users showing their "glow up"?',
      options: ['Transformation videos', 'Cooking tutorials', 'Pet videos', 'Travel vlogs'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Glow up videos became a cultural phenomenon, inspiring confidence and self-expression!',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_005',
      question: 'What does "skibidi" refer to?',
      options: ['A dance move', 'A type of music', 'A meme trend', 'All of the above'],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: '"Skibidi" originated from a 2019 song but resurfaced as a viral meme in 2023!',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    }
  ],
  'future-you': [
    {
      id: 'future_001',
      question: 'Which job is most likely to be automated by 2030?',
      options: ['Data entry clerk', 'Surgeon', 'Creative artist', 'Therapist'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Jobs requiring creativity, emotional intelligence, and complex problem-solving are less likely to be automated!',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_002',
      question: 'What percentage of future jobs don\'t exist today?',
      options: ['25%', '50%', '75%', '90%'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'The World Economic Forum estimates that 65% of children entering primary school today will work in jobs that don\'t yet exist!',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_003',
      question: 'Which technology will most impact education by 2030?',
      options: ['Virtual Reality', 'Artificial Intelligence', 'Blockchain', 'Quantum Computing'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'AI-powered personalized learning could revolutionize how we approach education!',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_004',
      question: 'What\'s the predicted timeline for human-level AI?',
      options: ['2030', '2040', '2050', '2060+'],
      correct_answer: 2,
      difficulty: 'advanced',
      fun_fact: 'Experts predict human-level AI could emerge between 2040-2050, but timelines are highly debated!',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_005',
      question: 'Which skill will be most valuable in 2030?',
      options: ['Technical coding', 'Emotional intelligence', 'Data analysis', 'Digital marketing'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Soft skills like emotional intelligence are increasingly valued as automation handles technical tasks!',
      category: 'future-you',
      subcategory: 'Career Paths'
    }
  ],
  'programming': [
    {
      id: 'prog_001',
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'HTML was created by Tim Berners-Lee in 1991 as the foundation of the World Wide Web!',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_002',
      question: 'Which language is known as the "language of the web"?',
      options: ['Python', 'Java', 'JavaScript', 'C++'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'JavaScript was created in just 10 days by Brendan Eich in 1995!',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_003',
      question: 'What does API stand for?',
      options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Programming Interface', 'Application Process Integration'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'APIs are like waiters in a restaurant - they take your order (request) and bring back your food (response)!',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_004',
      question: 'Which data structure uses LIFO (Last In, First Out)?',
      options: ['Queue', 'Array', 'Stack', 'Linked List'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'Stacks are used in many programming scenarios, including function calls and undo operations!',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_005',
      question: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'Binary search is one of the most efficient search algorithms, reducing search time exponentially!',
      category: 'programming',
      subcategory: 'Algorithms'
    }
  ],
  'ai': [
    {
      id: 'ai_001',
      question: 'What does ML stand for in AI context?',
      options: ['Machine Learning', 'Modern Language', 'Mobile Learning', 'Mathematical Logic'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Machine Learning is a subset of AI that enables computers to learn from data without explicit programming!',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_002',
      question: 'Which neural network architecture is best for image recognition?',
      options: ['RNN', 'CNN', 'LSTM', 'GAN'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Convolutional Neural Networks (CNNs) were inspired by the visual cortex of animals!',
      category: 'ai',
      subcategory: 'Computer Vision'
    },
    {
      id: 'ai_003',
      question: 'What is the Turing Test designed to evaluate?',
      options: ['Computer speed', 'Machine intelligence', 'Network security', 'Data storage'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The Turing Test was proposed by Alan Turing in 1950 and remains a fundamental concept in AI!',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_004',
      question: 'Which technique helps prevent overfitting in neural networks?',
      options: ['Increasing layers', 'Dropout', 'Adding neurons', 'Raising learning rate'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'Dropout randomly "drops out" neurons during training, forcing the network to be more robust!',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    {
      id: 'ai_005',
      question: 'What is the main advantage of transformer models?',
      options: ['Speed', 'Attention mechanism', 'Memory usage', 'Accuracy'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Transformers revolutionized NLP by allowing models to focus on relevant parts of input text!',
      category: 'ai',
      subcategory: 'NLP'
    }
  ]
}

// ===================================================================
// Quiz Database Utility Functions
// ===================================================================
// Helper functions for retrieving and managing quiz content

// Retrieve questions for a specific category with optional filtering
// Parameters:
// - categoryId: The ID of the category to retrieve questions from
// - difficulty: Optional difficulty filter (beginner, intermediate, advanced)
// - count: Optional limit on number of questions to return
// Returns: Array of QuizQuestion objects
export const getQuestionsForCategory = (categoryId: string, difficulty?: string, count?: number): QuizQuestion[] => {
  // Get all questions for the specified category or return empty array if not found
  const categoryQuestions = QUIZ_DATABASE[categoryId] || []
  
  // Filter questions by difficulty if specified
  let filteredQuestions = categoryQuestions
  if (difficulty) {
    filteredQuestions = categoryQuestions.filter(q => q.difficulty === difficulty)
  }
  
  // Shuffle questions randomly to provide variety
  const shuffled = filteredQuestions.sort(() => Math.random() - 0.5)
  
  // Return requested count or all questions if count not specified
  return count ? shuffled.slice(0, count) : shuffled
}

// Get a random selection of questions from a category
// Parameters:
// - categoryId: The ID of the category to retrieve questions from
// - count: Number of questions to return (default: 5)
// Returns: Array of randomly selected QuizQuestion objects
export const getRandomQuestions = (categoryId: string, count: number = 5): QuizQuestion[] => {
  // Get all questions for the specified category or return empty array if not found
  const allQuestions = QUIZ_DATABASE[categoryId] || []
  
  // Shuffle questions randomly
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)
  
  // Return the requested number of questions
  return shuffled.slice(0, count)
}

// Get information about a specific quiz category
// Parameters:
// - categoryId: The ID of the category to retrieve information for
// Returns: QuizCategory object with category metadata
export const getCategoryInfo = (categoryId: string) => {
  // Return the requested category information or default to programming category if not found
  return QUIZ_CATEGORIES[categoryId] || QUIZ_CATEGORIES.programming
}
