// ===================================================================
// TechKwiz Comprehensive Quiz Database
// ===================================================================
// This file contains the complete quiz database with original content
// featuring original questions across 8 categories with multiple difficulty levels.
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
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'pop-culture-flash': {
    id: 'pop-culture-flash',
    name: 'Pop Culture Flash',
    icon: '🎬',
    color: 'from-red-500 to-pink-600',
    description: 'Decode trends and viral moments',
    subcategories: ['TikTok', 'Music', 'Celebrities', 'Memes'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'micro-trivia': {
    id: 'micro-trivia',
    name: 'Micro-Trivia Tournaments',
    icon: '🧠',
    color: 'from-blue-500 to-cyan-600',
    description: 'Lightning-fast knowledge battles',
    subcategories: ['Random Facts', 'Quick Fire', 'Brain Teasers', 'Speed Round'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'social-identity': {
    id: 'social-identity',
    name: 'Social Identity Quizzes',
    icon: '🤳',
    color: 'from-purple-500 to-indigo-600',
    description: 'Find your digital persona match',
    subcategories: ['Influencer Type', 'Content Style', 'Social Vibe', 'Online Persona'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'trend-vibes': {
    id: 'trend-vibes',
    name: 'Trend & Local Vibes',
    icon: '🎯',
    color: 'from-orange-500 to-yellow-600',
    description: 'Stay plugged into what\'s viral',
    subcategories: ['TikTok Slang', 'Viral Trends', 'Local Culture', 'Gen Z Language'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'future-you': {
    id: 'future-you',
    name: 'Future-You Simulations',
    icon: '🔮',
    color: 'from-green-500 to-teal-600',
    description: 'Predict your path and tech trends',
    subcategories: ['Career Paths', 'Tech Future', 'Life Predictions', 'AI vs Human'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'programming': {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    color: 'from-blue-500 to-purple-600',
    description: 'Test your coding knowledge',
    subcategories: ['JavaScript', 'Python', 'HTML', 'Algorithms'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
  'ai': {
    id: 'ai',
    name: 'Artificial Intelligence',
    icon: '🤖',
    color: 'from-purple-500 to-pink-600',
    description: 'Explore AI and machine learning',
    subcategories: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'],
    entry_fee: 100,
    get prize_pool() { return calculateCategoryMaxCoins(this.id) }, // Automatically calculates max coins for one round
  },
}

// ===================================================================
// Quiz Database Content
// ===================================================================
// Complete collection of quiz questions organized by category
// Contains original questions across 8 categories
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
    },
    {
      id: "prog_006",
      question: "In JavaScript, which statement about `let` and `var` is correct?",
      options: [
        "`let` is function-scoped, `var` is block-scoped",
        "Both `let` and `var` are block-scoped",
        "`let` is block-scoped, `var` is function-scoped",
        "`var` cannot be redeclared in the same scope"
      ],
      correct_answer: 2,
      difficulty: "beginner",
      fun_fact: "Variables declared with `let` are confined to the block in which they are defined, while `var` declarations are hoisted to the enclosing function or global scope.",
      category: "programming",
      subcategory: "JavaScript"
    },
    {
      id: "prog_007",
      question: "In Python 3, what is the result of `3 * 'ab'`?",
      options: [
        "'ababab'",
        "'ab3'",
        "Error",
        "'abab'"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "In Python, multiplying a string by an integer repeats the string that many times, so `3 * 'ab'` yields `'ababab'`.",
      category: "programming",
      subcategory: "Python"
    },
    {
      id: "prog_008",
      question: "In Git, which command creates a new branch and switches to it in one step?",
      options: [
        "git branch new-branch",
        "git checkout -b new-branch",
        "git switch new-branch",
        "git merge new-branch"
      ],
      correct_answer: 1,
      difficulty: "beginner",
      fun_fact: "`git checkout -b <branch>` creates a new branch and immediately switches to it, combining `git branch` and `git checkout` into a single command.",
      category: "programming",
      subcategory: "Git"
    },
    {
      id: "prog_009",
      question: "In CSS, which property is used to change the text color of an element?",
      options: [
        "font-color",
        "text-color",
        "color",
        "foreground-color"
      ],
      correct_answer: 2,
      difficulty: "beginner",
      fun_fact: "The `color` property sets the foreground color of an element's text content; there is no `font-color` or `text-color` property in standard CSS.",
      category: "programming",
      subcategory: "CSS"
    },
    {
      id: "prog_010",
      question: "Which HTTP status code indicates that a requested resource has been permanently moved to a new URL?",
      options: [
        "301",
        "302",
        "404",
        "500"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "HTTP 301 Moved Permanently tells clients and search engines that the resource has a new permanent URL, whereas 302 indicates a temporary redirect.",
      category: "programming",
      subcategory: "HTTP"
    },
    {
      id: "prog_011",
      question: "In SQL, which clause is used to filter groups produced by `GROUP BY`?",
      options: [
        "WHERE",
        "HAVING",
        "ORDER BY",
        "LIMIT"
      ],
      correct_answer: 1,
      difficulty: "beginner",
      fun_fact: "The `HAVING` clause applies conditions to aggregated groups after `GROUP BY`, while `WHERE` filters individual rows before grouping.",
      category: "programming",
      subcategory: "SQL"
    },
    {
      id: "prog_012",
      question: "In JavaScript, what does `Array.prototype.map` return?",
      options: [
        "The original array modified in place",
        "A new array with the results of calling a function on every element",
        "The first element that satisfies a condition",
        "A single accumulated value"
      ],
      correct_answer: 1,
      difficulty: "beginner",
      fun_fact: "`map` creates a new array by applying a callback to each element of the original array, leaving the original array unchanged.",
      category: "programming",
      subcategory: "JavaScript"
    },
    {
      id: "prog_013",
      question: "In Python 3, which of the following is the correct way to open a file for reading and ensure it is closed automatically?",
      options: [
        "f = open('file.txt', 'r')",
        "with open('file.txt', 'r') as f:",
        "open('file.txt', 'r').read()",
        "f = file('file.txt', 'r')"
      ],
      correct_answer: 1,
      difficulty: "beginner",
      fun_fact: "Using a `with` statement creates a context manager that closes the file automatically when the block exits, even if an exception occurs.",
      category: "programming",
      subcategory: "Python"
    },
    {
      id: "prog_014",
      question: "In JavaScript (ES2020), what is the value of `0 ?? 'default'`?",
      options: [
        "0",
        "'default'",
        "null",
        "undefined"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "The nullish coalescing operator (`??`) returns the right-hand side only if the left-hand side is `null` or `undefined`; since `0` is neither, the result is `0`.",
      category: "programming",
      subcategory: "JavaScript"
    },
    {
      id: "prog_015",
      question: "In Python 3, what is the output of `list(range(3))`?",
      options: [
        "[0, 1, 2, 3]",
        "[0, 1, 2]",
        "[1, 2, 3]",
        "[3]"
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      fun_fact: "`range(3)` generates integers starting at 0 and stopping before 3, so converting it to a list yields `[0, 1, 2]`.",
      category: "programming",
      subcategory: "Python"
    },
    {
      id: "prog_016",
      question: "In Git, which command is used to view the commit history?",
      options: [
        "git status",
        "git log",
        "git diff",
        "git show"
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      fun_fact: "`git log` displays the commit history, including commit hashes, authors, dates, and messages, allowing you to review past changes.",
      category: "programming",
      subcategory: "Git"
    },
    {
      id: "prog_017",
      question: "In CSS, what is the specificity of the selector `#header .nav a`?",
      options: [
        "(1,0,1)",
        "(0,1,1)",
        "(1,1,1)",
        "(0,2,1)"
      ],
      correct_answer: 2,
      difficulty: "intermediate",
      fun_fact: "Specificity is calculated as (ID selectors, class/attribute/pseudo-class selectors, type selectors). Here, `#header` contributes one ID, `.nav` contributes one class, and `a` contributes one type, giving (1,1,1).",
      category: "programming",
      subcategory: "CSS"
    },
    {
      id: "prog_018",
      question: "Which HTTP header is used to indicate the media type of the resource in a response?",
      options: [
        "Content-Type",
        "Accept",
        "Content-Length",
        "User-Agent"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "The `Content-Type` header specifies the media type (e.g., `text/html`, `application/json`) of the response body, helping the client interpret the data correctly.",
      category: "programming",
      subcategory: "HTTP"
    },
    {
      id: "prog_019",
      question: "In SQL, which type of join returns all rows from the left table and matching rows from the right table, with NULLs for non-matching right-side rows?",
      options: [
        "INNER JOIN",
        "LEFT JOIN",
        "RIGHT JOIN",
        "FULL JOIN"
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      fun_fact: "A LEFT JOIN (or LEFT OUTER JOIN) preserves all rows from the left table, filling columns from the right table with NULL where no match exists.",
      category: "programming",
      subcategory: "SQL"
    },
    {
      id: "prog_020",
      question: "In JavaScript, what is the result of `typeof null`?",
      options: [
        "'null'",
        "'object'",
        "'undefined'",
        "'number'"
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      fun_fact: "Due to a historical bug in JavaScript's initial implementation, `typeof null` returns `'object'` even though `null` is a primitive value.",
      category: "programming",
      subcategory: "JavaScript"
    },
    {
      id: "prog_021",
      question: "In Python 3, what does the `enumerate` function return?",
      options: [
        "A list of tuples",
        "An iterator of index-value pairs",
        "A dictionary of indices and values",
        "A generator of values only"
      ],
      correct_answer: 1,
      difficulty: "intermediate",
      fun_fact: "`enumerate` returns an iterator that yields tuples of (index, element) from an iterable, allowing you to loop with both index and value.",
      category: "programming",
      subcategory: "Python"
    },
    {
      id: "prog_022",
      question: "In Git, what does the `git reset --hard` command do?",
      options: [
        "Moves HEAD and resets the index and working directory to the specified commit",
        "Only unstages changes but keeps working directory intact",
        "Creates a new commit that reverts previous changes",
        "Permanently deletes the entire repository history"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "`git reset --hard` discards all changes in the working directory and index, moving HEAD to the specified commit, so uncommitted work is lost.",
      category: "programming",
      subcategory: "Git"
    },
    {
      id: "prog_023",
      question: "In CSS, what does the `box-sizing: border-box` declaration do?",
      options: [
        "Includes padding and border in the element's total width and height",
        "Excludes padding and border from the element's total width and height",
        "Makes the element's width and height fixed",
        "Applies a border to all sides of the element"
      ],
      correct_answer: 0,
      difficulty: "advanced",
      fun_fact: "With `border-box`, the specified width and height include padding and border, making layout calculations more predictable and preventing elements from growing unexpectedly.",
      category: "programming",
      subcategory: "CSS"
    },
    {
      id: "prog_024",
      question: "In HTTP/2, which feature allows multiple requests and responses to be interleaved over a single connection?",
      options: [
        "Pipelining",
        "Chunked transfer encoding",
        "Multiplexing",
        "Upgrade header"
      ],
      correct_answer: 2,
      difficulty: "advanced",
      fun_fact: "HTTP/2 multiplexing enables many streams to be active simultaneously on one TCP connection, eliminating head-of-line blocking at the HTTP level.",
      category: "programming",
      subcategory: "HTTP"
    },
    {
      id: "prog_025",
      question: "In SQL, what is the primary purpose of a window function?",
      options: [
        "To perform calculations across a set of rows related to the current row without collapsing the result set",
        "To combine rows from two or more tables into a single result set",
        "To filter rows based on a condition",
        "To sort the result set in ascending or descending order"
      ],
      correct_answer: 0,
      difficulty: "advanced",
      fun_fact: "Window functions, such as `ROW_NUMBER()` or `SUM() OVER (...)`, compute values across a partition of rows while retaining the individual rows in the output.",
      category: "programming",
      subcategory: "SQL"
    },
    {
      id: "prog_026",
      question: "In JavaScript (ES2020), what does optional chaining (`?.`) do when accessing a property?",
      options: [
        "Throws a TypeError if the object is null or undefined",
        "Returns undefined if the object is null or undefined",
        "Returns null if the object is null or undefined",
        "Skips the property access entirely"
      ],
      correct_answer: 1,
      difficulty: "advanced",
      fun_fact: "Optional chaining returns `undefined` instead of throwing an error when the target is `null` or `undefined`, simplifying safe property access.",
      category: "programming",
      subcategory: "JavaScript"
    },
    {
      id: "prog_027",
      question: "In Python 3, what is the primary difference between `deepcopy` and `copy` from the `copy` module?",
      options: [
        "`deepcopy` creates a new object and recursively copies nested objects, while `copy` creates a shallow copy",
        "`copy` creates a new object and recursively copies nested objects, while `deepcopy` creates a shallow copy",
        "`deepcopy` only works on immutable objects",
        "`copy` is faster but modifies the original object"
      ],
      correct_answer: 0,
      difficulty: "advanced",
      fun_fact: "`deepcopy` builds a new object and recursively copies all nested objects, whereas `copy` (shallow copy) creates a new object but references the same nested objects as the original.",
      category: "programming",
      subcategory: "Python"
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
    },
    {
      id: "ai_006",
      question: "Which type of machine learning uses labeled training data?",
      options: [
        "Supervised learning",
        "Unsupervised learning",
        "Reinforcement learning",
        "Self-supervised learning"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Supervised learning learns a mapping from inputs to outputs using example pairs where the correct output is provided, such as labeled images or emails marked spam or not spam.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_007",
      question: "What is the main goal of unsupervised learning?",
      options: [
        "To find hidden patterns or structure in unlabeled data",
        "To maximize a reward signal through trial and error",
        "To predict a continuous output from labeled examples",
        "To classify data into predefined categories"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Unsupervised learning works with data that has no labels, aiming to discover groupings, densities, or other structure, such as clustering customers by behavior.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_008",
      question: "In machine learning, what does 'overfitting' mean?",
      options: [
        "The model performs well on training data but poorly on new, unseen data",
        "The model performs poorly on both training and test data",
        "The model is too simple to capture the underlying pattern",
        "The model requires too much training data"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Overfitting happens when a model learns noise or idiosyncrasies of the training set, so it fails to generalize; techniques like regularization and cross-validation help mitigate it.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_009",
      question: "Which of these is a common classification algorithm?",
      options: [
        "Logistic regression",
        "Linear regression",
        "K-means clustering",
        "Principal component analysis"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Logistic regression is used for binary classification because it outputs a probability between 0 and 1, while linear regression predicts continuous values and k-means and PCA are unsupervised methods.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_010",
      question: "What is the purpose of a validation set in machine learning?",
      options: [
        "To tune model hyperparameters and estimate performance before final testing",
        "To train the model's weights",
        "To provide the final unbiased evaluation of the model",
        "To increase the size of the training data"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "A validation set is used to select hyperparameters and compare models, while the test set is reserved for a final, unbiased evaluation; using the test set for tuning would leak information.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_011",
      question: "Which statement best describes the bias-variance tradeoff?",
      options: [
        "Models with high bias underfit, while models with high variance overfit; balancing them improves generalization",
        "Increasing model complexity always reduces both bias and variance",
        "Bias and variance are both minimized by using more training data",
        "High variance models are always preferable because they capture more detail"
      ],
      correct_answer: 0,
      difficulty: "advanced",
      fun_fact: "Bias arises from overly simple assumptions (underfitting), and variance from sensitivity to training data (overfitting); the goal is to find a complexity that minimizes total error on unseen data.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_012",
      question: "What is a key characteristic of deep learning models?",
      options: [
        "They use neural networks with multiple hidden layers",
        "They require manually engineered features",
        "They only work with structured tabular data",
        "They are limited to linear transformations"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Deep learning models stack many layers of artificial neurons, allowing them to learn hierarchical representations directly from raw data such as pixels or text.",
      category: "ai",
      subcategory: "Deep Learning"
    },
    {
      id: "ai_013",
      question: "In a neural network, what is the role of an activation function?",
      options: [
        "To introduce non-linearity into the network",
        "To initialize the weights",
        "To compute the loss",
        "To update the learning rate"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "Activation functions like ReLU or sigmoid enable neural networks to approximate complex non-linear functions; without them, stacking layers would still yield a linear model.",
      category: "ai",
      subcategory: "Deep Learning"
    },
    {
      id: "ai_014",
      question: "What does backpropagation compute?",
      options: [
        "Gradients of the loss with respect to network weights",
        "The forward output of the network",
        "The number of layers in the network",
        "The optimal learning rate"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "Backpropagation applies the chain rule to efficiently compute gradients, which are then used by an optimizer like SGD or Adam to update the weights.",
      category: "ai",
      subcategory: "Deep Learning"
    },
    {
      id: "ai_015",
      question: "Why are convolutional layers well-suited for image data?",
      options: [
        "They exploit local spatial patterns and weight sharing",
        "They reduce the number of training examples needed",
        "They automatically label images",
        "They eliminate the need for activation functions"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "Convolutional filters slide across the image, sharing weights and capturing local features like edges; this makes them parameter-efficient and translation-equivariant for visual data.",
      category: "ai",
      subcategory: "Deep Learning"
    },
    {
      id: "ai_016",
      question: "What is the vanishing gradient problem?",
      options: [
        "Gradients become very small in deep networks, slowing or halting learning",
        "Gradients become too large and cause numerical overflow",
        "The model forgets previously learned tasks",
        "The learning rate decreases to zero automatically"
      ],
      correct_answer: 0,
      difficulty: "advanced",
      fun_fact: "In deep networks with certain activation functions like sigmoid, gradients can shrink exponentially as they propagate back, making early layers hard to train; ReLU and residual connections help address this.",
      category: "ai",
      subcategory: "Deep Learning"
    },
    {
      id: "ai_017",
      question: "What is tokenization in natural language processing?",
      options: [
        "Splitting text into smaller units like words or subwords",
        "Converting text to lowercase",
        "Removing stop words",
        "Translating text to another language"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Tokenization breaks text into tokens, which may be words, characters, or subwords, so models can process language as discrete units; modern LLMs often use subword tokenizers to handle rare words.",
      category: "ai",
      subcategory: "NLP"
    },
    {
      id: "ai_018",
      question: "Which architecture is the foundation of most modern large language models?",
      options: [
        "Transformer",
        "Convolutional neural network",
        "Recurrent neural network",
        "Support vector machine"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "The Transformer, introduced in 2017, uses self-attention to process sequences in parallel and has become the dominant architecture for LLMs like GPT and BERT.",
      category: "ai",
      subcategory: "NLP"
    },
    {
      id: "ai_019",
      question: "What is the primary pretraining objective of models like BERT?",
      options: [
        "Masked language modeling",
        "Next-word prediction",
        "Image classification",
        "Reinforcement learning from human feedback"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "BERT is pretrained by masking some tokens and predicting them from context, which helps it learn bidirectional representations; this differs from autoregressive objectives used by GPT-style models.",
      category: "ai",
      subcategory: "NLP"
    },
    {
      id: "ai_020",
      question: "In the context of large language models, what is a 'token'?",
      options: [
        "A piece of text, often a word or subword, that the model processes",
        "A unit of currency for API usage",
        "A special character used for authentication",
        "A type of neural network layer"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "LLMs break text into tokens (which may be whole words, parts of words, or punctuation) and process sequences of these tokens; token counts determine context length and API costs.",
      category: "ai",
      subcategory: "NLP"
    },
    {
      id: "ai_021",
      question: "What does the 'context window' of an LLM refer to?",
      options: [
        "The maximum number of tokens the model can consider at once",
        "The range of salaries for AI engineers",
        "The time it takes to train the model",
        "The set of languages the model supports"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "The context window limits how much text (in tokens) the model can attend to in a single forward pass; inputs longer than the window must be truncated or otherwise handled.",
      category: "ai",
      subcategory: "NLP"
    },
    {
      id: "ai_022",
      question: "Which technique helps reduce hallucinations by grounding an LLM in external documents?",
      options: [
        "Retrieval-augmented generation (RAG)",
        "Increasing the temperature",
        "Fine-tuning on the test set",
        "Using a larger batch size"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "RAG retrieves relevant passages from a knowledge base and provides them to the model as context, which can improve factual accuracy and reduce fabricated responses.",
      category: "ai",
      subcategory: "NLP"
    },
    {
      id: "ai_023",
      question: "What is the difference between training and inference in machine learning?",
      options: [
        "Training adjusts model parameters; inference uses the trained model to make predictions",
        "Training makes predictions; inference adjusts parameters",
        "They are the same process",
        "Inference is only for neural networks"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Training involves optimizing model weights on data, often requiring significant computation, while inference is the forward pass using the trained weights to produce outputs.",
      category: "ai",
      subcategory: "Machine Learning"
    },
    {
      id: "ai_024",
      question: "In computer vision, what does image segmentation aim to do?",
      options: [
        "Assign a label to each pixel or region",
        "Classify the whole image into one category",
        "Detect bounding boxes around objects",
        "Generate captions for images"
      ],
      correct_answer: 0,
      difficulty: "intermediate",
      fun_fact: "Segmentation goes beyond image classification by producing a dense label map, which is useful for tasks like medical imaging and autonomous driving.",
      category: "ai",
      subcategory: "Computer Vision"
    },
    {
      id: "ai_025",
      question: "What is data augmentation in computer vision?",
      options: [
        "Creating modified versions of training images to improve generalization",
        "Adding more labels to the dataset",
        "Increasing the resolution of images",
        "Removing noisy images from the dataset"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Techniques like rotation, cropping, and color jitter expand the effective training set and help models become invariant to such transformations, reducing overfitting.",
      category: "ai",
      subcategory: "Computer Vision"
    },
    {
      id: "ai_026",
      question: "What is a common evaluation metric for object detection models?",
      options: [
        "Mean average precision (mAP)",
        "Accuracy",
        "Perplexity",
        "BLEU score"
      ],
      correct_answer: 0,
      difficulty: "advanced",
      fun_fact: "mAP averages precision across recall levels and intersection-over-union thresholds, providing a comprehensive measure of detection performance that accounts for both localization and classification.",
      category: "ai",
      subcategory: "Computer Vision"
    },
    {
      id: "ai_027",
      question: "What is a 'hallucination' in the context of large language models?",
      options: [
        "When the model generates plausible but incorrect or fabricated information",
        "When the model refuses to answer a question",
        "When the model repeats the same phrase",
        "When the model times out during inference"
      ],
      correct_answer: 0,
      difficulty: "beginner",
      fun_fact: "Hallucinations occur because LLMs are trained to produce fluent text, not necessarily factual text, and they may invent details when unsure; this is an active area of research.",
      category: "ai",
      subcategory: "NLP"
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
