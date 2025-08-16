"""
Database management and initialization for TechKwiz application.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import structlog

from config import settings

logger = structlog.get_logger()


class DatabaseManager:
    """Database manager with connection pooling and indexing."""
    
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.database: AsyncIOMotorDatabase = None
    
    async def connect(self):
        """Connect to MongoDB with production-ready settings."""
        try:
            self.client = AsyncIOMotorClient(
                settings.mongo_url,
                minPoolSize=settings.database_min_connections,
                maxPoolSize=settings.database_max_connections,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                retryWrites=True,
                retryReads=True,
                readPreference="primaryPreferred"
            )
            
            self.database = self.client[settings.db_name]
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("Database connected successfully", 
                       db_name=settings.db_name,
                       environment=settings.environment)
            
            # Create indexes for production
            if settings.environment in ["staging", "production"]:
                await self.create_indexes()
            
        except Exception as e:
            logger.error("Database connection failed", error=str(e))
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            logger.info("Database disconnected")
    
    async def create_indexes(self):
        """Create database indexes for performance."""
        try:
            # Admin users indexes
            await self.database.admin_users.create_index("username", unique=True)
            await self.database.admin_users.create_index("email", unique=True)
            
            # Quiz categories indexes
            await self.database.quiz_categories.create_index("id", unique=True)
            await self.database.quiz_categories.create_index("name")
            await self.database.quiz_categories.create_index("created_at")
            
            # Quiz questions indexes
            await self.database.quiz_questions.create_index("id", unique=True)
            await self.database.quiz_questions.create_index("category")
            await self.database.quiz_questions.create_index("difficulty")
            await self.database.quiz_questions.create_index("type")
            await self.database.quiz_questions.create_index([("category", 1), ("difficulty", 1)])
            await self.database.quiz_questions.create_index("created_at")
            
            # Script injections indexes
            await self.database.script_injections.create_index("id", unique=True)
            await self.database.script_injections.create_index("name")
            await self.database.script_injections.create_index("enabled")
            
            # Ad slots indexes
            await self.database.ad_slots.create_index("id", unique=True)
            await self.database.ad_slots.create_index("slot_id", unique=True)
            await self.database.ad_slots.create_index("enabled")
            
            # Ad analytics indexes
            await self.database.ad_analytics.create_index("timestamp")
            await self.database.ad_analytics.create_index("event_type")
            await self.database.ad_analytics.create_index("slot_id")
            await self.database.ad_analytics.create_index([("timestamp", -1), ("event_type", 1)])
            
            # Rewarded popup config indexes
            await self.database.rewarded_popup_configs.create_index("category_id", unique=True)
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error("Failed to create database indexes", error=str(e))
            # Don't raise - indexes are performance optimization, not critical
    
    async def health_check(self) -> bool:
        """Check database health."""
        try:
            await self.client.admin.command('ping')
            return True
        except Exception as e:
            logger.error("Database health check failed", error=str(e))
            return False
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if self.database is None:
            raise RuntimeError("Database not connected")
        return self.database


# Global database manager instance
db_manager = DatabaseManager()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return db_manager.get_database()


async def startup_database():
    """Startup event for database connection."""
    await db_manager.connect()


async def shutdown_database():
    """Shutdown event for database disconnection."""
    await db_manager.disconnect()


# Migration functions
async def migrate_collection_names():
    """Migrate old collection names to new ones."""
    try:
        database = db_manager.get_database()
        
        # Check if old 'categories' collection exists
        collections = await database.list_collection_names()
        
        if 'categories' in collections and 'quiz_categories' not in collections:
            logger.info("Migrating 'categories' collection to 'quiz_categories'")
            
            # Copy data from old collection to new one
            async for document in database.categories.find():
                await database.quiz_categories.insert_one(document)
            
            # Drop old collection
            await database.categories.drop()
            
            logger.info("Collection migration completed successfully")
        
    except Exception as e:
        logger.error("Collection migration failed", error=str(e))
        # Don't raise - this is a migration, not critical for startup


async def ensure_admin_user():
    """Ensure at least one admin user exists for production."""
    try:
        database = db_manager.get_database()
        
        # Check if any admin users exist
        admin_count = await database.admin_users.count_documents({})
        
        if admin_count == 0 and settings.environment == "production":
            logger.warning("No admin users found in production environment")
            # In production, this should be handled by deployment scripts
            # Don't create default admin automatically for security
        
    except Exception as e:
        logger.error("Admin user check failed", error=str(e))
