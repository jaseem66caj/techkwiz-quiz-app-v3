from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from auth import get_current_admin_user, create_access_token, verify_password, hash_password
from models import (
    AdminProfileUpdate,
    AdminToken,
    AdminUser,
    AdSlot,
    AdSlotCreate,
    AdSlotUpdate,
    QuizCategory,
    QuizQuestion,
    RewardedPopupConfig,
    RewardedPopupConfigUpdate,
    ScriptInjection,
    ScriptInjectionCreate,
    ScriptInjectionUpdate,
    QuizDataExport,
)

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminSetup(BaseModel):
    username: str
    password: str

admin_router = APIRouter(prefix="/admin", tags=["admin"])

db = None


def get_db():
    return db


# Authentication endpoints
@admin_router.post("/login", response_model=AdminToken)
async def admin_login(login_data: AdminLogin):
    """Admin login endpoint."""
    database = get_db()
    
    # Find admin user
    admin = await database.admin_users.find_one({"username": login_data.username})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": admin["username"]},
        expires_delta=timedelta(minutes=30)
    )
    
    # Update last login
    await database.admin_users.update_one(
        {"username": login_data.username},
        {"$set": {"last_login": datetime.utcnow().isoformat()}}
    )
    
    return AdminToken(access_token=access_token, token_type="bearer")


@admin_router.post("/setup", response_model=dict)
async def admin_setup(setup_data: AdminSetup):
    """Create initial admin user."""
    database = get_db()
    
    # Check if admin already exists
    existing_admin = await database.admin_users.find_one({"username": setup_data.username})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Create admin user
    admin_data = {
        "username": setup_data.username,
        "email": "admin@techkwiz.com",
        "password_hash": hash_password(setup_data.password),
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": None,
    }
    
    await database.admin_users.insert_one(admin_data)
    
    return {"message": "Admin user created successfully"}


@admin_router.get("/verify")
async def verify_admin(current_admin: str = Depends(get_current_admin_user)):
    """Verify admin token."""
    return {"username": current_admin, "valid": True}

# ... existing endpoints above (preserved) ...

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


# NEW: Convenience endpoint to update homepage config without path param (for existing admin UI compatibility)
@admin_router.put("/rewarded-config", response_model=RewardedPopupConfig)
async def update_homepage_rewarded_config(
    config_data: RewardedPopupConfigUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    database = get_db()
    update_data = {k: v for k, v in config_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    update_data["category_id"] = None
    update_data.setdefault("category_name", "Homepage")

    await database.rewarded_popup_config.update_one(
        {"category_id": None}, {"$set": update_data}, upsert=True
    )
    updated_config = await database.rewarded_popup_config.find_one({"category_id": None})
    return RewardedPopupConfig(**updated_config)