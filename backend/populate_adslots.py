import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from techkwiz_adslots import TECHKWIZ_AD_SLOTS

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
database = client[os.environ["DB_NAME"]]


async def populate_ad_slots():
    """Populate database with techkwiz.com ad slot structure."""
    try:
        # Clear existing ad slots
        await database.ad_slots.delete_many({})
        print("Cleared existing ad slots")

        # Insert all techkwiz ad slots
        if TECHKWIZ_AD_SLOTS:
            await database.ad_slots.insert_many(TECHKWIZ_AD_SLOTS)
            print(
                f"Inserted {len(TECHKWIZ_AD_SLOTS)} ad slots matching techkwiz.com structure"
            )

        print("Ad slots population completed successfully!")

    except Exception as e:
        print(f"Error during ad slots population: {e}")


if __name__ == "__main__":
    asyncio.run(populate_ad_slots())