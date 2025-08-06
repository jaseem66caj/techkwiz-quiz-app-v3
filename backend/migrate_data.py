import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
database = client[os.environ["DB_NAME"]]

# Quiz data from the original file
QUIZ_CATEGORIES = {
    "programming": {
        "id": "programming",
        "name": "Programming",
        "icon": "💻",
        "color": "from-blue-500 to-purple-600",
        "description": "Test your coding knowledge",
        "subcategories": ["JavaScript", "Python", "Java", "C++", "React", "Node.js"],
        "entry_fee": 100,
        "prize_pool": 2000,
    },
    "ai": {
        "id": "ai",
        "name": "Artificial Intelligence",
        "icon": "🤖",
        "color": "from-purple-500 to-pink-600",
        "description": "Explore AI concepts and technologies",
        "subcategories": [
            "Machine Learning",
            "Deep Learning",
            "Neural Networks",
            "NLP",
        ],
        "entry_fee": 150,
        "prize_pool": 2500,
    },
    "web-dev": {
        "id": "web-dev",
        "name": "Web Development",
        "icon": "🌐",
        "color": "from-green-500 to-teal-600",
        "description": "Frontend and backend technologies",
        "subcategories": ["HTML/CSS", "JavaScript", "React", "Node.js", "APIs"],
        "entry_fee": 100,
        "prize_pool": 2000,
    },
    "mobile-dev": {
        "id": "mobile-dev",
        "name": "Mobile Development",
        "icon": "📱",
        "color": "from-orange-500 to-red-600",
        "description": "iOS and Android development",
        "subcategories": ["React Native", "Flutter", "Swift", "Kotlin"],
        "entry_fee": 120,
        "prize_pool": 2200,
    },
    "data-science": {
        "id": "data-science",
        "name": "Data Science",
        "icon": "📊",
        "color": "from-indigo-500 to-blue-600",
        "description": "Analytics and data processing",
        "subcategories": ["Statistics", "Python", "R", "SQL", "Visualization"],
        "entry_fee": 130,
        "prize_pool": 2300,
    },
    "cybersecurity": {
        "id": "cybersecurity",
        "name": "Cybersecurity",
        "icon": "🔒",
        "color": "from-red-500 to-orange-600",
        "description": "Security concepts and practices",
        "subcategories": ["Network Security", "Ethical Hacking", "Cryptography"],
        "entry_fee": 140,
        "prize_pool": 2400,
    },
    "cloud": {
        "id": "cloud",
        "name": "Cloud Computing",
        "icon": "☁️",
        "color": "from-cyan-500 to-blue-600",
        "description": "AWS, Azure, and Google Cloud",
        "subcategories": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"],
        "entry_fee": 110,
        "prize_pool": 2100,
    },
    "blockchain": {
        "id": "blockchain",
        "name": "Blockchain",
        "icon": "⛓️",
        "color": "from-yellow-500 to-orange-600",
        "description": "Cryptocurrency and blockchain tech",
        "subcategories": ["Bitcoin", "Ethereum", "Smart Contracts", "DeFi"],
        "entry_fee": 160,
        "prize_pool": 2600,
    },
}

# Sample questions for each category (abbreviated for migration)
SAMPLE_QUESTIONS = {
    "programming": [
        {
            "id": "prog_001",
            "question": "Which of the following is NOT a JavaScript data type?",
            "options": ["String", "Boolean", "Float", "Number"],
            "correct_answer": 2,
            "difficulty": "beginner",
            "fun_fact": "JavaScript has 7 primitive data types: string, number, boolean, null, undefined, symbol, and bigint.",
            "category": "programming",
            "subcategory": "JavaScript",
        },
        {
            "id": "prog_002",
            "question": "What does HTML stand for?",
            "options": [
                "Hyper Text Markup Language",
                "High Tech Modern Language",
                "Home Tool Markup Language",
                "Hyperlink and Text Markup Language",
            ],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": "HTML was first developed by Tim Berners-Lee in 1990 at CERN.",
            "category": "programming",
            "subcategory": "HTML",
        },
    ],
    "ai": [
        {
            "id": "ai_001",
            "question": "What does AI stand for?",
            "options": [
                "Artificial Intelligence",
                "Automated Intelligence",
                "Advanced Intelligence",
                "Algorithmic Intelligence",
            ],
            "correct_answer": 0,
            "difficulty": "beginner",
            "fun_fact": 'The term "Artificial Intelligence" was coined by John McCarthy in 1956.',
            "category": "ai",
            "subcategory": "Fundamentals",
        }
    ],
    "web-dev": [
        {
            "id": "web_001",
            "question": "What does CSS stand for?",
            "options": [
                "Computer Style Sheets",
                "Cascading Style Sheets",
                "Creative Style Sheets",
                "Colorful Style Sheets",
            ],
            "correct_answer": 1,
            "difficulty": "beginner",
            "fun_fact": "CSS was first proposed by Håkon Wium Lie in 1994.",
            "category": "web-dev",
            "subcategory": "CSS",
        }
    ],
}


async def migrate_data():
    """Migrate quiz data to MongoDB."""
    try:
        # Check if data already exists
        existing_categories = await database.quiz_categories.count_documents({})
        if existing_categories > 0:
            print(
                f"Categories already exist ({existing_categories}). Skipping migration."
            )
            return

        # Insert categories
        categories_to_insert = []
        for cat_id, cat_data in QUIZ_CATEGORIES.items():
            categories_to_insert.append(cat_data)

        if categories_to_insert:
            await database.quiz_categories.insert_many(categories_to_insert)
            print(f"Inserted {len(categories_to_insert)} categories")

        # Insert sample questions
        questions_to_insert = []
        for cat_id, questions in SAMPLE_QUESTIONS.items():
            for question in questions:
                questions_to_insert.append(question)

        if questions_to_insert:
            await database.quiz_questions.insert_many(questions_to_insert)
            print(f"Inserted {len(questions_to_insert)} questions")

        # Create default rewarded popup config
        existing_config = await database.rewarded_popup_config.count_documents({})
        if existing_config == 0:
            default_config = {
                "id": "default",
                "trigger_after_questions": 5,
                "coin_reward": 200,
                "is_active": True,
                "show_on_insufficient_coins": True,
                "show_during_quiz": True,
            }
            await database.rewarded_popup_config.insert_one(default_config)
            print("Created default rewarded popup configuration")

        print("Data migration completed successfully!")

    except Exception as e:
        print(f"Error during migration: {e}")


if __name__ == "__main__":
    asyncio.run(migrate_data())
