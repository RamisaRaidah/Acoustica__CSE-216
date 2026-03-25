from flask import request
from psycopg2.extras import RealDictCursor
from user_service.services.auth import check_password, hash_password
from db import execute_sql, get_db_connection, connection_pool, release_connection
import logging
import sys
from flask_jwt_extended import get_jwt_identity
import secrets
from datetime import datetime, timedelta
import os
from utils.email_service import send_password_reset_email
from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)


################################################### get_my_profile #########################################################
def get_my_profile(user_id, user_type):
    logging.info('To the helper func for profile')
    sql = """
        SELECT 
            u.user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone_number,
            u.gender,
            u.date_of_birth,
            u.bio,
            u.theme,
            u.profile_picture,
            u.user_type,
            c.country_name,
            l.language_name
        FROM users u
        LEFT JOIN country c ON u.country_id = c.country_id
        LEFT JOIN language l ON u.language_id = l.language_id
        WHERE u.user_id = %s
    """
    user = execute_sql(sql, (user_id,), fetch_one=True)

    if not user:
        return {"error": "User not found"}, 404

    user = dict(user)

    if user.get("profile_picture"):
        user["profile_picture"] = storage.generate_signed_url(user["profile_picture"], expires_in=3600)
    else:
        user["profile_picture"] = storage.generate_signed_url(
            "Images/Profile_Pictures/Default_pfp.png",
            expires_in=3600
        )


    if user_type == "listener":
        sql = """
            SELECT listener_type FROM listener WHERE listener_id = %s
        """
        l_type = execute_sql(sql, (user_id,), fetch_one=True)
        if l_type:
            user["listener_type"] =l_type["listener_type"]
            logging.info(f'type for listener: {l_type["listener_type"]}')

    elif user_type == "artist":
        sql = """
            SELECT stage_name, bank_account FROM artist WHERE artist_id = %s
        """
        role = execute_sql(sql, (user_id,), fetch_one=True)
        if role:
            user["stage_name"] = role["stage_name"]
            user["bank_account"] = role["bank_account"]

    return user, 200

