import csv
import io
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer

from auth import create_access_token, get_current_admin_user, hash_password, verify_password
from models import (
    AdAnalyticsEvent,
    AdSlot,
    AdSlotCreate,
    AdSlotUpdate,
    AdminToken,
    AdminUser,
    QuizCategory,
    QuizDataExport,
    QuizQuestion,
    RewardedPopupConfig,
    RewardedPopupConfigUpdate,
    ScriptInjection,
    ScriptInjectionCreate,
    ScriptInjectionUpdate,
)

admin_router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer()

# Database dependency - will be injected
db = None


def get_db():
    return db


# Authentication Models
from pydantic import BaseModel


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminSetup(BaseModel):
    username: str
    email: str
    password: str


# ============================
# AUTHENTICATION ENDPOINTS
# ============================

@admin_router.post("/setup")
async def setup_admin(admin_data: AdminSetup):
    """Create the initial admin user."""
    database = get_db()

    # Check if admin already exists
    existing_admin = await database.admin_users.find_one({"username": admin_data.username})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )

    # Create admin user
    admin_user = AdminUser(
        username=admin_data.username,
        email=admin_data.email,
        password_hash=hash_password(admin_data.password)
    )

    await database.admin_users.insert_one(admin_user.dict())

    return {"message": "Admin user created successfully"}


@admin_router.post("/login", response_model=AdminToken)
async def login_admin(admin_login: AdminLogin):
    """Authenticate admin user and return access token."""
    database = get_db()

    # Find admin user
    admin_user = await database.admin_users.find_one({"username": admin_login.username})
    if not admin_user or not verify_password(admin_login.password, admin_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": admin_user["username"]}, expires_delta=access_token_expires
    )

    return AdminToken(access_token=access_token)


@admin_router.get("/verify")
async def verify_admin_token(current_admin: str = Depends(get_current_admin_user)):
    """Verify admin token and return admin info."""
    return {"username": current_admin, "authenticated": True}


# ============================
# QUIZ MANAGEMENT ENDPOINTS
# ============================

@admin_router.get("/categories", response_model=List[QuizCategory])
async def get_admin_categories(current_admin: str = Depends(get_current_admin_user)):
    """Get all quiz categories for admin management."""
    database = get_db()
    categories = await database.quiz_categories.find().to_list(1000)
    return [QuizCategory(**cat) for cat in categories]


@admin_router.post("/categories", response_model=QuizCategory)
async def create_category(
    category: QuizCategory, current_admin: str = Depends(get_current_admin_user)
):
    """Create a new quiz category."""
    database = get_db()
    category_dict = category.dict()
    await database.quiz_categories.insert_one(category_dict)
    return category


@admin_router.put("/categories/{category_id}", response_model=QuizCategory)
async def update_category(
    category_id: str,
    category_update: QuizCategory,
    current_admin: str = Depends(get_current_admin_user),
):
    """Update an existing quiz category."""
    database = get_db()

    # Check if category exists
    existing_category = await database.quiz_categories.find_one({"id": category_id})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Update category
    category_update.updated_at = datetime.utcnow()
    update_dict = category_update.dict()
    await database.quiz_categories.update_one(
        {"id": category_id}, {"$set": update_dict}
    )

    return category_update


@admin_router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str, current_admin: str = Depends(get_current_admin_user)
):
    """Delete a quiz category."""
    database = get_db()

    # Check if category exists
    existing_category = await database.quiz_categories.find_one({"id": category_id})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Delete category
    await database.quiz_categories.delete_one({"id": category_id})

    # Also delete associated questions
    await database.quiz_questions.delete_many({"category": category_id})

    return {"message": "Category deleted successfully"}


@admin_router.get("/questions", response_model=List[QuizQuestion])
async def get_admin_questions(
    category: Optional[str] = Query(None),
    current_admin: str = Depends(get_current_admin_user),
):
    """Get all quiz questions for admin management."""
    database = get_db()

    filter_dict = {}
    if category:
        filter_dict["category"] = category

    questions = await database.quiz_questions.find(filter_dict).to_list(1000)
    return [QuizQuestion(**q) for q in questions]


