from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

# Admin Models
class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Quiz Models
class QuizDifficulty(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correct_answer: int
    difficulty: QuizDifficulty
    fun_fact: str
    category: str
    subcategory: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class QuizQuestionCreate(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    difficulty: QuizDifficulty
    fun_fact: str
    category: str
    subcategory: str

class QuizQuestionUpdate(BaseModel):
    question: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[int] = None
    difficulty: Optional[QuizDifficulty] = None
    fun_fact: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None

class QuizCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    color: str
    description: str
    subcategories: List[str]
    entry_fee: int
    prize_pool: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class QuizCategoryCreate(BaseModel):
    name: str
    icon: str
    color: str
    description: str
    subcategories: List[str]
    entry_fee: int
    prize_pool: int

class QuizCategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    description: Optional[str] = None
    subcategories: Optional[List[str]] = None
    entry_fee: Optional[int] = None
    prize_pool: Optional[int] = None

# Site Configuration Models
class ScriptInjection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    script_code: str
    placement: str  # "header" or "footer"
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
    ad_type: str    # "adsense", "adx", "prebid"
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

# Rewarded Popup Configuration
class RewardedPopupConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trigger_after_questions: int = 5
    coin_reward: int = 200
    is_active: bool = True
    show_on_insufficient_coins: bool = True
    show_during_quiz: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RewardedPopupConfigUpdate(BaseModel):
    trigger_after_questions: Optional[int] = None
    coin_reward: Optional[int] = None
    is_active: Optional[bool] = None
    show_on_insufficient_coins: Optional[bool] = None
    show_during_quiz: Optional[bool] = None

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