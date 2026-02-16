"""
Test Supabase connection directly
This will show you the EXACT error
"""

import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

print("🔍 Testing Supabase Connection\n")

DATABASE_URL = os.environ.get("DATABASE_URL")

print(f"DATABASE_URL: {DATABASE_URL[:60]}...")
print("\nAttempting connection...\n")

try:
    connection = psycopg2.connect(DATABASE_URL)
    print("✅ CONNECTION SUCCESSFUL!")
    
    # Test a simple query
    cursor = connection.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"\nPostgreSQL version: {version[0]}")
    
    cursor.close()
    connection.close()
    
except psycopg2.OperationalError as e:
    print("❌ OPERATIONAL ERROR:")
    print(f"Error: {e}")
    print("\nCommon causes:")
    print("1. Wrong password")
    print("2. Database not accessible from your IP")
    print("3. SSL/TLS issue")
    print("4. Database paused/sleeping (Supabase free tier)")
    
except psycopg2.Error as e:
    print("❌ POSTGRESQL ERROR:")
    print(f"Error: {e}")
    
except Exception as e:
    print("❌ GENERAL ERROR:")
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()