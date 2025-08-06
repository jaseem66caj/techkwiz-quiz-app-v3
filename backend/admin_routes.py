import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient

from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    hash_password,
    verify_password,
    verify_token,
)
from email_service import EmailService, generate_reset_token, hash_reset_token
from models import (
    AdminLogin,
    AdminPasswordReset,
    AdminPasswordUpdate,
    AdminProfileUpdate,
    AdminToken,
    AdminUser,
    AdSlot,
    AdSlotCreate,
    AdSlotUpdate,
    QuizCategory,
    QuizCategoryCreate,
    QuizCategoryUpdate,
    QuizDataExport,
    QuizQuestion,
    QuizQuestionCreate,
    QuizQuestionUpdate,
    RewardedPopupConfig,
    RewardedPopupConfigUpdate,
    ScriptInjection,
    ScriptInjectionCreate,
    ScriptInjectionUpdate,
    SiteConfig,
    SiteConfigUpdate,
)

admin_router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer()

# Database dependency - will be injected
db = None


def get_db():
    return db


async def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Dependency to get current authenticated admin user."""
    token = credentials.credentials
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if admin user exists in database
    database = get_db()
    admin_user = await database.admin_users.find_one({"username": username})
    if admin_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found",
        )

    return AdminUser(**admin_user)


# Authentication endpoints
@admin_router.post("/setup", response_model=AdminUser)
async def setup_admin_user(admin_data: AdminLogin):
    """Setup the first admin user (only if no admin exists)."""
    database = get_db()

    # Check if any admin already exists
    existing_admin = await database.admin_users.find_one({})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Admin user already exists"
        )

    # Create the admin user with default email
    admin_user = AdminUser(
        username=admin_data.username,
        email="jaseem@adops.in",  # Default admin email
        password_hash=hash_password(admin_data.password),
    )

    await database.admin_users.insert_one(admin_user.dict())
    return admin_user


@admin_router.post("/login", response_model=AdminToken)
async def admin_login(admin_data: AdminLogin):
    """Admin login endpoint."""
    database = get_db()

    # Find admin user
    admin_user = await database.admin_users.find_one({"username": admin_data.username})
    if not admin_user or not verify_password(
        admin_data.password, admin_user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Update last login
    await database.admin_users.update_one(
        {"username": admin_data.username}, {"$set": {"last_login": datetime.utcnow()}}
    )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin_data.username}, expires_delta=access_token_expires
    )

    return AdminToken(access_token=access_token)


@admin_router.get("/verify")
async def verify_admin_token(
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Verify admin token is valid."""
    return {"valid": True, "username": current_admin.username}


# Password Reset Endpoints
@admin_router.post("/forgot-password")
async def forgot_password(reset_data: AdminPasswordReset):
    """Send password reset email to admin."""
    database = get_db()

    # Find admin user by email
    admin_user = await database.admin_users.find_one({"email": reset_data.email})
    if not admin_user:
        # Don't reveal if email exists or not for security
        return {
            "message": "If an account with that email exists, a password reset link has been sent."
        }

    # Generate reset token
    reset_token = generate_reset_token()
    token_hash = hash_reset_token(reset_token)
    expires_at = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour

    # Update user with reset token
    await database.admin_users.update_one(
        {"email": reset_data.email},
        {"$set": {"reset_token": token_hash, "reset_token_expires": expires_at}},
    )

    # Send reset email
    email_service = EmailService()
    await email_service.send_password_reset_email(
        to_email=reset_data.email,
        reset_token=reset_token,
        admin_username=admin_user["username"],
    )

    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }


@admin_router.post("/reset-password")
async def reset_password(reset_data: AdminPasswordUpdate):
    """Reset admin password using reset token."""
    database = get_db()

    # Hash the provided token to match stored hash
    token_hash = hash_reset_token(reset_data.token)

    # Find admin user with valid reset token
    admin_user = await database.admin_users.find_one(
        {"reset_token": token_hash, "reset_token_expires": {"$gt": datetime.utcnow()}}
    )

    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Update password and clear reset token
    new_password_hash = hash_password(reset_data.new_password)
    await database.admin_users.update_one(
        {"_id": admin_user["_id"]},
        {
            "$set": {"password_hash": new_password_hash},
            "$unset": {"reset_token": "", "reset_token_expires": ""},
        },
    )

    return {"message": "Password has been successfully reset"}


