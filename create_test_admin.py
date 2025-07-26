#!/usr/bin/env python3
"""
Create a test admin user for testing purposes
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import sys
sys.path.append('/app/backend')
from auth import hash_password
import uuid
from datetime import datetime

# Load environment variables
ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
database = client[os.environ['DB_NAME']]

async def create_test_admin():
    """Create a test admin user."""
    try:
        # Clear existing admin users
        await database.admin_users.delete_many({})
        print("Cleared existing admin users")

        # Create test admin
        admin_data = {
            "id": str(uuid.uuid4()),
            "username": "testadmin",
            "password_hash": hash_password("testpass123"),
            "created_at": datetime.utcnow(),
            "last_login": None
        }

        await database.admin_users.insert_one(admin_data)
        print(f"Created test admin user: {admin_data['username']}")
        print(f"Password: testpass123")

    except Exception as e:
        print(f"Error creating test admin: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_admin())