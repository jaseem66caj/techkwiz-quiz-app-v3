"""
Redis caching layer for TechKwiz application.
"""
import json
import pickle
from typing import Any, Optional, Union
import redis.asyncio as redis
import structlog

from config import settings

logger = structlog.get_logger()


class CacheManager:
    """Redis cache manager with fallback to in-memory cache."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.memory_cache: dict = {}
        self.enabled = settings.redis_enabled
    
    async def connect(self):
        """Connect to Redis if enabled."""
        if not self.enabled or not settings.redis_url:
            logger.info("Redis caching disabled, using memory cache")
            return
        
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=False,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # Test connection
            await self.redis_client.ping()
            logger.info("Redis cache connected successfully")
            
        except Exception as e:
            logger.warning("Redis connection failed, using memory cache", error=str(e))
            self.redis_client = None
    
    async def disconnect(self):
        """Disconnect from Redis."""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis cache disconnected")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            if self.redis_client:
                # Try Redis first
                value = await self.redis_client.get(key)
                if value is not None:
                    return pickle.loads(value)
            else:
                # Fallback to memory cache
                return self.memory_cache.get(key)
        except Exception as e:
            logger.error("Cache get failed", key=key, error=str(e))
        
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL."""
        try:
            if self.redis_client:
                # Use Redis
                serialized = pickle.dumps(value)
                await self.redis_client.setex(key, ttl, serialized)
                return True
            else:
                # Fallback to memory cache (no TTL for simplicity)
                self.memory_cache[key] = value
                return True
        except Exception as e:
            logger.error("Cache set failed", key=key, error=str(e))
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete value from cache."""
        try:
            if self.redis_client:
                await self.redis_client.delete(key)
            else:
                self.memory_cache.pop(key, None)
            return True
        except Exception as e:
            logger.error("Cache delete failed", key=key, error=str(e))
            return False
    
    async def clear(self) -> bool:
        """Clear all cache."""
        try:
            if self.redis_client:
                await self.redis_client.flushdb()
            else:
                self.memory_cache.clear()
            return True
        except Exception as e:
            logger.error("Cache clear failed", error=str(e))
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            if self.redis_client:
                return bool(await self.redis_client.exists(key))
            else:
                return key in self.memory_cache
        except Exception as e:
            logger.error("Cache exists check failed", key=key, error=str(e))
            return False


# Global cache manager instance
cache_manager = CacheManager()


async def startup_cache():
    """Startup event for cache connection."""
    await cache_manager.connect()


async def shutdown_cache():
    """Shutdown event for cache disconnection."""
    await cache_manager.disconnect()


# Cache decorators and utilities
def cache_key(*args, **kwargs) -> str:
    """Generate cache key from arguments."""
    key_parts = []
    
    for arg in args:
        if isinstance(arg, (str, int, float, bool)):
            key_parts.append(str(arg))
        else:
            key_parts.append(str(hash(str(arg))))
    
    for k, v in sorted(kwargs.items()):
        if isinstance(v, (str, int, float, bool)):
            key_parts.append(f"{k}:{v}")
        else:
            key_parts.append(f"{k}:{hash(str(v))}")
    
    return ":".join(key_parts)


async def cached_quiz_categories() -> Optional[list]:
    """Get cached quiz categories."""
    return await cache_manager.get("quiz_categories")


async def cache_quiz_categories(categories: list, ttl: int = 600):
    """Cache quiz categories for 10 minutes."""
    await cache_manager.set("quiz_categories", categories, ttl)


async def cached_quiz_questions(category: str) -> Optional[list]:
    """Get cached quiz questions for category."""
    key = f"quiz_questions:{category}"
    return await cache_manager.get(key)


async def cache_quiz_questions(category: str, questions: list, ttl: int = 300):
    """Cache quiz questions for 5 minutes."""
    key = f"quiz_questions:{category}"
    await cache_manager.set(key, questions, ttl)


async def invalidate_quiz_cache():
    """Invalidate all quiz-related cache."""
    try:
        if cache_manager.redis_client:
            # Delete all keys matching patterns
            keys = await cache_manager.redis_client.keys("quiz_*")
            if keys:
                await cache_manager.redis_client.delete(*keys)
        else:
            # Clear memory cache entries
            keys_to_delete = [k for k in cache_manager.memory_cache.keys() if k.startswith("quiz_")]
            for key in keys_to_delete:
                del cache_manager.memory_cache[key]
        
        logger.info("Quiz cache invalidated")
    except Exception as e:
        logger.error("Cache invalidation failed", error=str(e))


async def cached_admin_session(token: str) -> Optional[dict]:
    """Get cached admin session."""
    key = f"admin_session:{token}"
    return await cache_manager.get(key)


async def cache_admin_session(token: str, session_data: dict, ttl: int = 1800):
    """Cache admin session for 30 minutes."""
    key = f"admin_session:{token}"
    await cache_manager.set(key, session_data, ttl)


async def invalidate_admin_session(token: str):
    """Invalidate admin session cache."""
    key = f"admin_session:{token}"
    await cache_manager.delete(key)
