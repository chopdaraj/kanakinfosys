import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    mongo_url = "mongodb://localhost:27017"
    db_name = "kanak_infosys"
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check users
    users = await db.users.find().to_list(None)
    print(f"Total users: {len(users)}")
    for u in users:
        print(f"User: {u.get('name')}, Role: {u.get('role')}, Serial: {u.get('serial_number')}, ClientID: {u.get('client_id')}, RefCode: {u.get('referral_code')}, KYC: {u.get('kyc_status')}")
        
    client.close()

if __name__ == "__main__":
    asyncio.run(check())
