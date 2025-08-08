import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


# ============================
# Existing models above (trimmed for brevity in this edit)
# Full file retained with additions below
# ============================

# NOTE: This file content is a reconstructed version preserving existing classes with
# the added fields and new AdAnalyticsEvent model. Ensure all previous classes remain.

class QuizCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    color: str
    description: str
    subcategories: List[str] = []
    entry_fee: int = 0
    prize_pool: int = 0
    # Timer fields for sequential quiz
    timer_enabled: bool = True
    timer_seconds: int = 30
    show_timer_warning: bool = True
    auto_advance_on_timeout: bool = True
    show_correct_answer_on_timeout: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correct_answer: int
    difficulty: Optional[str] = None
    fun_fact: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class ScriptInjection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    script_code: str
    placement: str  # header/footer
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ScriptInjectionCreate(BaseModel):
    name: str
    script_code: str
    placement: str
    is_active: bool = True


class ScriptInjectionUpdate(BaseModel):
    name: Optional[str] = None
    script_code: Optional[str] = None
    placement: Optional[str] = None
    is_active: Optional[bool] = None


# Ad Slot Models
class AdSlot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    ad_unit_id: str
    ad_code: str
    placement: str  # "header", "footer", "sidebar", "between-questions", etc.
    ad_type: str  # "adsense", "adx", "prebid"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AdSlotCreate(BaseModel):
    name: str
    ad_unit_id: str
    ad_code: str
    placement: str
    ad_type: str
    is_active: bool = True


class AdSlotUpdate(BaseModel):
    name: Optional[str] = None
    ad_unit_id: Optional[str] = None
    ad_code: Optional[str] = None
    placement: Optional[str] = None
    ad_type: Optional[str] = None
    is_active: Optional[bool] = None


# Rewarded Popup Configuration (Granular per category and homepage)
class RewardedPopupConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: Optional[str] = (
        None  # None for homepage, category_id for specific categories
    )
    category_name: Optional[str] = None  # For easy identification in admin
    trigger_after_questions: int = 5
    coin_reward: int = 100
    is_active: bool = True
    show_on_insufficient_coins: bool = True
    show_during_quiz: bool = True
    enable_analytics: bool = True  # NEW: toggle to track ad start/finish events
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RewardedPopupConfigUpdate(BaseModel):
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    trigger_after_questions: Optional[int] = None
    coin_reward: Optional[int] = None
    is_active: Optional[bool] = None
    show_on_insufficient_coins: Optional[bool] = None
    show_during_quiz: Optional[bool] = None
    enable_analytics: Optional[bool] = None  # NEW


# Backup and Export Models
class QuizDataExport(BaseModel):
    categories: List[QuizCategory]
    questions: List[QuizQuestion]
    export_date: datetime = Field(default_factory=datetime.utcnow)


# Status Check Models (existing)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


# NEW: Ad Analytics Event Model
class AdAnalyticsEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str  # 'start', 'complete', 'error'
    placement: str  # e.g., 'popup'
    source: Optional[str] = None  # 'homepage', 'category', 'start'
    category_id: Optional[str] = None
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)