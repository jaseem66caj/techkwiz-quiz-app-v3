from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import QuizQuestion, QuizCategory, ScriptInjection, AdSlot, RewardedPopupConfig
import random

quiz_router = APIRouter(prefix="/quiz", tags=["quiz"])

# Database dependency - will be injected
db = None

def get_db():
    return db

@quiz_router.get("/categories", response_model=List[QuizCategory])
async def get_quiz_categories():
    """Get all active quiz categories for public use."""
    database = get_db()
    categories = await database.quiz_categories.find().to_list(1000)
    return [QuizCategory(**cat) for cat in categories]

@quiz_router.get("/categories/{category_id}", response_model=QuizCategory)
async def get_quiz_category(category_id: str):
    """Get a specific quiz category."""
    database = get_db()
    category = await database.quiz_categories.find_one({"id": category_id})
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return QuizCategory(**category)

@quiz_router.get("/questions/{category_id}", response_model=List[QuizQuestion])
async def get_quiz_questions(category_id: str, count: Optional[int] = 10, difficulty: Optional[str] = None):
    """Get random quiz questions for a category."""
    database = get_db()
    
    # Build filter
    filter_dict = {"category": category_id}
    if difficulty:
        filter_dict["difficulty"] = difficulty
    
    # Get all questions matching filter
    questions = await database.quiz_questions.find(filter_dict).to_list(1000)
    
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this category")
    
    # Convert to QuizQuestion objects
    quiz_questions = [QuizQuestion(**q) for q in questions]
    
    # Shuffle and return requested count
    random.shuffle(quiz_questions)
    return quiz_questions[:count]

@quiz_router.get("/scripts/{placement}", response_model=List[ScriptInjection])
async def get_scripts_for_placement(placement: str):
    """Get all active scripts for a specific placement (header/footer)."""
    database = get_db()
    scripts = await database.script_injections.find({
        "placement": placement,
        "is_active": True
    }).to_list(1000)
    return [ScriptInjection(**script) for script in scripts]

@quiz_router.get("/ad-slots/{placement}", response_model=List[AdSlot])
async def get_ad_slots_for_placement(placement: str):
    """Get all active ad slots for a specific placement."""
    database = get_db()
    ad_slots = await database.ad_slots.find({
        "placement": placement,
        "is_active": True
    }).to_list(1000)
    return [AdSlot(**slot) for slot in ad_slots]

@quiz_router.get("/rewarded-config", response_model=RewardedPopupConfig)
async def get_rewarded_popup_config():
    """Get rewarded popup configuration for public use."""
    database = get_db()
    config = await database.rewarded_popup_config.find_one()
    
    if not config:
        # Return default config if none exists
        return RewardedPopupConfig()
    
    return RewardedPopupConfig(**config)

@quiz_router.get("/question/{question_id}", response_model=QuizQuestion)
async def get_single_question(question_id: str):
    """Get a single question by ID."""
    database = get_db()
    question = await database.quiz_questions.find_one({"id": question_id})
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    return QuizQuestion(**question)