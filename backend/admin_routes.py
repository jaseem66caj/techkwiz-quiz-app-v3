from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_admin_user
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

admin_router = APIRouter(prefix="/admin", tags=["admin"])

db = None


def get_db():
    return db

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