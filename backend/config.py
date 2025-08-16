"""
Configuration management for TechKwiz application.
Handles environment-specific settings with validation.
"""
import os
import secrets
from typing import List, Optional
from pathlib import Path
from pydantic import validator, Field
from pydantic_settings import BaseSettings
import structlog

logger = structlog.get_logger()


class Settings(BaseSettings):
    """Application settings with environment-specific configuration."""
    
    # Environment
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    
    # Database Configuration
    mongo_url: str = Field(env="MONGO_URL")
    db_name: str = Field(env="DB_NAME")
    database_min_connections: int = Field(default=1, env="DATABASE_MIN_CONNECTIONS")
    database_max_connections: int = Field(default=10, env="DATABASE_MAX_CONNECTIONS")
    
    # Authentication Configuration
    jwt_secret_key: str = Field(env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    fast_auth: bool = Field(default=False, env="FAST_AUTH")
    bcrypt_rounds: int = Field(default=12, env="BCRYPT_ROUNDS")
    
    # API Configuration
    api_host: str = Field(default="localhost", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    api_base_url: str = Field(env="API_BASE_URL")
    
    # Frontend Configuration
    frontend_url: str = Field(env="FRONTEND_URL")
    cors_origins: List[str] = Field(default=["http://localhost:3000"], env="CORS_ORIGINS")
    
    # Logging Configuration
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="console", env="LOG_FORMAT")
    
    # Security Configuration
    rate_limit_enabled: bool = Field(default=False, env="RATE_LIMIT_ENABLED")
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    https_only: bool = Field(default=False, env="HTTPS_ONLY")
    secure_cookies: bool = Field(default=False, env="SECURE_COOKIES")
    
    # Redis Configuration
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    redis_enabled: bool = Field(default=False, env="REDIS_ENABLED")
    
    # Monitoring Configuration
    metrics_enabled: bool = Field(default=False, env="METRICS_ENABLED")
    health_check_enabled: bool = Field(default=True, env="HEALTH_CHECK_ENABLED")
    
    @validator("jwt_secret_key")
    def validate_jwt_secret_key(cls, v, values):
        """Validate JWT secret key strength."""
        environment = values.get("environment", "development")
        
        if environment == "production":
            if len(v) < 32:
                raise ValueError("JWT secret key must be at least 32 characters for production")
            if v in ["your-secret-key-change-in-production", "CHANGE_ME_TO_STRONG_256_BIT_SECRET_KEY"]:
                raise ValueError("Default JWT secret key detected in production")
        
        return v
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            # Handle JSON-like string format
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            # Handle comma-separated string
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("bcrypt_rounds")
    def validate_bcrypt_rounds(cls, v, values):
        """Validate bcrypt rounds based on environment."""
        environment = values.get("environment", "development")
        
        if environment == "production" and v < 10:
            logger.warning("Low bcrypt rounds for production", rounds=v)
        elif environment == "development" and v > 6:
            logger.warning("High bcrypt rounds for development", rounds=v)
        
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


def load_settings() -> Settings:
    """Load settings based on environment."""
    environment = os.getenv("ENVIRONMENT", "development")
    
    # Load environment-specific .env file
    env_files = [
        f".env.{environment}",
        ".env.local",  # Local overrides
        ".env"         # Fallback
    ]
    
    for env_file in env_files:
        if Path(env_file).exists():
            logger.info("Loading environment file", file=env_file)
            break
    else:
        logger.warning("No environment file found, using defaults")
    
    try:
        settings = Settings(_env_file=env_file if 'env_file' in locals() else None)
        logger.info("Configuration loaded successfully", 
                   environment=settings.environment,
                   debug=settings.debug)
        return settings
    except Exception as e:
        logger.error("Configuration validation failed", error=str(e))
        raise


def generate_jwt_secret() -> str:
    """Generate a secure JWT secret key."""
    return secrets.token_urlsafe(32)


# Global settings instance
settings = load_settings()