@admin_router.post("/questions", response_model=QuizQuestion)
async def create_question(
    question: QuizQuestion, current_admin: str = Depends(get_current_admin_user)
):
    """Create a new quiz question."""
    database = get_db()
    question_dict = question.dict()
    await database.quiz_questions.insert_one(question_dict)
    return question


@admin_router.put("/questions/{question_id}", response_model=QuizQuestion)
async def update_question(
    question_id: str,
    question_update: QuizQuestion,
    current_admin: str = Depends(get_current_admin_user),
):
    """Update an existing quiz question."""
    database = get_db()

    # Check if question exists
    existing_question = await database.quiz_questions.find_one({"id": question_id})
    if not existing_question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Update question
    question_update.updated_at = datetime.utcnow()
    update_dict = question_update.dict()
    await database.quiz_questions.update_one(
        {"id": question_id}, {"$set": update_dict}
    )

    return question_update


@admin_router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str, current_admin: str = Depends(get_current_admin_user)
):
    """Delete a quiz question."""
    database = get_db()

    # Check if question exists
    existing_question = await database.quiz_questions.find_one({"id": question_id})
    if not existing_question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Delete question
    await database.quiz_questions.delete_one({"id": question_id})

    return {"message": "Question deleted successfully"}


# ============================
# SCRIPT MANAGEMENT ENDPOINTS
# ============================

@admin_router.get("/scripts", response_model=List[ScriptInjection])
async def get_admin_scripts(current_admin: str = Depends(get_current_admin_user)):
    """Get all script injections for admin management."""
    database = get_db()
    scripts = await database.script_injections.find().to_list(1000)
    return [ScriptInjection(**script) for script in scripts]


@admin_router.post("/scripts", response_model=ScriptInjection)
async def create_script(
    script: ScriptInjectionCreate, current_admin: str = Depends(get_current_admin_user)
):
    """Create a new script injection."""
    database = get_db()
    script_obj = ScriptInjection(**script.dict())
    await database.script_injections.insert_one(script_obj.dict())
    return script_obj


