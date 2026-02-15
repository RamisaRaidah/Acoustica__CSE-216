from db import execute_sql
import logging
from db import execute_sql
import bcrypt
from flask_jwt_extended import create_access_token


logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))



def sign_up(data):
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    user_type = data.get("user_type", "listener")

    if not email or not password:
        return {"error": "Email and password required"}, 400
    
    check_sql = "SELECT user_id FROM users WHERE email=%s"
    existing = execute_sql(check_sql, (email,), fetch_all=True)

    if existing:
        return {"error": "Email already exists"}, 409

    hashed_password = hash_password(password)

    sql="""
        INSERT INTO users (email, "password", first_name, last_name, user_type)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING user_id, user_type
    """

    try:
        result = execute_sql(sql, (email, hashed_password, first_name, last_name, user_type), fetch_all=True)
        if not result:
            logging.error(f"Sign-up failed for email: {email}")
            return {"error": "Signup failed"}, 400

        return {"message": "Signup successful", "user_id": result[0]["user_id"], "user_type": result[0]["user_type"]}, 201

    except Exception as e:
        logging.error(f"Exception during sign-up for email {email}: {e}", exc_info=True)
        return {"error": "An unexpected error occurred"}, 500

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

    access_token = create_access_token(identity={"user_id": user["user_id"], "user_type": user["user_type"]})
    return {"message": "Login successful", "token": access_token, "user_id": user["user_id"], "user_type": user["user_type"]}, 200


def sign_out():
    return {"message": "Sign-out: delete token client-side"}, 200

def refresh(user_identity):
    access_token = create_access_token(identity=user_identity)
    return {"message": "Token refreshed", "token": access_token}, 200

### Helper functions ###