@admin_router.put("/profile", response_model=AdminUser)
async def update_admin_profile(
    profile_data: AdminProfileUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update admin profile including username, email, and password."""
    database = get_db()

    # Verify current password
    admin_user = await database.admin_users.find_one(
        {"username": current_admin.username}
    )
    if not admin_user or not verify_password(
        profile_data.current_password, admin_user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect",
        )

    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}

    if profile_data.username:
        # Check if new username is already taken
        existing_user = await database.admin_users.find_one(
            {"username": profile_data.username, "_id": {"$ne": admin_user["_id"]}}
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken",
            )
        update_data["username"] = profile_data.username

    if profile_data.email:
        update_data["email"] = profile_data.email

    if profile_data.new_password:
        update_data["password_hash"] = hash_password(profile_data.new_password)

    # Update admin user
    await database.admin_users.update_one(
        {"_id": admin_user["_id"]}, {"$set": update_data}
    )

    # Return updated user data
    updated_admin = await database.admin_users.find_one({"_id": admin_user["_id"]})
    return AdminUser(**updated_admin)


# Quiz Category Management
@admin_router.get("/categories", response_model=List[QuizCategory])
async def get_categories(current_admin: AdminUser = Depends(get_current_admin_user)):
    """Get all quiz categories."""
    database = get_db()
    categories = await database.quiz_categories.find().to_list(1000)
    return [QuizCategory(**cat) for cat in categories]


@admin_router.post("/categories", response_model=QuizCategory)
async def create_category(
    category_data: QuizCategoryCreate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Create a new quiz category."""
    database = get_db()
    category = QuizCategory(**category_data.dict())
    await database.quiz_categories.insert_one(category.dict())
    return category


@admin_router.put("/categories/{category_id}", response_model=QuizCategory)
async def update_category(
    category_id: str,
    category_data: QuizCategoryUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update a quiz category."""
    database = get_db()

    update_data = {k: v for k, v in category_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = await database.quiz_categories.update_one(
        {"id": category_id}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    updated_category = await database.quiz_categories.find_one({"id": category_id})
    return QuizCategory(**updated_category)


@admin_router.delete("/categories/{category_id}")
async def delete_category(
    category_id: str, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Delete a quiz category."""
    database = get_db()

    # Also delete all questions in this category
    await database.quiz_questions.delete_many({"category": category_id})

    result = await database.quiz_categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    return {"message": "Category deleted successfully"}


# Quiz Question Management
@admin_router.get("/questions", response_model=List[QuizQuestion])
async def get_questions(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Get quiz questions with optional filtering."""
    database = get_db()

    filter_dict = {}
    if category:
        filter_dict["category"] = category
    if difficulty:
        filter_dict["difficulty"] = difficulty

    questions = await database.quiz_questions.find(filter_dict).to_list(1000)
    return [QuizQuestion(**q) for q in questions]


@admin_router.post("/questions", response_model=QuizQuestion)
async def create_question(
    question_data: QuizQuestionCreate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Create a new quiz question."""
    database = get_db()
    question = QuizQuestion(**question_data.dict())
    await database.quiz_questions.insert_one(question.dict())
    return question


@admin_router.put("/questions/{question_id}", response_model=QuizQuestion)
async def update_question(
    question_id: str,
    question_data: QuizQuestionUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update a quiz question."""
    database = get_db()

    update_data = {k: v for k, v in question_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = await database.quiz_questions.update_one(
        {"id": question_id}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")

    updated_question = await database.quiz_questions.find_one({"id": question_id})
    return QuizQuestion(**updated_question)


@admin_router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Delete a quiz question."""
    database = get_db()

    result = await database.quiz_questions.delete_one({"id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")

    return {"message": "Question deleted successfully"}


# Script Injection Management
@admin_router.get("/scripts", response_model=List[ScriptInjection])
async def get_scripts(current_admin: AdminUser = Depends(get_current_admin_user)):
    """Get all script injections."""
    database = get_db()
    scripts = await database.script_injections.find().to_list(1000)
    return [ScriptInjection(**script) for script in scripts]


@admin_router.post("/scripts", response_model=ScriptInjection)
async def create_script(
    script_data: ScriptInjectionCreate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Create a new script injection."""
    database = get_db()
    script = ScriptInjection(**script_data.dict())
    await database.script_injections.insert_one(script.dict())
    return script


@admin_router.put("/scripts/{script_id}", response_model=ScriptInjection)
async def update_script(
    script_id: str,
    script_data: ScriptInjectionUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update a script injection."""
    database = get_db()

    update_data = {k: v for k, v in script_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = await database.script_injections.update_one(
        {"id": script_id}, {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Script not found")

    updated_script = await database.script_injections.find_one({"id": script_id})
    return ScriptInjection(**updated_script)


@admin_router.delete("/scripts/{script_id}")
async def delete_script(
    script_id: str, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Delete a script injection."""
    database = get_db()

    result = await database.script_injections.delete_one({"id": script_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Script not found")

    return {"message": "Script deleted successfully"}


# Ad Slot Management
@admin_router.get("/ad-slots", response_model=List[AdSlot])
async def get_ad_slots(current_admin: AdminUser = Depends(get_current_admin_user)):
    """Get all ad slots."""
    database = get_db()
    ad_slots = await database.ad_slots.find().to_list(1000)
    return [AdSlot(**slot) for slot in ad_slots]


@admin_router.post("/ad-slots", response_model=AdSlot)
async def create_ad_slot(
    slot_data: AdSlotCreate, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Create a new ad slot."""
    database = get_db()
    ad_slot = AdSlot(**slot_data.dict())
    await database.ad_slots.insert_one(ad_slot.dict())
    return ad_slot


@admin_router.put("/ad-slots/{slot_id}", response_model=AdSlot)
async def update_ad_slot(
    slot_id: str,
    slot_data: AdSlotUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update an ad slot."""
    database = get_db()

    update_data = {k: v for k, v in slot_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    result = await database.ad_slots.update_one({"id": slot_id}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ad slot not found")

    updated_slot = await database.ad_slots.find_one({"id": slot_id})
    return AdSlot(**updated_slot)


@admin_router.delete("/ad-slots/{slot_id}")
async def delete_ad_slot(
    slot_id: str, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Delete an ad slot."""
    database = get_db()

    result = await database.ad_slots.delete_one({"id": slot_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ad slot not found")

    return {"message": "Ad slot deleted successfully"}


# Rewarded Popup Configuration
@admin_router.get("/rewarded-config", response_model=List[RewardedPopupConfig])
async def get_all_rewarded_configs(
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Get all rewarded popup configurations."""
    database = get_db()
    configs = await database.rewarded_popup_config.find().to_list(length=None)

    if not configs:
        # Create default config for homepage if none exists
        default_config = RewardedPopupConfig(category_name="Homepage")
        await database.rewarded_popup_config.insert_one(default_config.dict())
        return [default_config]

    return [RewardedPopupConfig(**config) for config in configs]


@admin_router.get("/rewarded-config/{category_id}", response_model=RewardedPopupConfig)
async def get_rewarded_config(
    category_id: str, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Get rewarded popup configuration for specific category or homepage (use 'homepage' for homepage)."""
    database = get_db()

    # For homepage, use None as category_id
    query_category_id = None if category_id == "homepage" else category_id
    config = await database.rewarded_popup_config.find_one(
        {"category_id": query_category_id}
    )

    if not config:
        # Create default config if none exists
        category_name = "Homepage" if category_id == "homepage" else None
        if category_name != "Homepage" and category_id:
            # Get category name for better identification
            category = await database.categories.find_one({"id": category_id})
            category_name = category["name"] if category else f"Category {category_id}"

        default_config = RewardedPopupConfig(
            category_id=query_category_id, category_name=category_name
        )
        await database.rewarded_popup_config.insert_one(default_config.dict())
        return default_config

    return RewardedPopupConfig(**config)


@admin_router.put("/rewarded-config/{category_id}", response_model=RewardedPopupConfig)
async def update_rewarded_config(
    category_id: str,
    config_data: RewardedPopupConfigUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update rewarded popup configuration for specific category or homepage."""
    database = get_db()

    # For homepage, use None as category_id
    query_category_id = None if category_id == "homepage" else category_id

    update_data = {k: v for k, v in config_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    update_data["category_id"] = query_category_id

    # Get category name if not provided
    if "category_name" not in update_data or not update_data["category_name"]:
        if category_id == "homepage":
            update_data["category_name"] = "Homepage"
        elif category_id:
            category = await database.categories.find_one({"id": category_id})
            update_data["category_name"] = (
                category["name"] if category else f"Category {category_id}"
            )

    # Upsert the configuration
    await database.rewarded_popup_config.update_one(
        {"category_id": query_category_id}, {"$set": update_data}, upsert=True
    )

    updated_config = await database.rewarded_popup_config.find_one(
        {"category_id": query_category_id}
    )
    return RewardedPopupConfig(**updated_config)


# Data Export and Backup
@admin_router.get("/export/quiz-data", response_model=QuizDataExport)
async def export_quiz_data(current_admin: AdminUser = Depends(get_current_admin_user)):
    """Export all quiz data for backup."""
    database = get_db()

    categories = await database.quiz_categories.find().to_list(1000)
    questions = await database.quiz_questions.find().to_list(1000)

    return QuizDataExport(
        categories=[QuizCategory(**cat) for cat in categories],
        questions=[QuizQuestion(**q) for q in questions],
    )


@admin_router.post("/import/quiz-data")
async def import_quiz_data(
    data: QuizDataExport, current_admin: AdminUser = Depends(get_current_admin_user)
):
    """Import quiz data from backup."""
    database = get_db()

    # Clear existing data
    await database.quiz_categories.delete_many({})
    await database.quiz_questions.delete_many({})

    # Import categories
    if data.categories:
        await database.quiz_categories.insert_many(
            [cat.dict() for cat in data.categories]
        )

    # Import questions
    if data.questions:
        await database.quiz_questions.insert_many([q.dict() for q in data.questions])

    return {"message": "Quiz data imported successfully"}


# Site Configuration Management
@admin_router.get("/site-config", response_model=SiteConfig)
async def get_site_config(current_admin: AdminUser = Depends(get_current_admin_user)):
    """Get site configuration."""
    database = get_db()
    config = await database.site_config.find_one()

    if not config:
        # Create default config if none exists
        default_config = SiteConfig()
        await database.site_config.insert_one(default_config.dict())
        return default_config

    return SiteConfig(**config)


@admin_router.put("/site-config", response_model=SiteConfig)
async def update_site_config(
    config_data: SiteConfigUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Update site configuration."""
    database = get_db()

    update_data = {k: v for k, v in config_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()

    # Upsert the configuration
    await database.site_config.update_one({}, {"$set": update_data}, upsert=True)

    updated_config = await database.site_config.find_one()
    return SiteConfig(**updated_config)