@admin_router.put("/scripts/{script_id}", response_model=ScriptInjection)
async def update_script(
    script_id: str,
    script_update: ScriptInjectionUpdate,
    current_admin: str = Depends(get_current_admin_user),
):
    """Update an existing script injection."""
    database = get_db()

    # Check if script exists
    existing_script = await database.script_injections.find_one({"id": script_id})
    if not existing_script:
        raise HTTPException(status_code=404, detail="Script not found")

    # Update script
    update_dict = {k: v for k, v in script_update.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()

    await database.script_injections.update_one(
        {"id": script_id}, {"$set": update_dict}
    )

    # Return updated script
    updated_script = await database.script_injections.find_one({"id": script_id})
    return ScriptInjection(**updated_script)


@admin_router.delete("/scripts/{script_id}")
async def delete_script(
    script_id: str, current_admin: str = Depends(get_current_admin_user)
):
    """Delete a script injection."""
    database = get_db()

    # Check if script exists
    existing_script = await database.script_injections.find_one({"id": script_id})
    if not existing_script:
        raise HTTPException(status_code=404, detail="Script not found")

    # Delete script
    await database.script_injections.delete_one({"id": script_id})

    return {"message": "Script deleted successfully"}


# ============================
# AD SLOT MANAGEMENT ENDPOINTS
# ============================

@admin_router.get("/ad-slots", response_model=List[AdSlot])
async def get_admin_ad_slots(current_admin: str = Depends(get_current_admin_user)):
    """Get all ad slots for admin management."""
    database = get_db()
    ad_slots = await database.ad_slots.find().to_list(1000)
    return [AdSlot(**slot) for slot in ad_slots]


@admin_router.post("/ad-slots", response_model=AdSlot)
async def create_ad_slot(
    ad_slot: AdSlotCreate, current_admin: str = Depends(get_current_admin_user)
):
    """Create a new ad slot."""
    database = get_db()
    ad_slot_obj = AdSlot(**ad_slot.dict())
    await database.ad_slots.insert_one(ad_slot_obj.dict())
    return ad_slot_obj


@admin_router.put("/ad-slots/{slot_id}", response_model=AdSlot)
async def update_ad_slot(
    slot_id: str,
    slot_update: AdSlotUpdate,
    current_admin: str = Depends(get_current_admin_user),
):
    """Update an existing ad slot."""
    database = get_db()

    # Check if ad slot exists
    existing_slot = await database.ad_slots.find_one({"id": slot_id})
    if not existing_slot:
        raise HTTPException(status_code=404, detail="Ad slot not found")

    # Update ad slot
    update_dict = {k: v for k, v in slot_update.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()

    await database.ad_slots.update_one({"id": slot_id}, {"$set": update_dict})

    # Return updated ad slot
    updated_slot = await database.ad_slots.find_one({"id": slot_id})
    return AdSlot(**updated_slot)


@admin_router.delete("/ad-slots/{slot_id}")
async def delete_ad_slot(
    slot_id: str, current_admin: str = Depends(get_current_admin_user)
):
    """Delete an ad slot."""
    database = get_db()

    # Check if ad slot exists
    existing_slot = await database.ad_slots.find_one({"id": slot_id})
    if not existing_slot:
        raise HTTPException(status_code=404, detail="Ad slot not found")

    # Delete ad slot
    await database.ad_slots.delete_one({"id": slot_id})

    return {"message": "Ad slot deleted successfully"}


# ============================
# REWARD CONFIGURATION ENDPOINTS
# ============================

@admin_router.get("/rewarded-config", response_model=List[RewardedPopupConfig])
async def get_all_rewarded_configs(current_admin: str = Depends(get_current_admin_user)):
    """Get all rewarded popup configurations."""
    database = get_db()
    configs = await database.rewarded_popup_config.find().to_list(1000)
    return [RewardedPopupConfig(**config) for config in configs]


@admin_router.get("/rewarded-config/{category_id}", response_model=RewardedPopupConfig)
async def get_rewarded_config(
    category_id: str, current_admin: str = Depends(get_current_admin_user)
):
    """Get rewarded popup configuration for specific category."""
    database = get_db()
    config = await database.rewarded_popup_config.find_one({"category_id": category_id})

    if not config:
        # Get category name for better identification
        category = await database.quiz_categories.find_one({"id": category_id})
        category_name = category["name"] if category else f"Category {category_id}"

        # Return default config if none exists
        return RewardedPopupConfig(category_id=category_id, category_name=category_name)

    return RewardedPopupConfig(**config)


@admin_router.put("/rewarded-config/{category_id}", response_model=RewardedPopupConfig)
async def update_rewarded_config(
    category_id: str,
    config_update: RewardedPopupConfigUpdate,
    current_admin: str = Depends(get_current_admin_user),
):
    """Update rewarded popup configuration."""
    database = get_db()

    # Check if config exists
    existing_config = await database.rewarded_popup_config.find_one({"category_id": category_id})

    if existing_config:
        # Update existing config
        update_dict = {k: v for k, v in config_update.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()

        await database.rewarded_popup_config.update_one(
            {"category_id": category_id}, {"$set": update_dict}
        )

        # Return updated config
        updated_config = await database.rewarded_popup_config.find_one({"category_id": category_id})
        return RewardedPopupConfig(**updated_config)
    else:
        # Create new config
        new_config = RewardedPopupConfig(
            category_id=category_id,
            **config_update.dict(exclude_unset=True)
        )
        await database.rewarded_popup_config.insert_one(new_config.dict())
        return new_config


# ============================
# DATA EXPORT/IMPORT ENDPOINTS
# ============================

@admin_router.get("/export/quiz-data", response_model=QuizDataExport)
async def export_quiz_data(current_admin: str = Depends(get_current_admin_user)):
    """Export all quiz data for backup."""
    database = get_db()

    # Get all categories and questions
    categories = await database.quiz_categories.find().to_list(1000)
    questions = await database.quiz_questions.find().to_list(1000)

    return QuizDataExport(
        categories=[QuizCategory(**cat) for cat in categories],
        questions=[QuizQuestion(**q) for q in questions]
    )


@admin_router.post("/import/quiz-data")
async def import_quiz_data(
    quiz_data: QuizDataExport, current_admin: str = Depends(get_current_admin_user)
):
    """Import quiz data from backup."""
    database = get_db()

    try:
        # Clear existing data
        await database.quiz_categories.delete_many({})
        await database.quiz_questions.delete_many({})

        # Import categories
        if quiz_data.categories:
            category_dicts = [cat.dict() for cat in quiz_data.categories]
            await database.quiz_categories.insert_many(category_dicts)

        # Import questions
        if quiz_data.questions:
            question_dicts = [q.dict() for q in quiz_data.questions]
            await database.quiz_questions.insert_many(question_dicts)

        return {
            "message": "Quiz data imported successfully",
            "categories_imported": len(quiz_data.categories),
            "questions_imported": len(quiz_data.questions)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )


# ============================
# ANALYTICS ENDPOINTS
# ============================

@admin_router.get("/ad-analytics")
async def get_ad_analytics(
    limit: int = Query(100, le=1000),
    placement: Optional[str] = Query(None),
    current_admin: str = Depends(get_current_admin_user),
):
    """Get ad analytics events."""
    database = get_db()

    filter_dict = {}
    if placement:
        filter_dict["placement"] = placement

    events = await database.ad_analytics.find(filter_dict).sort("created_at", -1).limit(limit).to_list(limit)

    # Calculate summary statistics
    total_events = len(events)
    starts = len([e for e in events if e.get("event_type") == "start"])
    completions = len([e for e in events if e.get("event_type") == "complete"])
    errors = len([e for e in events if e.get("event_type") == "error"])

    conversion_rate = (completions / starts * 100) if starts > 0 else 0

    return {
        "summary": {
            "total_events": total_events,
            "starts": starts,
            "completions": completions,
            "errors": errors,
            "conversion_rate": round(conversion_rate, 2)
        },
        "events": events
    }


@admin_router.get("/ad-analytics/export")
async def export_ad_analytics_csv(
    from_ts: Optional[str] = Query(None),
    to_ts: Optional[str] = Query(None),
    placement: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    current_admin: str = Depends(get_current_admin_user),
):
    """Export ad analytics events as CSV with optional filters."""
    database = get_db()
    flt = {}
    if placement:
        flt["placement"] = placement
    if category_id:
        flt["category_id"] = category_id
    if from_ts or to_ts:
        t = {}
        if from_ts:
            t["$gte"] = datetime.fromisoformat(from_ts)
        if to_ts:
            t["$lte"] = datetime.fromisoformat(to_ts)
        flt["created_at"] = t

    cursor = database.ad_analytics.find(flt).sort("created_at", -1)
    rows = await cursor.to_list(length=None)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["created_at", "event_type", "placement", "source", "category_id", "session_id", "metadata"])
    for r in rows:
        writer.writerow([
            r.get("created_at"),
            r.get("event_type"),
            r.get("placement"),
            r.get("source"),
            r.get("category_id"),
            r.get("session_id"),
            r.get("metadata"),
        ])

    output.seek(0)
    headers = {"Content-Disposition": "attachment; filename=ad_analytics.csv"}
    return StreamingResponse(iter([output.read()]), media_type="text/csv", headers=headers)