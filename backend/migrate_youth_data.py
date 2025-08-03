"""
Migration script for Youth-Focused Quiz Data
Replaces existing categories and questions with new interactive, youth-oriented content
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
import os

# Database connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/techkwiz")
client = AsyncIOMotorClient(MONGO_URL)
db = client.techkwiz

# New Youth-Focused Categories
YOUTH_CATEGORIES = [
    {
        "id": "swipe-personality",
        "name": "Swipe-Based Personality",
        "icon": "🎉",
        "color": "from-pink-500 to-purple-600",
        "description": "Discover your vibe through rapid-fire choices",
        "subcategories": ["Aesthetic", "Lifestyle", "Values", "Preferences"],
        "entry_fee": 25,
        "prize_pool": 500,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "pop-culture-flash",
        "name": "Pop Culture Flash",
        "icon": "🎬",
        "color": "from-red-500 to-pink-600",
        "description": "Decode trends and viral moments",
        "subcategories": ["TikTok", "Music", "Celebrities", "Memes"],
        "entry_fee": 30,
        "prize_pool": 600,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "micro-trivia",
        "name": "Micro-Trivia Tournaments",
        "icon": "🧠",
        "color": "from-blue-500 to-cyan-600",
        "description": "Lightning-fast knowledge battles",
        "subcategories": ["Random Facts", "Quick Fire", "Brain Teasers", "Speed Round"],
        "entry_fee": 20,
        "prize_pool": 400,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "social-identity",
        "name": "Social Identity Quizzes",
        "icon": "🤳",
        "color": "from-purple-500 to-indigo-600",
        "description": "Find your digital persona match",
        "subcategories": ["Influencer Type", "Content Style", "Social Vibe", "Online Persona"],
        "entry_fee": 35,
        "prize_pool": 700,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "trend-vibes",
        "name": "Trend & Local Vibes",
        "icon": "🎯",
        "color": "from-orange-500 to-yellow-600",
        "description": "Stay plugged into what's viral",
        "subcategories": ["TikTok Slang", "Viral Trends", "Local Culture", "Gen Z Language"],
        "entry_fee": 40,
        "prize_pool": 800,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": "future-you",
        "name": "Future-You Simulations",
        "icon": "🔮",
        "color": "from-green-500 to-teal-600",
        "description": "Predict your path and tech trends",
        "subcategories": ["Career Paths", "Tech Future", "Life Predictions", "AI vs Human"],
        "entry_fee": 45,
        "prize_pool": 900,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

# Interactive Youth-Focused Questions
YOUTH_QUESTIONS = [
    # Swipe-Based Personality Questions
    {
        "id": str(uuid.uuid4()),
        "question": "Choose your aesthetic vibe:",
        "options": ["Dark Academia ☕📚", "Soft Girl 🌸✨", "Y2K Cyber 💿🔮", "Cottagecore 🍄🌿"],
        "correct_answer": -1,  # No correct answer for personality
        "difficulty": "beginner",
        "question_type": "this_or_that",
        "fun_fact": "Your aesthetic choice reflects your inner personality and how you want to be perceived by others!",
        "category": "swipe-personality",
        "subcategory": "Aesthetic",
        "visual_options": ["🖤📖", "🌸💫", "💿🌈", "🍄🌻"],
        "personality_trait": "aesthetic_preference",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Your ideal Friday night:",
        "options": ["Netflix + Chill 🛋️", "House Party 🎉", "Gaming Marathon 🎮", "Late Night Drive 🌙"],
        "correct_answer": -1,
        "difficulty": "beginner",
        "question_type": "this_or_that",
        "fun_fact": "How you spend your free time says a lot about whether you're an introvert or extrovert!",
        "category": "swipe-personality",
        "subcategory": "Lifestyle",
        "visual_options": ["📺🍿", "🎵🕺", "🎮👾", "🚗🌃"],
        "personality_trait": "social_preference",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Pick your phone app addiction:",
        "options": ["TikTok 📱", "Instagram 📸", "Spotify 🎵", "Discord 💬"],
        "correct_answer": -1,
        "difficulty": "beginner",
        "question_type": "this_or_that",
        "fun_fact": "Your most-used app reveals whether you're a creator, consumer, or social butterfly!",
        "category": "swipe-personality",
        "subcategory": "Preferences",
        "visual_options": ["🎬✨", "📷🌟", "🎧🎶", "💬👥"],
        "personality_trait": "digital_behavior",
        "youth_engagement_score": 10,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Your stress response:",
        "options": ["Vent to Friends 💭", "Listen to Music 🎧", "Retail Therapy 🛍️", "Scroll Social Media 📱"],
        "correct_answer": -1,
        "difficulty": "intermediate",
        "question_type": "this_or_that",
        "fun_fact": "Your coping mechanism reveals your emotional processing style and personality type!",
        "category": "swipe-personality",
        "subcategory": "Values",
        "visual_options": ["👥💬", "🎵😌", "💳✨", "📱🌊"],
        "personality_trait": "coping_style",
        "youth_engagement_score": 7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Dream collab partner:",
        "options": ["MrBeast 💰", "Emma Chamberlain ☕", "Charli D'Amelio 💃", "PewDiePie 🎮"],
        "correct_answer": -1,
        "difficulty": "beginner",
        "question_type": "this_or_that",
        "fun_fact": "Your creator crush shows what type of content and energy you're drawn to!",
        "category": "swipe-personality",
        "subcategory": "Preferences",
        "visual_options": ["💰🎬", "☕📸", "💃🎵", "🎮😂"],
        "personality_trait": "content_preference",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },

    # Pop Culture Flash Questions (Emoji Decode)
    {
        "id": str(uuid.uuid4()),
        "question": "Decode this hit song:",
        "options": ["Anti-Hero", "Flowers", "Unholy", "As It Was"],
        "correct_answer": 0,
        "difficulty": "intermediate",
        "question_type": "emoji_decode",
        "fun_fact": "Taylor Swift's 'Anti-Hero' was the #1 song globally in 2022 and spawned countless TikTok trends!",
        "category": "pop-culture-flash",
        "subcategory": "Music",
        "emoji_clue": "🦹‍♀️💔🎵",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "What viral TikTok trend is this?",
        "options": ["Renegade Dance", "Buss It Challenge", "Silhouette Challenge", "Corvette Corvette"],
        "correct_answer": 1,
        "difficulty": "intermediate",
        "question_type": "emoji_decode",
        "fun_fact": "The Buss It Challenge went viral during the pandemic, with millions participating worldwide!",
        "category": "pop-culture-flash",
        "subcategory": "TikTok",
        "emoji_clue": "💃🔥🎵",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Which meme is this describing?",
        "options": ["Ohio Rizz", "Slay Queen", "No Cap", "It's Giving"],
        "correct_answer": 0,
        "difficulty": "advanced",
        "question_type": "emoji_decode",
        "fun_fact": "'Ohio' became Gen Z slang for weird or cringe, while 'rizz' means charisma - combining for peak Gen Z energy!",
        "category": "pop-culture-flash",
        "subcategory": "Memes",
        "emoji_clue": "🌽✨👑",
        "youth_engagement_score": 10,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Celebrity couple breakup that broke the internet:",
        "options": ["Ariana & Pete", "Taylor & Joe", "Bella & The Weeknd", "Kylie & Travis"],
        "correct_answer": 1,
        "difficulty": "intermediate",
        "question_type": "emoji_decode",
        "fun_fact": "Taylor Swift and Joe Alwyn's 6-year relationship ended in 2023, shocking Swifties worldwide!",
        "category": "pop-culture-flash",
        "subcategory": "Celebrities",
        "emoji_clue": "💔🎤6️⃣",
        "youth_engagement_score": 7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "This Netflix show had everyone obsessed:",
        "options": ["Wednesday", "Stranger Things 4", "Dahmer", "The Crown"],
        "correct_answer": 0,
        "difficulty": "beginner",
        "question_type": "emoji_decode",
        "fun_fact": "Wednesday became Netflix's 3rd most-watched series ever, with Jenna Ortega's dance going mega-viral!",
        "category": "pop-culture-flash",
        "subcategory": "TikTok",
        "emoji_clue": "🖤💃🕷️",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },

    # Micro-Trivia Tournament Questions
    {
        "id": str(uuid.uuid4()),
        "question": "Which app was almost banned in the US?",
        "options": ["Instagram", "TikTok", "Snapchat", "Discord"],
        "correct_answer": 1,
        "difficulty": "beginner",
        "question_type": "multiple_choice",
        "fun_fact": "TikTok faced multiple ban threats due to data privacy concerns, sparking massive user campaigns!",
        "category": "micro-trivia",
        "subcategory": "Random Facts",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Most-followed person on TikTok (2024)?",
        "options": ["Charli D'Amelio", "Addison Rae", "Bella Poarch", "Zach King"],
        "correct_answer": 0,
        "difficulty": "intermediate",
        "question_type": "multiple_choice",
        "fun_fact": "Charli D'Amelio was the first person to reach 100M+ followers on TikTok!",
        "category": "micro-trivia",
        "subcategory": "Quick Fire",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "What does 'IYKYK' stand for?",
        "options": ["If You Know You Know", "I Yell Kindly, You Know", "It's Your Knowledge, Yo Kid", "I'm Young, Keeping Youthful"],
        "correct_answer": 0,
        "difficulty": "beginner",
        "question_type": "multiple_choice",
        "fun_fact": "'IYKYK' is used when referencing something only certain people would understand!",
        "category": "micro-trivia",
        "subcategory": "Brain Teasers",
        "youth_engagement_score": 7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Which streaming platform doesn't exist?",
        "options": ["Disney+", "HBO Max", "Peacock", "StreamFlex"],
        "correct_answer": 3,
        "difficulty": "intermediate",
        "question_type": "multiple_choice",
        "fun_fact": "The streaming wars have created so many platforms that it's hard to keep track of what's real!",
        "category": "micro-trivia",
        "subcategory": "Speed Round",
        "youth_engagement_score": 6,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "BeReal's signature feature?",
        "options": ["Stories", "Reels", "Time to BeReal notification", "Live Streaming"],
        "correct_answer": 2,
        "difficulty": "beginner",
        "question_type": "multiple_choice",
        "fun_fact": "BeReal sends random daily notifications asking users to post authentic, unfiltered photos!",
        "category": "micro-trivia",
        "subcategory": "Random Facts",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },

    # Social Identity Quiz Questions
    {
        "id": str(uuid.uuid4()),
        "question": "Your content creation style:",
        "options": ["Aesthetic Feed Curation", "Random Life Moments", "Educational Content", "Comedy & Entertainment"],
        "correct_answer": -1,
        "difficulty": "beginner",
        "question_type": "personality",
        "fun_fact": "Your content style reveals whether you're a perfectionist, authentic, educator, or entertainer!",
        "category": "social-identity",
        "subcategory": "Content Style",
        "personality_trait": "creator_type",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "You're most likely to go viral for:",
        "options": ["Dance Video", "Funny Commentary", "Life Hack", "Outfit Check"],
        "correct_answer": -1,
        "difficulty": "intermediate",
        "question_type": "personality",
        "fun_fact": "Your viral potential depends on your natural talents and what resonates with your personality!",
        "category": "social-identity",
        "subcategory": "Influencer Type",
        "personality_trait": "viral_potential",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Your follower engagement is mostly:",
        "options": ["Hearts & Fire Emojis", "Thoughtful Comments", "Story Replies", "Shares & Saves"],
        "correct_answer": -1,
        "difficulty": "intermediate",
        "question_type": "personality",
        "fun_fact": "Different engagement types show different audience connections - visual, intellectual, or personal!",
        "category": "social-identity",
        "subcategory": "Social Vibe",
        "personality_trait": "audience_connection",
        "youth_engagement_score": 7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "Your online persona energy:",
        "options": ["Main Character Energy", "Supportive Friend Vibes", "Mysterious & Cool", "Chaotic But Fun"],
        "correct_answer": -1,
        "difficulty": "beginner",
        "question_type": "personality",
        "fun_fact": "Your digital energy affects how others perceive and interact with you online!",
        "category": "social-identity",
        "subcategory": "Online Persona",
        "personality_trait": "digital_energy",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "You'd be most successful as:",
        "options": ["Lifestyle Influencer", "Educational Creator", "Comedy Content Creator", "Fashion/Beauty Guru"],
        "correct_answer": -1,
        "difficulty": "advanced",
        "question_type": "personality",
        "fun_fact": "Your natural strengths determine which type of influencer you'd be most authentic as!",
        "category": "social-identity",
        "subcategory": "Influencer Type",
        "personality_trait": "influencer_archetype",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },

    # Trend & Local Vibes Questions
    {
        "id": str(uuid.uuid4()),
        "question": "What does 'periodt' mean?",
        "options": ["End of discussion", "Time to go", "Pretty obvious", "Perfect timing"],
        "correct_answer": 0,
        "difficulty": "beginner",
        "question_type": "multiple_choice",
        "fun_fact": "'Periodt' adds emphasis to a statement, like putting an exclamation point on your opinion!",
        "category": "trend-vibes",
        "subcategory": "Gen Z Language",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "If someone says 'it's giving ___':",
        "options": ["They're being generous", "It reminds them of something", "It's a gift", "They're confused"],
        "correct_answer": 1,
        "difficulty": "intermediate",
        "question_type": "multiple_choice",
        "fun_fact": "'It's giving' means something has the energy or vibe of whatever follows - like 'it's giving main character'!",
        "category": "trend-vibes",
        "subcategory": "TikTok Slang",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "What's the opposite of 'cheugy'?",
        "options": ["Trendy", "Basic", "Cringe", "Outdated"],
        "correct_answer": 0,
        "difficulty": "advanced",
        "question_type": "multiple_choice",
        "fun_fact": "'Cheugy' describes things that are outdated or trying too hard to be trendy - like skinny jeans or 'Live Laugh Love' signs!",
        "category": "trend-vibes",
        "subcategory": "Viral Trends",
        "youth_engagement_score": 7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "When someone has 'rizz' they have:",
        "options": ["Messy hair", "Charisma", "Anxiety", "Good grades"],
        "correct_answer": 1,
        "difficulty": "beginner",
        "question_type": "multiple_choice",
        "fun_fact": "'Rizz' comes from 'charisma' and describes someone's ability to charm others, especially romantically!",
        "category": "trend-vibes",
        "subcategory": "Gen Z Language",
        "youth_engagement_score": 10,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "What does 'slay' mean in Gen Z?",
        "options": ["To defeat", "To excel/kill it", "To be tired", "To leave quickly"],
        "correct_answer": 1,
        "difficulty": "beginner",
        "question_type": "multiple_choice",
        "fun_fact": "'Slay' means to do something extremely well or look amazing - it's the ultimate compliment!",
        "category": "trend-vibes",
        "subcategory": "Local Culture",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },

    # Future-You Simulation Questions
    {
        "id": str(uuid.uuid4()),
        "question": "Which career will be biggest by 2030?",
        "options": ["AI Prompt Engineer", "Virtual Reality Designer", "Sustainable Energy Specialist", "Space Tourism Guide"],
        "correct_answer": 0,
        "difficulty": "intermediate",
        "question_type": "prediction",
        "fun_fact": "AI Prompt Engineering is already becoming crucial as companies invest billions in AI technology!",
        "category": "future-you",
        "subcategory": "Career Paths",
        "prediction_year": "2030",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "By 2026, most people will:",
        "options": ["Work 4-day weeks", "Have AI assistants", "Live in smart cities", "Shop only in VR"],
        "correct_answer": 1,
        "difficulty": "advanced",
        "question_type": "prediction",
        "fun_fact": "AI assistants are rapidly improving and becoming integrated into daily life faster than expected!",
        "category": "future-you",
        "subcategory": "Tech Future",
        "prediction_year": "2026",
        "youth_engagement_score": 9,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "What will replace TikTok as the next big platform?",
        "options": ["AI-generated content apps", "Virtual reality social spaces", "Brain-computer interface platforms", "Holographic social media"],
        "correct_answer": 0,
        "difficulty": "advanced",
        "question_type": "prediction",
        "fun_fact": "AI-generated content is already starting to take off with apps like Lensa and character.ai!",
        "category": "future-you",
        "subcategory": "Tech Future",
        "prediction_year": "2028",
        "youth_engagement_score": 10,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "In 10 years, you'll probably be:",
        "options": ["Working remotely from anywhere", "Living in a different country", "Running your own business", "Using tech that doesn't exist yet"],
        "correct_answer": -1,
        "difficulty": "beginner",
        "question_type": "prediction",
        "fun_fact": "The pace of change means your future will likely involve opportunities that don't even exist today!",
        "category": "future-you",
        "subcategory": "Life Predictions",
        "prediction_year": "2035",
        "youth_engagement_score": 7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    },
    {
        "id": str(uuid.uuid4()),
        "question": "First thing AI will replace:",
        "options": ["Customer service", "Content creation", "Driving", "Medical diagnosis"],
        "correct_answer": 0,
        "difficulty": "intermediate",
        "question_type": "prediction",
        "fun_fact": "AI chatbots are already handling most basic customer service interactions across many industries!",
        "category": "future-you",
        "subcategory": "AI vs Human",
        "prediction_year": "2025",
        "youth_engagement_score": 8,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
]

async def migrate_youth_data():
    """
    Replace existing quiz data with new youth-focused content
    """
    try:
        print("🚀 Starting youth-focused data migration...")
        
        # Clear existing categories and questions
        print("🗑️ Clearing existing data...")
        await db.quiz_categories.delete_many({})
        await db.quiz_questions.delete_many({})
        
        # Insert new youth categories
        print("🎯 Inserting new youth-focused categories...")
        await db.quiz_categories.insert_many(YOUTH_CATEGORIES)
        print(f"✅ Created {len(YOUTH_CATEGORIES)} new categories")
        
        # Insert new youth questions
        print("❓ Inserting new interactive questions...")
        await db.quiz_questions.insert_many(YOUTH_QUESTIONS)
        print(f"✅ Created {len(YOUTH_QUESTIONS)} new questions")
        
        # Update rewarded popup config for new coin amounts
        print("🪙 Updating coin rewards configuration...")
        await db.rewarded_popup_config.update_one(
            {},
            {
                "$set": {
                    "coin_reward": 100,  # Keep ad rewards at 100
                    "trigger_after_questions": 3,
                    "is_active": True,
                    "show_on_insufficient_coins": True,
                    "show_during_quiz": True,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        print("🎉 Youth-focused migration completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Categories: {len(YOUTH_CATEGORIES)}")
        print(f"   - Questions: {len(YOUTH_QUESTIONS)}")
        print(f"   - Entry fees: 20-45 coins (reduced)")
        print(f"   - Coin rewards: 25 coins per correct answer")
        print(f"   - Question types: multiple_choice, this_or_that, emoji_decode, personality, prediction")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise e

if __name__ == "__main__":
    asyncio.run(migrate_youth_data())