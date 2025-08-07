"""
Timer-Based Questions Migration Script
Updates existing quiz categories with timer settings for 30-second countdown implementation.
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient

async def migrate_timer_settings():
    """Add timer settings to existing quiz categories."""
    
    # Connect to MongoDB using same pattern as other migration scripts
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[os.environ.get("DB_NAME", "test_database")]
    
    print("🚀 Starting Timer Settings Migration...")
    
    try:
        # Get all existing categories
        categories = await db.quiz_categories.find({}).to_list(1000)
        print(f"📊 Found {len(categories)} categories to update")
        
        updated_count = 0
        
        for category in categories:
            # Check if timer settings already exist
            if 'timer_enabled' not in category:
                # Add timer settings with default values
                timer_settings = {
                    'timer_enabled': True,  # Enable timer for all categories
                    'timer_seconds': 30,  # 30 seconds per question as requested
                    'show_timer_warning': True,  # Show warning when time is running low
                    'auto_advance_on_timeout': True,  # Auto-advance when timer expires
                    'show_correct_answer_on_timeout': True,  # Show correct answer on timeout
                }
                
                # Update the category document
                await db.quiz_categories.update_one(
                    {'id': category['id']},
                    {'$set': timer_settings}
                )
                
                updated_count += 1
                print(f"✅ Updated category: {category.get('name', 'Unknown')} with timer settings")
            else:
                print(f"⏭️ Category {category.get('name', 'Unknown')} already has timer settings")
        
        print(f"\n🎉 Timer Migration Complete!")
        print(f"📊 Updated {updated_count} categories with timer settings")
        print(f"⚙️ Timer Configuration:")
        print(f"   - Timer Duration: 30 seconds per question")
        print(f"   - Auto-advance on timeout: Enabled")
        print(f"   - Show correct answer on timeout: Enabled")
        print(f"   - Timer warning: Enabled")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False
    
    finally:
        client.close()
    
    return True


if __name__ == "__main__":
    asyncio.run(migrate_timer_settings())