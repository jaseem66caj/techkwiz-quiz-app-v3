import random
from typing import List, Optional

from fastapi import APIRouter, HTTPException

from models import (
    AdSlot,
    QuizCategory,
    QuizQuestion,
    RewardedPopupConfig,
    ScriptInjection,
)

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
async def get_quiz_questions(
    category_id: str, count: Optional[int] = 5, difficulty: Optional[str] = None
):
    """Get sequential quiz questions for a category - always returns exactly 5 questions for multi-question flow."""
    database = get_db()

    # Build filter - using 'category' field as per migration data
    filter_dict = {"category": category_id}
    if difficulty:
        filter_dict["difficulty"] = difficulty

    # Get all questions matching filter
    questions = await database.quiz_questions.find(filter_dict).to_list(1000)

    if not questions:
        raise HTTPException(
            status_code=404, detail="No questions found for this category"
        )

    # Convert to QuizQuestion objects
    quiz_questions = [QuizQuestion(**q) for q in questions]

    # Shuffle to ensure variety, but always return exactly 5 questions for sequential flow
    random.shuffle(quiz_questions)
    
    # Ensure we have exactly 5 questions (TechKwiz sequential quiz requirement)
    if len(quiz_questions) < 5:
        # If we have fewer than 5, repeat some questions to reach 5
        while len(quiz_questions) < 5:
            quiz_questions.extend(quiz_questions[:5-len(quiz_questions)])
    
    return quiz_questions[:5]  # Always return exactly 5 questions


@quiz_router.get("/sequential-questions/{category_id}", response_model=List[QuizQuestion])
async def get_sequential_quiz_questions(category_id: str):
    """Get exactly 5 sequential quiz questions for TechKwiz multi-question flow."""
    database = get_db()

    # Get all questions for this category using 'category' field
    questions = await database.quiz_questions.find({"category": category_id}).to_list(1000)

    if not questions:
        raise HTTPException(
            status_code=404, detail="No questions found for this category"
        )

    # Convert to QuizQuestion objects
    quiz_questions = [QuizQuestion(**q) for q in questions]

    # Shuffle for variety but maintain consistency during a quiz session
    random.shuffle(quiz_questions)
    
    # Always return exactly 5 questions for TechKwiz sequential flow
    if len(quiz_questions) < 5:
        # If fewer than 5 questions available, cycle through available ones
        while len(quiz_questions) < 5:
            quiz_questions.extend(quiz_questions[:min(len(quiz_questions), 5-len(quiz_questions))])
    
    return quiz_questions[:5]


@quiz_router.get("/scripts/{placement}", response_model=List[ScriptInjection])
async def get_scripts_for_placement(placement: str):
    """Get all active scripts for a specific placement (header/footer)."""
    database = get_db()
    scripts = await database.script_injections.find(
        {"placement": placement, "is_active": True}
    ).to_list(1000)
    return [ScriptInjection(**script) for script in scripts]


@quiz_router.get("/ad-slots/{placement}", response_model=List[AdSlot])
async def get_ad_slots_for_placement(placement: str):
    """Get all active ad slots for a specific placement."""
    database = get_db()
    ad_slots = await database.ad_slots.find(
        {"placement": placement, "is_active": True}
    ).to_list(1000)
    return [AdSlot(**slot) for slot in ad_slots]


@quiz_router.get("/between-questions-ads", response_model=List[AdSlot])
async def get_between_questions_ads():
    """Get active ad slots for between questions placement (TechKwiz sequential flow)."""
    database = get_db()
    ad_slots = await database.ad_slots.find(
        {"placement": "between-questions", "is_active": True}
    ).to_list(1000)
    return [AdSlot(**slot) for slot in ad_slots]


@quiz_router.get("/rewarded-config", response_model=RewardedPopupConfig)
async def get_rewarded_popup_config():
    """Get rewarded popup configuration for homepage."""
    database = get_db()
    config = await database.rewarded_popup_config.find_one({"category_id": None})

    if not config:
        # Return default config if none exists
        return RewardedPopupConfig(category_name="Homepage")

    return RewardedPopupConfig(**config)


@quiz_router.get("/rewarded-config/{category_id}", response_model=RewardedPopupConfig)
async def get_rewarded_popup_config_for_category(category_id: str):
    """Get rewarded popup configuration for specific category."""
    database = get_db()
    config = await database.rewarded_popup_config.find_one({"category_id": category_id})

    if not config:
        # Get category name for better identification
        category = await database.categories.find_one({"id": category_id})
        category_name = category["name"] if category else f"Category {category_id}"

        # Return default config if none exists
        return RewardedPopupConfig(category_id=category_id, category_name=category_name)

    return RewardedPopupConfig(**config)


@quiz_router.get("/categories/{category_id}/timer-config")
async def get_category_timer_config(category_id: str):
    """Get timer configuration for a specific category."""
    database = get_db()
    category = await database.quiz_categories.find_one({"id": category_id})
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Return timer configuration from category
    return {
        "category_id": category_id,
        "category_name": category.get("name", "Unknown"),
        "timer_enabled": category.get("timer_enabled", True),
        "timer_seconds": category.get("timer_seconds", 30),
        "show_timer_warning": category.get("show_timer_warning", True),
        "auto_advance_on_timeout": category.get("auto_advance_on_timeout", True),
        "show_correct_answer_on_timeout": category.get("show_correct_answer_on_timeout", True)
    }


@quiz_router.get("/question/{question_id}", response_model=QuizQuestion)
async def get_single_question(question_id: str):
    """Get a single question by ID."""
    database = get_db()
    question = await database.quiz_questions.find_one({"id": question_id})

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    return QuizQuestion(**question)
