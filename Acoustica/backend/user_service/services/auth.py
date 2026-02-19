from psycopg2.extras import RealDictCursor
from db import execute_sql, get_db_connection
import logging
from db import execute_sql
import bcrypt
from flask_jwt_extended import create_access_token
import sys
import sqlparse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

###################################################### sign_up #################################################################
def sign_up(data):
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    user_type = data.get("user_type", "listener")

    if not email or not password:
        return {"error": "Email and password required"}, 400
    
    if user_type not in ["listener","artist"]:
        return {"error": "Invalid user type"},400
    
    check_sql = """SELECT user_id FROM public.users WHERE email=%s"""
    existing = execute_sql(check_sql, (email,), fetch_one=True)

    if existing:
        return {"error": "Email already exists"}, 409

    hashed_password = hash_password(password)

    connection=get_db_connection()
    if connection is None:
        return {"error":"Database connection failed"},500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    INSERT INTO asset (asset_type) VALUES (%s) RETURNING asset_id
                    """,("user",)
                )
                asset=cursor.fetchone()
                asset_id=asset["asset_id"]

                cursor.execute(
                    """
                    INSERT INTO users  (asset_id,email,password,first_name,last_name,user_type)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING user_id, user_type
                    """, (asset_id,email,hashed_password,first_name,last_name, user_type)
                )

                user=cursor.fetchone()
                user_id=user["user_id"]

                if user_type=="listener":
                    cursor.execute(
                        """
                        INSERT INTO listener (listener_id,listener_type)
                        VALUES (%s, %s)
                        """,(user_id,"free")
                    )
                elif user_type=="artist":
                    cursor.execute(
                        """
                        INSERT INTO artist (artist_id, stage_name, bank_account)
                        VALUES (%s, %s, %s)
                        """,(user_id,None, None)
                    )
            return {
                "message": "Sign up successful",
                "user_id":user_id,
                "user_type":user_type
            },201

    except Exception as e:
        print(f"Exception during sign-up for email {email}")
        connection.rollback()
        return {"error": "Sign-up failed"}, 500
    finally:
        connection.close()



########################################################## sign_in #########################################################
def sign_in(email, password):
    if not email or not password:
        return {"error": "Email and password required"}, 400

    sql = 'SELECT user_id, user_type, "password" FROM users WHERE email=%s'
    result = execute_sql(sql, (email,), fetch_all=True)
    if not result:
        return {"error": "Invalid credentials"}, 401

    user = result[0]
    if not check_password(password, user["password"]):
        return {"error": "Invalid credentials"}, 401

    access_token = create_access_token(
        identity=str(user["user_id"]), 
        additional_claims={"user_type": user["user_type"]}
    )
    return {"message": "Login successful", "token": access_token, "user_id": user["user_id"], "user_type": user["user_type"]}, 200

###################################################### sign_out #############################################################
def sign_out():
    return {"message": "Sign-out: delete token client-side"}, 200

###################################################### refresh ##############################################################
def refresh(user_identity):
    access_token = create_access_token(identity=user_identity)
    return {"message": "Token refreshed", "token": access_token}, 200



############################################## Helper functions ###############################################################

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))

