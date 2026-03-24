import os
from flask import request
from psycopg2.extras import RealDictCursor
from storage_service.services import storage
from db import execute_sql, get_db_connection, connection_pool,release_connection
import logging
from db import execute_sql
import bcrypt
from flask_jwt_extended import create_access_token
import sys
import sqlparse


from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

UPLOAD_FOLDER = "uploads/profile_pictures"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

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
        return {"error": "Please provide both email and password"}, 400
    
    if user_type not in ["listener","artist"]:
        return {"error": "Please select either Listener or Artist"},400
    
    check_sql = """SELECT user_id FROM public.users WHERE email=%s"""
    existing = execute_sql(check_sql, (email,), fetch_one=True)

    if existing:
        return {"error": "This email is already registered. Try signing in instead"}, 409

    hashed_password = hash_password(password)

    connection=get_db_connection()
    if connection is None:
        return {"error":"Database connection failed"},500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (email,password,first_name,last_name,user_type)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING user_id, user_type
                    """, (email,hashed_password,first_name,last_name,user_type)
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
                connection.commit()
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
        release_connection(connection)



########################################################## sign_in #########################################################
def sign_in(email, password):
    if not email or not password:
        return {"error": "Email and password required"}, 400

    sql = 'SELECT user_id, user_type, "password", theme, onboarding_done FROM users WHERE email=%s'
    result = execute_sql(sql, (email,), fetch_all=True)
    if not result:
        return {"error": "No account found with this email"}, 401

    user = result[0]
    if not check_password(password, user["password"]):
        return {"error": "Invalid email or password"}, 401
    
    listener_type = None
    if user["user_type"] == "listener":
        listener = execute_sql(
            "SELECT listener_type FROM listener WHERE listener_id=%s",
            (user["user_id"],), fetch_one=True
        )
        if listener:
            listener_type = listener["listener_type"]

    access_token = create_access_token(
        identity=str(user["user_id"]), 
        additional_claims=  {   
                                "user_type": user["user_type"],
                                "onboarding_done": user["onboarding_done"]
                            }
    )
    return  {
                "message": "Login successful", 
                "token": access_token, 
                "user_id": user["user_id"], 
                "user_type": user["user_type"],
                "theme": user["theme"],
                "onboarding_done": user["onboarding_done"],
                "listener_type": listener_type
            },  200

###################################################### sign_out #############################################################
def sign_out():
    return {"message": "Sign-out: delete token client-side"}, 200

###################################################### refresh ##############################################################
def refresh(user_identity):
    access_token = create_access_token(identity=user_identity)
    return {"message": "Token refreshed", "token": access_token}, 200


def update_account(user_id, user_type, data):
    bio          = request.form.get("bio")
    country_id   = request.form.get("country_id")
    language_id  = request.form.get("language_id")
    phone_number = request.form.get("phone_number")
    gender       = request.form.get("gender")
    date_of_birth = request.form.get("date_of_birth")

    pfp = request.files.get("pfp")

    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}, 500

    new_pfp_path = None

    try:
       
        if pfp:
            pfp_ext = storage.get_file_extension(pfp)
            new_pfp_path = f"Images/Profile_Pictures/pfp{user_id}.{pfp_ext}"
            success = storage.upload_file_to_storage(
                pfp.stream,
                new_pfp_path,
                pfp.mimetype
            )
            if not success:
                raise Exception("Profile picture upload failed")

        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:

               
                cursor.execute(
                    "SELECT profile_picture FROM users WHERE user_id = %s",
                    (user_id,)
                )
                existing = cursor.fetchone()
                old_pfp_path = existing["profile_picture"] if existing else None

                fields = {
                    "bio":           bio,
                    "country_id":    country_id,
                    "language_id":   language_id,
                    "phone_number":  phone_number,
                    "gender":        gender,
                    "date_of_birth": date_of_birth,
                }
                if new_pfp_path:
                    fields["profile_picture"] = new_pfp_path

                fields = {k: v for k, v in fields.items() if v is not None}

                if fields:
                    set_clause = ", ".join(f"{col} = %s" for col in fields)
                    values = list(fields.values()) + [user_id]
                    cursor.execute(
                        f"UPDATE users SET {set_clause} WHERE user_id = %s RETURNING user_id",
                        values
                    )
                    if not cursor.fetchone():
                        raise Exception("User update failed")

             
                if user_type == "artist":
                    artist_fields = {
                        "stage_name":   data.get("stage_name"),
                        "bank_account": data.get("bank_account"),
                    }
                    artist_fields = {k: v for k, v in artist_fields.items() if v is not None}

                    if artist_fields:
                        set_clause = ", ".join(f"{col} = %s" for col in artist_fields)
                        values = list(artist_fields.values()) + [user_id]
                        cursor.execute(
                            f"UPDATE artist SET {set_clause} WHERE artist_id = %s",
                            values
                        )


        if new_pfp_path and old_pfp_path and "Default_pfp" not in old_pfp_path:
            storage.delete_file_from_storage(old_pfp_path)

        return {"message": "Account updated successfully"}, 200

    except Exception as e:
        if new_pfp_path:
            storage.delete_file_from_storage(new_pfp_path)
        logging.error(f"Update account failed for user {user_id}: {e}")
        return {"error": "Account update failed"}, 500

    finally:
        release_connection(connection)

############################################## Helper functions ###############################################################

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))