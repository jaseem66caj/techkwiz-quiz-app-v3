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
    },
    {
      id: 'pop_006',
      question: 'Which celebrity launched the makeup brand Fenty Beauty in 2017?',
      options: ['Kylie Jenner', 'Rihanna', 'Lady Gaga', 'Kim Kardashian'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Fenty Beauty\'s inclusive foundation range won a spot on Time\'s Best Inventions list.',
      category: 'pop-culture-flash',
      subcategory: 'Celebrities'
    },
    {
      id: 'pop_007',
      question: 'What animal is featured in the \'Doge\' meme?',
      options: ['Cat', 'Dog', 'Rabbit', 'Hamster'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The original Doge photo features Kabosu, a Shiba Inu rescue dog from Japan.',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    },
    {
      id: 'pop_008',
      question: 'Which TikTok trend involves users freezing in place while a specific audio plays?',
      options: ['The Blinding Lights Challenge', 'The Mannequin Challenge', 'The Savage Challenge', 'The Wipe It Down Challenge'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The Mannequin Challenge went viral in 2016, with even celebrities participating.',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_009',
      question: 'What meme features a character from the show \'Real Housewives\' yelling at a cat?',
      options: ['Woman Yelling at a Cat', 'Distracted Boyfriend', 'Mocking SpongeBob', 'Change My Mind'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The meme combines a scene from \'The Real Housewives of Beverly Hills\' with a confused cat photo.',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    },
    {
      id: 'pop_010',
      question: 'Which Netflix series about a chess prodigy became a viral hit in 2020?',
      options: ['The Crown', 'Stranger Things', 'The Queen\'s Gambit', 'Bridgerton'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'The series sparked a surge in chess set sales and online chess memberships.',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_011',
      question: 'What social media app popularized short-form videos with trends like \'Renegade\' and \'Savage\'?',
      options: ['Instagram', 'Snapchat', 'TikTok', 'YouTube Shorts'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'TikTok was the most downloaded app of 2020, surpassing 2 billion global downloads.',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_012',
      question: 'Which artist released the album \'Future Nostalgia\' in 2020?',
      options: ['Dua Lipa', 'Lady Gaga', 'Katy Perry', 'Miley Cyrus'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The album\'s single \'Don\'t Start Now\' became a TikTok dance favorite.',
      category: 'pop-culture-flash',
      subcategory: 'Music'
    },
    {
      id: 'pop_013',
      question: 'Which celebrity became known for the phrase \'OK, boomer\' in a 2019 viral moment?',
      options: ['Chlöe Swarbrick', 'Greta Thunberg', 'Lil Nas X', 'Noah Centineo'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'New Zealand politician Chlöe Swarbrick used the phrase in parliament, bringing it mainstream.',
      category: 'pop-culture-flash',
      subcategory: 'Celebrities'
    },
    {
      id: 'pop_014',
      question: 'What meme format uses a screenshot of a character from the show \'The Office\' with a smug expression?',
      options: ['Pepe the Frog', 'Roll Safe', 'Drake Hotline Bling', 'Arthur Fist'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The Roll Safe meme features actor Kayode Ewumi from the web series \'Hood Documentary\'.',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    },
    {
      id: 'pop_015',
      question: 'What 2021 song by Olivia Rodrigo broke Spotify records for most streams in a week?',
      options: ['drivers license', 'good 4 u', 'deja vu', 'traitor'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The song debuted at number one on the Billboard Hot 100, fueled by TikTok virality.',
      category: 'pop-culture-flash',
      subcategory: 'Music'
    },
    {
      id: 'pop_016',
      question: 'Which actor portrayed the Joker in the 2019 film directed by Todd Phillips?',
      options: ['Jared Leto', 'Joaquin Phoenix', 'Heath Ledger', 'Jack Nicholson'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Joaquin Phoenix won the Academy Award for Best Actor for the role.',
      category: 'pop-culture-flash',
      subcategory: 'Celebrities'
    },
    {
      id: 'pop_017',
      question: 'Which TikTok trend had people pretending to be in a music video for the song \'Blinding Lights\'?',
      options: ['The Blinding Lights Challenge', 'The Renegade', 'The Cannibal Dance', 'The Kiki Challenge'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The challenge involved coordinated dance moves to The Weeknd\'s 2019 hit.',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_018',
      question: 'What band released the album \'After Hours\' in 2020?',
      options: ['The Weeknd', 'Maroon 5', 'Imagine Dragons', 'Coldplay'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The Weeknd\'s red-suited character from the album became a viral meme.',
      category: 'pop-culture-flash',
      subcategory: 'Music'
    },
    {
      id: 'pop_019',
      question: 'What meme features a photo of a man checking out another woman while his girlfriend looks on disapprovingly?',
      options: ['Distracted Boyfriend', 'Woman Yelling at a Cat', 'Left Exit 12 Off Ramp', 'Disaster Girl'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The original stock photo was taken in 2015 by photographer Antonio Guillem.',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    },
    {
      id: 'pop_020',
      question: 'Which artist\'s song \'WAP\' featuring Megan Thee Stallion broke streaming records in 2020?',
      options: ['Cardi B', 'Nicki Minaj', 'Doja Cat', 'Saweetie'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The song\'s controversial lyrics prompted political commentary and a viral dance challenge.',
      category: 'pop-culture-flash',
      subcategory: 'Music'
    },
    {
      id: 'pop_021',
      question: 'Which celebrity couple\'s 2021 divorce was heavily covered on social media?',
      options: ['Kim Kardashian and Kanye West', 'Jennifer Lopez and Alex Rodriguez', 'Gwen Stefani and Blake Shelton', 'Miley Cyrus and Liam Hemsworth'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Kim Kardashian filed for divorce after nearly seven years of marriage to Kanye West.',
      category: 'pop-culture-flash',
      subcategory: 'Celebrities'
    },
    {
      id: 'pop_022',
      question: 'What meme features a screenshot of a character from \'SpongeBob SquarePants\' looking exhausted?',
      options: ['Mocking SpongeBob', 'Surprised Pikachu', 'Roll Safe', 'Hide the Pain Harold'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The Mocking SpongeBob meme uses the image of SpongeBob with a distorted face from the episode \'Little Yellow Book\'.',
      category: 'pop-culture-flash',
      subcategory: 'Memes'
    },
    {
      id: 'pop_023',
      question: 'Which TikTok trend involved users showing off their outfits while walking to the song \'Savage\'?',
      options: ['The Savage Challenge', 'The Outfit Change', 'The #BussItChallenge', 'The Fashion Walk'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The trend featured a specific dance to Megan Thee Stallion\'s \'Savage\'.',
      category: 'pop-culture-flash',
      subcategory: 'TikTok'
    },
    {
      id: 'pop_024',
      question: 'Which singer released the visual album \'Lemonade\' in 2016?',
      options: ['Beyoncé', 'Rihanna', 'Alicia Keys', 'Jennifer Hudson'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The album\'s film premiered on HBO and explored themes of betrayal and Black womanhood.',
      category: 'pop-culture-flash',
      subcategory: 'Music'
    },
    {
      id: 'pop_025',
      question: 'Which celebrity has a famous feud with Taylor Swift that started over a business deal?',
      options: ['Katy Perry', 'Kim Kardashian', 'Scooter Braun', 'Kanye West'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'The feud escalated when Scooter Braun acquired the rights to Taylor\'s early masters.',
      category: 'pop-culture-flash',
      subcategory: 'Celebrities'
    },
    {
      id: 'pop_026',
      question: 'What meme uses a photo of a young girl smiling in front of a burning house?',
      options: ['Disaster Girl', 'Success Kid', 'Bad Luck Brian', 'Side-Eyeing Chloe'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The photo was taken in 2005 and the girl, Zoe Roth, later sold it as an NFT for $500,000.',
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
    },
    {
      id: 'micro_006',
      question: 'What is the hardest natural substance on Earth?',
      options: ['Diamond', 'Quartz', 'Topaz', 'Corundum'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Diamonds are made of pure carbon and can only be scratched by another diamond.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_007',
      question: 'Which planet has the most moons in our solar system?',
      options: ['Earth', 'Mars', 'Saturn', 'Jupiter'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Saturn has over 270 confirmed moons, far more than any other planet in the solar system.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_008',
      question: 'What is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: 'The Pacific Ocean covers more area than all land combined.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_009',
      question: 'How many continents are there on Earth?',
      options: ['5', '6', '7', '8'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'The seven continents are Africa, Antarctica, Asia, Europe, North America, Oceania, and South America.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_010',
      question: 'What is the chemical symbol for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Water is the only substance found naturally on Earth in all three states: solid, liquid, and gas.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_011',
      question: 'Which country is both an island and a continent?',
      options: ['Australia', 'Greenland', 'Madagascar', 'Japan'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Australia is the smallest continent and the sixth-largest country by area.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_012',
      question: 'What is the longest bone in the human body?',
      options: ['Femur', 'Tibia', 'Humerus', 'Fibula'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The femur, or thigh bone, can support up to 30 times the weight of an adult human.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_013',
      question: 'Which planet is known as the Red Planet?',
      options: ['Jupiter', 'Mars', 'Venus', 'Mercury'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Mars gets its red color from iron oxide, or rust, on its surface.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_014',
      question: 'What is the smallest prime number?',
      options: ['0', '1', '2', '3'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: '2 is the only even prime number.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_015',
      question: 'Who wrote the play \'Romeo and Juliet\'?',
      options: ['Charles Dickens', 'Jane Austen', 'William Shakespeare', 'Mark Twain'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Shakespeare wrote 37 plays and 154 sonnets.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_016',
      question: 'What is the speed of light in vacuum approximately?',
      options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Light travels around Earth 7.5 times in one second.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_017',
      question: 'What is the largest species of shark?',
      options: ['Great white shark', 'Whale shark', 'Tiger shark', 'Hammerhead shark'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Whale sharks can grow up to 12 meters long and are filter feeders.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_018',
      question: 'In what year did the Titanic sink?',
      options: ['1905', '1912', '1915', '1920'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'The Titanic sank on April 15, 1912, after hitting an iceberg.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_019',
      question: 'What is the rarest blood type?',
      options: ['A negative', 'B negative', 'AB negative', 'O negative'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'Only about 1% of the population has AB negative blood.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_020',
      question: 'What is the largest desert in the world?',
      options: ['Sahara', 'Gobi', 'Arabian', 'Antarctic'],
      correct_answer: 3,
      difficulty: 'intermediate',
      fun_fact: 'Antarctica is the largest desert because it receives less than 250 mm of precipitation annually.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_021',
      question: 'Which element is liquid at room temperature?',
      options: ['Mercury', 'Iron', 'Aluminum', 'Copper'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Mercury is the only metal that is liquid at standard room temperature.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_022',
      question: 'What is the study of mushrooms called?',
      options: ['Mycology', 'Botany', 'Zoology', 'Microbiology'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Mycology comes from the Greek word \'mykes\' meaning fungus.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_023',
      question: 'How many hearts does an octopus have?',
      options: ['1', '2', '3', '4'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'Two hearts pump blood to the gills, while the third pumps it to the rest of the body.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_024',
      question: 'What is the highest mountain in Africa?',
      options: ['Mount Kenya', 'Mount Kilimanjaro', 'Mount Stanley', 'Mount Elgon'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Mount Kilimanjaro is a dormant volcano with three volcanic cones.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_025',
      question: 'Which gas do plants absorb from the atmosphere?',
      options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'During photosynthesis, plants convert carbon dioxide and water into glucose and oxygen.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_026',
      question: 'What is the smallest country in the world by area?',
      options: ['Monaco', 'Vatican City', 'Nauru', 'San Marino'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Vatican City is about 0.44 square kilometers and has fewer than 1,000 residents.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_027',
      question: 'What is the only bird that can fly backwards?',
      options: ['Hummingbird', 'Sparrow', 'Eagle', 'Pigeon'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Hummingbirds can flap their wings up to 80 times per second.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_028',
      question: 'Which ancient wonder was located in Babylon?',
      options: ['Hanging Gardens', 'Great Pyramid', 'Colossus of Rhodes', 'Lighthouse of Alexandria'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'The Hanging Gardens were said to be built by King Nebuchadnezzar II for his homesick wife.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_029',
      question: 'What is the rarest naturally occurring element on Earth?',
      options: ['Astatine', 'Francium', 'Oganesson', 'Neptunium'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Astatine is so rare that less than 1 gram exists in Earth\'s crust at any time.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_030',
      question: 'How many ribs do most humans have?',
      options: ['22', '24', '26', '28'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Humans have 12 pairs of ribs, but some people have an extra cervical rib.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_031',
      question: 'What is the strongest muscle in the human body relative to its size?',
      options: ['Masseter', 'Heart', 'Gluteus maximus', 'Tongue'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'The masseter can exert a force of up to 200 pounds on the molars.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_032',
      question: 'Which planet has the shortest day?',
      options: ['Jupiter', 'Saturn', 'Neptune', 'Uranus'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Jupiter rotates once every 9 hours and 56 minutes.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_033',
      question: 'What is the only metal that is a liquid at room temperature and was historically used in thermometers?',
      options: ['Mercury', 'Gallium', 'Cesium', 'Rubidium'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Mercury was used in thermometers because it expands uniformly with temperature.',
      category: 'micro-trivia',
      subcategory: 'Random Facts'
    },
    {
      id: 'micro_034',
      question: 'Which country has the most natural lakes?',
      options: ['Canada', 'Russia', 'United States', 'Finland'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Canada has over 60,000 lakes, more than any other country.',
      category: 'micro-trivia',
      subcategory: 'Quick Fire'
    },
    {
      id: 'micro_035',
      question: 'What is the hardest known natural mineral after diamond?',
      options: ['Cubic boron nitride', 'Corundum', 'Moissanite', 'Wurtzite boron nitride'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'Corundum, found naturally as ruby and sapphire, rates 9 on the Mohs scale, just below diamond\'s 10.',
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
    },
    {
      id: 'trend_006',
      question: 'What does \'POV\' stand for on TikTok?',
      options: ['Point of View', 'Power of Video', 'Picture on Video', 'Play Over Voice'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'POV videos often show scenarios from the viewer\'s perspective, like being the main character.',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    },
    {
      id: 'trend_007',
      question: 'Which viral dance trend involves a \'renegade\'?',
      options: ['The Renegade', 'The Floss', 'The Woah', 'The Stanky Leg'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The Renegade was created by Jalaiah Harmon and went viral on TikTok in 2020.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_008',
      question: 'In Gen Z slang, what does \'no cap\' mean?',
      options: ['No lie', 'No hat', 'No limit', 'No problem'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: '\'Cap\' meaning lie or exaggeration became widely used in hip-hop before mainstream adoption.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_009',
      question: 'What is the name of the Spanish festival where participants throw tomatoes?',
      options: ['La Tomatina', 'Running of the Bulls', 'Las Fallas', 'Feria de Abril'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'La Tomatina is held annually in Buñol, Spain, on the last Wednesday of August.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_010',
      question: 'What does \'GOAT\' mean in internet slang?',
      options: ['Greatest of All Time', 'Goat as in animal', 'Going Over All Topics', 'Good at All Things'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The term GOAT gained popularity through sports debates and LL Cool J\'s album \'G.O.A.T.\' in 2000.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_011',
      question: 'Which social media platform is known for disappearing \'Stories\'?',
      options: ['Snapchat', 'Facebook', 'Twitter', 'LinkedIn'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Snapchat launched Stories in 2013, a feature later copied by Instagram, Facebook, and WhatsApp.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_012',
      question: 'The \'Ice Bucket Challenge\' raised awareness for which disease?',
      options: ['ALS', 'Cancer', 'Diabetes', 'Alzheimer\'s'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The Ice Bucket Challenge went viral in 2014 and raised over $115 million for the ALS Association.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_013',
      question: 'What does \'FOMO\' stand for?',
      options: ['Fear of Missing Out', 'Feeling of Missing Out', 'Fear of Making Out', 'Forget My Old Opinion'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'FOMO was added to the Oxford English Dictionary in 2013.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_014',
      question: 'Which traditional Japanese dish consists of vinegared rice and raw fish?',
      options: ['Sushi', 'Ramen', 'Tempura', 'Sashimi'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Sushi originated in Southeast Asia as a way to preserve fish in fermented rice.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_015',
      question: 'On TikTok, what does \'duet\' refer to?',
      options: ['A feature to react to another video', 'A singing competition', 'A dance challenge', 'A type of filter'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The duet feature allows users to record a video alongside another user\'s video in a split-screen.',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    },
    {
      id: 'trend_016',
      question: 'Which social media platform popularized the hashtag?',
      options: ['Twitter', 'Instagram', 'Facebook', 'Tumblr'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Twitter user Chris Messina proposed using the hash symbol to group tweets in 2007.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_017',
      question: 'What does \'TBH\' stand for?',
      options: ['To Be Honest', 'To Be Hated', 'Total Bad Habit', 'Throw Back Here'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'TBH is often used in comments to give honest opinions or compliments.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_018',
      question: 'The \'Dab\' dance move originated from which music scene?',
      options: ['Atlanta hip-hop', 'K-pop', 'Latin pop', 'Country'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The dab was popularized by rappers like Migos and became a global phenomenon in 2016.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_019',
      question: 'What does \'AFK\' mean in online chat?',
      options: ['Away from keyboard', 'All for keeping', 'A free kill', 'Another fine kid'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'AFK has been used since the early days of internet relay chat (IRC) in the 1990s.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_020',
      question: 'Which Indian festival is known as the festival of lights?',
      options: ['Diwali', 'Holi', 'Navratri', 'Eid'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Diwali symbolizes the victory of light over darkness and is celebrated by Hindus, Sikhs, and Jains.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_021',
      question: 'What is the name of the trend where people post photos of themselves as old people?',
      options: ['FaceApp challenge', 'Age challenge', 'Old filter trend', 'Time warp challenge'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'The FaceApp old age filter went viral in 2019, with many celebrities sharing their aged photos.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_022',
      question: 'What does the slang term \'lit\' mean?',
      options: ['Exciting or excellent', 'Intoxicated', 'On fire', 'Bright'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: '\'Lit\' has been used as slang for \'intoxicated\' since the 1910s and later evolved to mean \'exciting\'.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_023',
      question: 'Which country celebrates the Day of the Dead (Día de los Muertos)?',
      options: ['Mexico', 'Spain', 'Brazil', 'Argentina'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Día de los Muertos blends indigenous Aztec rituals with Catholicism and honors deceased loved ones.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_024',
      question: 'On TikTok, what does \'ratio\' mean in comments?',
      options: ['When replies outnumber likes', 'A type of filter', 'A dance move', 'A video editing technique'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Getting ratioed means a reply or quote tweet has more likes than the original post, often indicating criticism.',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    },
    {
      id: 'trend_025',
      question: 'What is the \'ok boomer\' phrase used to dismiss?',
      options: ['Outdated attitudes', 'Gen Z slang', 'Millennial fashion', 'Internet memes'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: '\'OK boomer\' became popular in 2019 as a retort to perceived condescension from older generations.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_026',
      question: 'Which social media platform introduced the \'Like\' button?',
      options: ['Facebook', 'Twitter', 'Instagram', 'YouTube'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Facebook introduced the Like button in 2009; Twitter\'s favorite (heart) came later in 2015.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_027',
      question: 'What does \'sksksk\' typically express?',
      options: ['Excitement or laughter', 'Sadness', 'Anger', 'Confusion'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Sksksk is associated with VSCO girls, a subculture that emerged in 2019.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_028',
      question: 'Which food is traditionally eaten during Chinese New Year for good luck?',
      options: ['Dumplings', 'Pizza', 'Sushi', 'Tacos'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Dumplings are shaped like ancient Chinese gold ingots, symbolizing wealth and prosperity.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_029',
      question: 'The \'Harlem Shake\' viral videos featured which song?',
      options: ['Harlem Shake by Baauer', 'Gangnam Style by Psy', 'Watch Me (Whip/Nae Nae)', 'Old Town Road'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'The Harlem Shake meme peaked in February 2013, with thousands of videos uploaded daily.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_030',
      question: 'What does \'stan\' mean in internet culture?',
      options: ['An obsessive fan', 'A hater', 'A casual follower', 'A content creator'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Stan comes from Eminem\'s 2000 song about an obsessed fan, blending \'stalker\' and \'fan\'.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_031',
      question: 'Which platform is known for \'threads\' of connected posts?',
      options: ['Twitter', 'Instagram', 'TikTok', 'Snapchat'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Twitter threads allow users to bypass the character limit by linking multiple tweets.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_032',
      question: 'What is the traditional Scottish dish made from sheep\'s stomach?',
      options: ['Haggis', 'Black pudding', 'Shepherd\'s pie', 'Scotch egg'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Haggis is traditionally served on Burns Night, celebrating poet Robert Burns.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_033',
      question: 'On TikTok, what is a \'niche\' sound?',
      options: ['An audio clip specific to a small community', 'A popular song', 'A sound effect', 'A royalty-free track'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Niche sounds often come from obscure TV shows or movies and become in-jokes within subcultures.',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    },
    {
      id: 'trend_034',
      question: 'Which viral challenge involved people pouring ice water over their heads?',
      options: ['Ice Bucket Challenge', 'Cold Water Challenge', 'Freeze Challenge', 'Polar Plunge'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The Ice Bucket Challenge also led to the discovery of a new ALS gene due to increased research funding.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_035',
      question: 'What does \'yeet\' mean?',
      options: ['To throw forcefully', 'To agree', 'To dance', 'To laugh'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Yeet gained popularity in 2014 from a Vine video and is often used as an exclamation.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_036',
      question: 'Which country\'s tradition involves a tomato fight called La Tomatina?',
      options: ['Spain', 'Italy', 'Mexico', 'Portugal'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'La Tomatina started in 1945 when a crowd began throwing tomatoes during a parade.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_037',
      question: 'What does \'main character\' mean on TikTok?',
      options: ['Someone who acts like the protagonist of their life', 'A lead actor', 'A video editor', 'A content creator'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'The \'main character\' trend encourages people to romanticize their daily lives as if in a movie.',
      category: 'trend-vibes',
      subcategory: 'TikTok Slang'
    },
    {
      id: 'trend_038',
      question: 'Which social media platform\'s logo is a ghost?',
      options: ['Snapchat', 'TikTok', 'Instagram', 'Twitter'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Snapchat\'s ghost logo is named \'Ghostface Chillah\' after rapper Ghostface Killah.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_039',
      question: 'What does \'sus\' mean?',
      options: ['Suspicious', 'Superb', 'Sustained', 'Surprised'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Sus gained widespread use from the game Among Us, where players accuse each other of being impostors.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_040',
      question: 'Which festival in Thailand involves throwing water at people?',
      options: ['Songkran', 'Loy Krathong', 'Yi Peng', 'Phi Ta Khon'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Songkran marks the Thai New Year and is celebrated with water fights symbolizing cleansing.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
    },
    {
      id: 'trend_041',
      question: 'What is \'shadowbanning\' on social media?',
      options: ['Limiting a user\'s visibility without notification', 'Banning a user permanently', 'Reporting a user', 'Blocking a user'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Shadowbanning was first reported on Twitter in 2018, though platforms often deny the practice.',
      category: 'trend-vibes',
      subcategory: 'Viral Trends'
    },
    {
      id: 'trend_042',
      question: 'What does \'iykyk\' stand for?',
      options: ['If you know, you know', 'In your kindness, you know', 'If you knew, you knew', 'I yell, kids yell'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'IYKYK is used to reference insider knowledge or niche memes.',
      category: 'trend-vibes',
      subcategory: 'Gen Z Language'
    },
    {
      id: 'trend_043',
      question: 'Which traditional Korean side dish is made from fermented vegetables?',
      options: ['Kimchi', 'Bulgogi', 'Bibimbap', 'Tteokbokki'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Kimchi has hundreds of varieties and is considered Korea\'s national dish.',
      category: 'trend-vibes',
      subcategory: 'Local Culture'
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
    },
    {
      id: 'future_006',
      question: 'Which planet has the shortest day in our solar system?',
      options: ['Jupiter', 'Saturn', 'Mercury', 'Venus'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Jupiter spins once every 9.9 hours despite being the largest planet.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_007',
      question: 'Which element is commonly used in solar panels?',
      options: ['Silicon', 'Copper', 'Helium', 'Lithium'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Over 90% of solar panels use silicon as the semiconductor material.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_008',
      question: 'Which device converts mechanical energy into electrical energy?',
      options: ['Generator', 'Motor', 'Transformer', 'Battery'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Generators work on the principle of electromagnetic induction discovered by Faraday.',
      category: 'future-you',
      subcategory: 'Life Predictions'
    },
    {
      id: 'future_009',
      question: 'What does \'AI\' stand for?',
      options: ['Artificial Intelligence', 'Automated Interface', 'Advanced Internet', 'Algorithmic Integration'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The term \'artificial intelligence\' was coined in 1956 at a Dartmouth workshop.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_010',
      question: 'Which company developed the Watson AI that won Jeopardy!?',
      options: ['IBM', 'Google', 'Microsoft', 'Amazon'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Watson beat two former champions in 2011 and now aids in healthcare and finance.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_011',
      question: 'Which programming language is named after a comedy troupe?',
      options: ['Python', 'Java', 'Ruby', 'C++'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Guido van Rossum named it after Monty Python\'s Flying Circus.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_012',
      question: 'Which company\'s DeepMind created AlphaGo?',
      options: ['Google', 'Microsoft', 'IBM', 'Facebook'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'AlphaGo defeated world champion Lee Sedol in 2016 using deep neural networks.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_013',
      question: 'Which scientist is known for the laws of motion?',
      options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Newton\'s laws laid the foundation for classical mechanics and spaceflight.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_014',
      question: 'Which type of energy uses heat from the Earth?',
      options: ['Geothermal', 'Solar', 'Wind', 'Hydroelectric'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Iceland generates nearly 30% of its electricity from geothermal sources.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_015',
      question: 'What was the first human-made object to leave the solar system?',
      options: ['Voyager 1', 'Pioneer 10', 'Voyager 2', 'New Horizons'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Voyager 1 entered interstellar space in 2012, carrying a golden record.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_016',
      question: 'Which company is known for the Roomba robot vacuum?',
      options: ['iRobot', 'Dyson', 'Samsung', 'LG'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The first Roomba was introduced in 2002 and has sold over 30 million units.',
      category: 'future-you',
      subcategory: 'Life Predictions'
    },
    {
      id: 'future_017',
      question: 'Which AI defeated world chess champion Garry Kasparov in 1997?',
      options: ['Deep Blue', 'Watson', 'AlphaZero', 'Stockfish'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Deep Blue was an IBM supercomputer that won the six-game match 3.5-2.5.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_018',
      question: 'Which career involves designing buildings and structures?',
      options: ['Architect', 'Civil Engineer', 'Urban Planner', 'Surveyor'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Architects must balance aesthetics, safety, and functionality in their designs.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_019',
      question: 'Which type of engineer designs robots?',
      options: ['Robotics Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Software Engineer'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Robotics engineers combine mechanical, electrical, and computer science skills.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_020',
      question: 'Which space telescope discovered thousands of exoplanets?',
      options: ['Kepler', 'Hubble', 'Spitzer', 'James Webb'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Kepler found over 2,600 confirmed planets before retiring in 2018.',
      category: 'future-you',
      subcategory: 'Life Predictions'
    },
    {
      id: 'future_021',
      question: 'Which country launched the first artificial satellite?',
      options: ['Soviet Union', 'USA', 'China', 'France'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Sputnik 1 was launched on October 4, 1957, starting the space age.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_022',
      question: 'What is the most abundant gas in Earth\'s atmosphere?',
      options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Argon'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Nitrogen makes up about 78% of the atmosphere, oxygen about 21%.',
      category: 'future-you',
      subcategory: 'Life Predictions'
    },
    {
      id: 'future_023',
      question: 'Which scientist proposed the theory of general relativity?',
      options: ['Albert Einstein', 'Isaac Newton', 'Stephen Hawking', 'Niels Bohr'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'General relativity explains gravity as the curvature of spacetime by mass.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_024',
      question: 'Which company\'s AI assistant is named Alexa?',
      options: ['Amazon', 'Google', 'Apple', 'Microsoft'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Alexa was inspired by the library of Alexandria and first launched in 2014.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_025',
      question: 'What is the capital of Australia?',
      options: ['Canberra', 'Sydney', 'Melbourne', 'Perth'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Canberra was purpose-built as the capital in 1913 to avoid rivalry between Sydney and Melbourne.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_026',
      question: 'Which planet is known as the Red Planet?',
      options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Mars appears red due to iron oxide (rust) on its surface.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_027',
      question: 'What type of star is our Sun?',
      options: ['Yellow dwarf', 'Red giant', 'White dwarf', 'Blue giant'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'The Sun is a G-type main-sequence star, about 4.6 billion years old.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_028',
      question: 'Which element is the primary fuel for nuclear fusion in stars?',
      options: ['Hydrogen', 'Helium', 'Carbon', 'Oxygen'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Stars fuse hydrogen into helium, releasing energy that makes them shine.',
      category: 'future-you',
      subcategory: 'Life Predictions'
    },
    {
      id: 'future_029',
      question: 'Which technology company is known for the Windows operating system?',
      options: ['Microsoft', 'Apple', 'Google', 'IBM'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Microsoft was founded by Bill Gates and Paul Allen in 1975.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_030',
      question: 'Which country built the International Space Station module called Kibo?',
      options: ['Japan', 'USA', 'Russia', 'Germany'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Kibo is the largest module on the ISS and includes a logistics module and external platform.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_031',
      question: 'What is the name of the first reusable spacecraft?',
      options: ['Space Shuttle', 'Apollo', 'Soyuz', 'Vostok'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'The Space Shuttle flew 135 missions between 1981 and 2011.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_032',
      question: 'Which psychological phenomenon describes improved performance on simple tasks in the presence of others?',
      options: ['Social facilitation', 'Groupthink', 'Bystander effect', 'Diffusion of responsibility'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Social facilitation was first studied by Norman Triplett in 1898 with cyclists.',
      category: 'future-you',
      subcategory: 'Life Predictions'
    },
    {
      id: 'future_033',
      question: 'What is the term for the smallest unit of data in computing?',
      options: ['Bit', 'Byte', 'Nibble', 'Word'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'A bit can represent 0 or 1, and 8 bits make a byte.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_034',
      question: 'Which scientist developed the first successful polio vaccine?',
      options: ['Jonas Salk', 'Louis Pasteur', 'Edward Jenner', 'Robert Koch'],
      correct_answer: 0,
      difficulty: 'intermediate',
      fun_fact: 'Salk\'s vaccine was announced in 1955 and used an inactivated virus.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_035',
      question: 'What is the primary component of natural gas?',
      options: ['Methane', 'Propane', 'Butane', 'Ethanol'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Methane is a potent greenhouse gas and a major fossil fuel.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_036',
      question: 'Which mathematician is often called the father of computer science?',
      options: ['Alan Turing', 'Charles Babbage', 'Ada Lovelace', 'John von Neumann'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Turing\'s 1936 paper introduced the concept of a universal machine.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_037',
      question: 'What is the name of the closest star system to our Sun?',
      options: ['Alpha Centauri', 'Barnard\'s Star', 'Sirius', 'Procyon'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Alpha Centauri is about 4.37 light-years away and contains Proxima Centauri.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_038',
      question: 'Which type of battery is commonly used in smartphones and laptops?',
      options: ['Lithium-ion', 'Lead-acid', 'Nickel-cadmium', 'Alkaline'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Lithium-ion batteries have high energy density and low self-discharge.',
      category: 'future-you',
      subcategory: 'Career Paths'
    },
    {
      id: 'future_039',
      question: 'What is the term for a robot designed to resemble a human?',
      options: ['Humanoid', 'Android', 'Cyborg', 'Automaton'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Humanoid robots often have arms, legs, and a head to work in human environments.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_040',
      question: 'Which principle states that no two electrons in an atom can have the same set of quantum numbers?',
      options: ['Pauli exclusion principle', 'Heisenberg uncertainty principle', 'Aufbau principle', 'Hund\'s rule'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'The Pauli exclusion principle explains the structure of the periodic table.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_041',
      question: 'What is the largest moon in our solar system?',
      options: ['Ganymede', 'Titan', 'Callisto', 'Io'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Ganymede, a moon of Jupiter, is larger than the planet Mercury.',
      category: 'future-you',
      subcategory: 'AI vs Human'
    },
    {
      id: 'future_042',
      question: 'Which company developed the first commercial microprocessor?',
      options: ['Intel', 'AMD', 'Motorola', 'Texas Instruments'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Intel\'s 4004, released in 1971, was the first commercially available microprocessor.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_043',
      question: 'What is the approximate efficiency of current commercial solar panels?',
      options: ['15-20%', '5-10%', '30-40%', '50%'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Most silicon panels convert 15-20% of sunlight into electricity; lab cells exceed 40%.',
      category: 'future-you',
      subcategory: 'Tech Future'
    },
    {
      id: 'future_044',
      question: 'Which physicist first observed the photoelectric effect?',
      options: ['Heinrich Hertz', 'Albert Einstein', 'Max Planck', 'Niels Bohr'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Hertz noticed the effect in 1887, but Einstein explained it in 1905.',
      category: 'future-you',
      subcategory: 'Tech Future'
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
    },
    {
      id: 'prog_006',
      question: 'Which symbol is used for single-line comments in Python?',
      options: ['//', '#', '/*', '--'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Python\'s # comment syntax was inspired by Unix shell scripts.',
      category: 'programming',
      subcategory: 'Python'
    },
    {
      id: 'prog_007',
      question: 'What does the \'typeof\' operator return for an array in JavaScript?',
      options: ['\'array\'', '\'object\'', '\'list\'', '\'undefined\''],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Arrays are objects in JavaScript; use Array.isArray() to check correctly.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_008',
      question: 'Which HTML tag is used for the largest heading?',
      options: ['<h6>', '<heading>', '<h1>', '<head>'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'There are six heading levels, h1 through h6.',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_009',
      question: 'Which algorithm finds the shortest path in an unweighted graph by exploring it level by level, without requiring any edge weights?',
      options: ['Depth-First Search', 'Binary Search', 'Breadth-First Search', 'Dijkstra\'s Algorithm'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'BFS explores level by level, guaranteeing shortest paths in unweighted graphs.',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_010',
      question: 'In Python, what is the result of 3 * \'ab\'?',
      options: ['\'ababab\'', '\'ab3\'', 'TypeError', '\'ab\''],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'Multiplying a string by an integer repeats it.',
      category: 'programming',
      subcategory: 'Python'
    },
    {
      id: 'prog_011',
      question: 'Which JavaScript method adds new elements to the end of an array?',
      options: ['push()', 'pop()', 'shift()', 'unshift()'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'push() returns the new length of the array.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_012',
      question: 'What is the correct HTML attribute for specifying an image source?',
      options: ['src', 'href', 'link', 'source'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'The src attribute is required for the <img> tag.',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_013',
      question: 'Big O notation for binary search on a sorted array is:',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'Binary search halves the search space each step.',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_014',
      question: 'Which keyword is used to define a function in Python?',
      options: ['function', 'def', 'func', 'define'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'def comes from \'define\'.',
      category: 'programming',
      subcategory: 'Python'
    },
    {
      id: 'prog_015',
      question: 'What is the output of console.log(typeof null) in JavaScript?',
      options: ['\'null\'', '\'object\'', '\'undefined\'', '\'number\''],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'This is a famous quirk from JavaScript\'s early implementation.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_016',
      question: 'Which HTML element is used to define a table row?',
      options: ['<td>', '<tr>', '<th>', '<table>'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: '<tr> stands for \'table row\'.',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_017',
      question: 'Which sorting algorithm has an average time complexity of O(n log n)?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correct_answer: 2,
      difficulty: 'intermediate',
      fun_fact: 'Merge sort is a divide-and-conquer algorithm.',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_018',
      question: 'What will \'list(range(3))\' return in Python?',
      options: ['[1,2,3]', '[0,1,2]', '[0,1,2,3]', '[1,2]'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'range(n) generates numbers from 0 to n-1.',
      category: 'programming',
      subcategory: 'Python'
    },
    {
      id: 'prog_019',
      question: 'Which JavaScript method removes the last element from an array?',
      options: ['pop()', 'push()', 'shift()', 'slice()'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: 'pop() returns the removed element.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_020',
      question: 'Which HTML attribute is used to uniquely identify an element?',
      options: ['class', 'id', 'name', 'key'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'The id must be unique within a page.',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_021',
      question: 'Which data structure is used in Depth-First Search?',
      options: ['Queue', 'Stack', 'Priority Queue', 'Linked List'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'DFS can be implemented recursively, using the call stack.',
      category: 'programming',
      subcategory: 'Algorithms'
    },
    {
      id: 'prog_022',
      question: 'What does the \'self\' parameter represent in a Python class method?',
      options: ['The class itself', 'The instance', 'The module', 'The parent class'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'It\'s conventional to name it \'self\', though any name works.',
      category: 'programming',
      subcategory: 'Python'
    },
    {
      id: 'prog_023',
      question: 'Which statement correctly checks if a variable x is an array in JavaScript?',
      options: ['x.isArray()', 'Array.isArray(x)', 'typeof x == \'array\'', 'x instanceof Object'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Array.isArray() is reliable across different execution contexts.',
      category: 'programming',
      subcategory: 'JavaScript'
    },
    {
      id: 'prog_024',
      question: 'Which HTML tag is used to create a hyperlink?',
      options: ['<a>', '<link>', '<href>', '<url>'],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: '<a> stands for \'anchor\'.',
      category: 'programming',
      subcategory: 'HTML'
    },
    {
      id: 'prog_025',
      question: 'What is the time complexity of accessing an element by index in an array?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Arrays provide constant-time random access.',
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
    },
    {
      id: 'ai_006',
      question: 'What does \'GP\' stand for in Gaussian Process?',
      options: ['General Purpose', 'Gaussian Process', 'Gradient Propagation', 'Graph Partition'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Gaussian Processes are used in Bayesian optimization to model unknown functions with uncertainty.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_007',
      question: 'Which activation function outputs values between -1 and 1?',
      options: ['ReLU', 'Sigmoid', 'Tanh', 'Softmax'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Tanh is zero-centered, unlike sigmoid, which helps with optimization in some networks.',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    {
      id: 'ai_008',
      question: 'What is the main purpose of TF-IDF in NLP?',
      options: ['Word embedding', 'Text normalization', 'Term weighting', 'Syntax parsing'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'TF-IDF downweights common words like \'the\' and highlights rare, informative terms.',
      category: 'ai',
      subcategory: 'NLP'
    },
    {
      id: 'ai_009',
      question: 'Which computer vision task involves assigning a class label to each pixel?',
      options: ['Image classification', 'Object detection', 'Semantic segmentation', 'Pose estimation'],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: 'Semantic segmentation is used in autonomous driving to identify road, vehicles, and pedestrians at pixel level.',
      category: 'ai',
      subcategory: 'Computer Vision'
    },
    {
      id: 'ai_010',
      question: 'In a confusion matrix, what does \'precision\' measure?',
      options: ['TP/(TP+FN)', 'TP/(TP+FP)', 'TN/(TN+FP)', 'Accuracy'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Precision is useful when the cost of false positives is high, such as in spam detection.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_011',
      question: 'Which algorithm is commonly used for reducing dimensionality while preserving variance?',
      options: ['K-means', 'PCA', 'DBSCAN', 'Apriori'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'PCA projects data onto orthogonal axes, which are the eigenvectors of the covariance matrix.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_012',
      question: 'What type of neural network architecture is designed for sequential data?',
      options: ['CNN', 'RNN', 'GAN', 'MLP'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'RNNs share weights across time steps, allowing them to process variable-length sequences.',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    {
      id: 'ai_013',
      question: 'Which concept refers to a model performing well on training data but poorly on new data?',
      options: ['Underfitting', 'Overfitting', 'Regularization', 'Cross-validation'],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: 'Overfitting can be mitigated with dropout, early stopping, or more training data.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_014',
      question: 'What is the function of the attention mechanism in neural networks?',
      options: ['Reduce model size', 'Focus on relevant parts', 'Speed up training', 'Increase depth'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Attention was introduced for machine translation to align source and target words dynamically.',
      category: 'ai',
      subcategory: 'NLP'
    },
    {
      id: 'ai_015',
      question: 'Which computer vision model architecture introduced residual connections?',
      options: ['VGG', 'ResNet', 'Inception', 'AlexNet'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'ResNet\'s skip connections allow training of networks with over 100 layers without vanishing gradients.',
      category: 'ai',
      subcategory: 'Computer Vision'
    },
    {
      id: 'ai_016',
      question: 'Which loss function is typically used for binary classification?',
      options: ['MSE', 'Binary cross-entropy', 'Hinge loss', 'Huber loss'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'Binary cross-entropy measures the divergence between predicted probabilities and true labels.',
      category: 'ai',
      subcategory: 'Machine Learning'
    },
    {
      id: 'ai_017',
      question: 'What does BERT use to learn bidirectional context?',
      options: ['Autoregressive prediction', 'Masked language model', 'Next sentence prediction only', 'Word2Vec embeddings'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'BERT randomly masks 15% of tokens in input and predicts them using both left and right context.',
      category: 'ai',
      subcategory: 'NLP'
    },
    {
      id: 'ai_018',
      question: 'In object detection, what does IoU measure?',
      options: ['Image quality', 'Overlap between boxes', 'Inference speed', 'Feature similarity'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'IoU is defined as intersection area divided by union area; threshold 0.5 is common for correct detection.',
      category: 'ai',
      subcategory: 'Computer Vision'
    },
    {
      id: 'ai_019',
      question: 'Which of these is a generative model?',
      options: ['SVM', 'Variational Autoencoder', 'Random Forest', 'Logistic Regression'],
      correct_answer: 1,
      difficulty: 'intermediate',
      fun_fact: 'VAEs learn a latent distribution and generate new samples by decoding sampled latent vectors.',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    {
      id: 'ai_020',
      question: 'Which metric is used to evaluate machine translation by comparing n-gram overlaps?',
      options: ['ROUGE', 'BLEU', 'Perplexity', 'F1'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'BLEU was proposed in 2002 by Papineni et al. and remains widely used despite known limitations.',
      category: 'ai',
      subcategory: 'NLP'
    },
    {
      id: 'ai_021',
      question: 'What is the primary advantage of self-attention over recurrent layers?',
      options: ['Lower memory', 'Parallel computation', 'Fewer parameters', 'No need for positional encoding'],
      correct_answer: 1,
      difficulty: 'advanced',
      fun_fact: 'Self-attention allows all positions to be processed simultaneously, speeding up training on GPUs.',
      category: 'ai',
      subcategory: 'Deep Learning'
    },
    {
      id: 'ai_022',
      question: 'Which technique is used to visualize which parts of an image influence a CNN\'s decision?',
      options: ['Grad-CAM', 'PCA', 't-SNE', 'LIME'],
      correct_answer: 0,
      difficulty: 'advanced',
      fun_fact: 'Grad-CAM uses gradients of the class score with respect to the last convolutional layer to produce a heatmap.',
      category: 'ai',
      subcategory: 'Computer Vision'
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