######################################### Onboarding ##################################################################
def onboarding(user_id, user_type, data):
    logging.info('Hello dears')
    bio = request.form.get("bio")
    country_id = request.form.get("country_id")
    language_id = request.form.get("language_id")
    phone_number = request.form.get("phone_number")
    gender = request.form.get("gender")
    date_of_birth = request.form.get("date_of_birth")  ##iso format: 2025-02-19
    theme = request.form.get("theme", "light")

    logging.info(f'Theme: {theme}')

    pfp = request.files.get("pfp")

    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}, 500


    pfp_path=None

    try:
        if pfp:
            logging.info('On your way to the sky')
            pfp_ext=storage.get_file_extension(pfp)
            pfp_path=f"Images/Profile_Pictures/pfp{user_id}.{pfp_ext}"
            success=storage.upload_file_to_storage(
                pfp.stream,
                pfp_path,
                pfp.mimetype
            )
            if not success:
                raise Exception()
        else:
            logging.info("Pfp is now default pfp")
            
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                        UPDATE users
                        SET bio=%s,
                            country_id=%s,
                            language_id=%s,
                            phone_number=%s,
                            gender=%s,
                            date_of_birth=%s,
                            theme=%s,
                            profile_picture=%s,
                            onboarding_done=TRUE
                        WHERE user_id=%s
                        RETURNING user_id
                    """,(bio,country_id,language_id,phone_number,gender,date_of_birth,theme,pfp_path,user_id)
                )

                
                user_updated=cursor.fetchone()
                
                if not user_updated:
                    raise Exception("User update failed")

                if user_type=="listener":
                    listener_type=data.get("listener_type","free")

                    cursor.execute(
                        """
                            UPDATE listener
                            SET listener_type=%s
                            WHERE listener_id=%s
                            RETURNING listener_id
                        """,(listener_type,user_id)
                    )
                elif user_type=="artist":
                    stage_name=data.get("stage_name")
                    bank_account=data.get("bank_account")

                    cursor.execute(
                        """
                            UPDATE artist
                            SET stage_name=%s,
                                bank_account=%s
                            WHERE artist_id=%s
                            RETURNING artist_id
                        """,(stage_name, bank_account, user_id)
                    )
                
                role_updated = cursor.fetchone()

                if not role_updated:
                    raise Exception("Role update failed")
                
        return {"message": "Onboarding completed"}, 200
    
    except ValueError as e:
        logging.info('Ooops 1')
        if pfp and pfp_path:
            storage.delete_file_from_storage(pfp_path)
        return {"error": str(e)}, 400
    
    except Exception as e:
        logging.info('Ooops 2')
        if pfp and pfp_path:
            storage.delete_file_from_storage(pfp_path)
        logging.error(f"Onboarding failed: {e}")
        return {"error": "Onboarding failed"}, 500

    finally:
        release_connection(connection)


######################################### get_profile_picture ##################################################
def get_my_profile_picture(user_id):
    sql = """
        SELECT profile_picture
        FROM users
        WHERE user_id = %s
    """
    user = execute_sql(sql, (user_id,), fetch_one=True)

    if not user:
        return {"error": "User not found"}, 404

    if user.get("profile_picture"):
        url = storage.generate_signed_url(user["profile_picture"], expires_in=3600)
    else:
        url = storage.generate_signed_url(
            "Images/Profile_Pictures/Default_pfp.png",
            expires_in=3600
        )

    return {"profile_picture": url}, 200

### get_profile_picture ### 
def get_profile_picture(user_id):
    command = "SELECT profile_picture FROM users WHERE user_id = %s"
    result = execute_sql(command, (user_id,), fetch_one = True)
    if result:
        if result['profile_picture']:
            return {'profile_picture': storage.generate_signed_url(result['profile_picture'])}, 200
        else:
            return {'profile_picture': "null"}, 200
    else:
        return {'error': 'failed'}, 409

def update_account(user_id, user_type, data):
    bio = request.form.get("bio")
    country_id = request.form.get("country_id")
    language_id = request.form.get("language_id")
    phone_number = request.form.get("phone_number")
    gender = request.form.get("gender")
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
                    "bio": bio,
                    "country_id": country_id,
                    "language_id": language_id,
                    "phone_number": phone_number,
                    "gender": gender,
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


def delete_account(user_id):
    check_sql="""
                SELECT asset_id
                FROM users
                WHERE user_id=%s
                """
    res=execute_sql(check_sql,(user_id,),fetch_one=True)
    if not res:
        return {"error": "User not found"}, 404
    
    asset_id=res["asset_id"]

    delete_sql="""
                    DELETE FROM asset
                    WHERE asset_id=%s
                """
    resFinal=execute_sql(delete_sql,(asset_id,))

    if resFinal is False:
            return {"error": "Failed to delete account"}, 500

    return {"message": "Account deleted successfully"}, 200
    
def get_user_list():
    return ("get_user_list")

def get_user_account(user_id):
    return (f"get_user_account {user_id}")

def get_user_profile(user_id):
    return (f"get_user_profile {user_id}")

### set_theme ###
def set_theme(theme):
    command = """
        UPDATE users
        SET theme = %s
        WHERE user_id = %s
    """
    execute_sql(command, (theme, get_jwt_identity(),))
    return {"message": "theme set"}, 200 

def set_play_mode():
    return ("set_play_mode")

def add_badge():
    return ("add_badge")

def get_badges():
    return ("get_badges")

def add_user_badge(user_id):
    return (f"add_user_badge {user_id}")

def get_user_badges(user_id):
    return (f"get_user_badges {user_id}")

def change_password(user_id, data):
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return {"error": "Both current and new password are required"}, 400

    if current_password == new_password:
        return {"error": "New password must be different from current password"}, 400

    sql = 'SELECT "password" FROM users WHERE user_id = %s'
    result = execute_sql(sql, (user_id,), fetch_one=True)

    if not result:
        return {"error": "User not found"}, 404

    if not check_password(current_password, result["password"]):
        return {"error": "Current password is incorrect"}, 401

    new_hashed = hash_password(new_password)

    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}, 500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    """
                    UPDATE users
                    SET password = %s
                    WHERE user_id = %s
                    RETURNING user_id
                    """,
                    (new_hashed, user_id)
                )
                if not cursor.fetchone():
                    raise Exception("Password update failed")

        return {"message": "Password changed successfully"}, 200

    except Exception as e:
        logging.error(f"Change password failed for user {user_id}: {e}")
        return {"error": "Password change failed"}, 500

    finally:
        release_connection(connection)

def forgot_password(data):
    email = data.get("email")
    if not email:
        return {"error": "Email is required"}, 400

    sql = 'SELECT user_id FROM users WHERE email = %s'
    result = execute_sql(sql, (email,), fetch_one=True)

    """
        security through obscurity
        If any attacker wants to do it, we still send them ok, even in case the email was not sent.
        So our poor, honest users might be misled ocassionally, but that is a cost we must all pay for the sake of security!!
    """
    if not result:
        return {"message": "If that email exists, a reset link has been sent. Check spam if needed."}, 200

    user_id = result["user_id"]
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    insert_sql = """
        INSERT INTO password_reset_tokens (token, user_id, expires_at)
        VALUES (%s, %s, %s)
    """
    execute_sql(insert_sql, (token, user_id, expires_at))

    reset_link = f"http://localhost:8081/reset-password?token={token}"

    send_password_reset_email(email, reset_link)

    return {"message": "If that email exists, a reset link has been sent. Check spam if needed."}, 200


def reset_password(data):
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return {"error": "Token and new password are required"}, 400

    sql = """
        SELECT user_id, expires_at, used
        FROM password_reset_tokens
        WHERE token = %s
    """
    result = execute_sql(sql, (token,), fetch_one=True)

    if not result:
        return {"error": "Invalid or expired token"}, 400

    if result["used"]:
        return {"error": "Token has already been used"}, 400

    if datetime.utcnow() > result["expires_at"]:
        return {"error": "Token has expired"}, 400

    new_hashed = hash_password(new_password)
    user_id = result["user_id"]

    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}, 500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "UPDATE users SET password = %s WHERE user_id = %s",
                    (new_hashed, user_id)
                )
                cursor.execute(
                    "UPDATE password_reset_tokens SET used = TRUE WHERE token = %s",
                    (token,)
                )
        return {"message": "Password reset successfully."}, 200

    except Exception as e:
        logging.error(f"Reset password failed: {e}")
        return {"error": "Password reset failed"}, 500

    finally:
        release_connection(connection)

### Helper functions ###
