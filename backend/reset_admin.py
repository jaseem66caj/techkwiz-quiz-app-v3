#!/usr/bin/env python3
"""
Reset admin password script
"""
import asyncio
import os
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient

async def reset_admin_password():
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    # New password
    new_password = "TechKwiz2025!"
    
    # Hash the password
    password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Update or create admin user
    admin_data = {
        'username': 'admin',
        'email': 'jaseem@adops.in',
        'password_hash': password_hash,
        'is_active': True,
        'created_at': '2025-07-26T12:00:00',
        'last_login': None
    }
    
    # Upsert admin user
    result = await db.admin_users.update_one(
        {'username': 'admin'},
        {'$set': admin_data},
        upsert=True
    )
    
    if result.modified_count > 0 or result.upserted_id:
        print("✅ Admin password reset successfully!")
        print(f"Username: admin")
        print(f"Password: {new_password}")
        print(f"Email: jaseem@adops.in")
    else:
        print("❌ Failed to reset admin password")
    
    # Verify the user exists
    admin = await db.admin_users.find_one({'username': 'admin'})
    if admin:
        print(f"✅ Admin user verified in database")
        # Test password verification
        if bcrypt.checkpw(new_password.encode('utf-8'), admin['password_hash'].encode('utf-8')):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(reset_admin_password())