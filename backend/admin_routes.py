from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

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

# ... existing endpoints preserved ...

# Rewarded Popup Configuration (existing functions remain here)
# (get_all_rewarded_configs, get_rewarded_config, update_rewarded_config, update_homepage_rewarded_config)

# --- NEW: Ad Analytics Reporting Endpoint ---
@admin_router.get("/ad-analytics")
async def get_ad_analytics(
    from_ts: Optional[str] = Query(None, description="ISO date/time start"),
    to_ts: Optional[str] = Query(None, description="ISO date/time end"),
    placement: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=200),
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Return simple ad analytics summary and recent events for admin reporting."""
    database = get_db()

    # Build filter
    flt = {}
    if placement:
        flt["placement"] = placement
    if category_id:
        flt["category_id"] = category_id

    # Parse date range
    if from_ts or to_ts:
        time_flt = {}
        if from_ts:
            time_flt["$gte"] = datetime.fromisoformat(from_ts)
        if to_ts:
            time_flt["$lte"] = datetime.fromisoformat(to_ts)
        flt["created_at"] = time_flt

    # Recent events
    recent = await database.ad_analytics.find(flt).sort("created_at", -1).limit(limit).to_list(length=limit)

    # Totals aggregation
    pipeline = [
        {"$match": flt},
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}},
    ]
    agg = await database.ad_analytics.aggregate(pipeline).to_list(length=None)
    totals = {"start": 0, "complete": 0, "error": 0}
    for row in agg:
        totals[row["_id"]] = row["count"]
    conversion_rate = (totals["complete"] / totals["start"]) * 100 if totals["start"] else 0.0

    return {
        "totals": {**totals, "conversion_rate": round(conversion_rate, 2)},
        "recent": recent,
        "filter": {"from_ts": from_ts, "to_ts": to_ts, "placement": placement, "category_id": category_id},
    }