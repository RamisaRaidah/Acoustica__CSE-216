from flask import request
from psycopg2.extras import RealDictCursor
from db import execute_sql, get_db_connection, connection_pool, release_connection
import logging
import sys
from flask_jwt_extended import get_jwt_identity

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
    
    del user["profile_picture"]

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
    
    logging.info('Oh cool, cool')

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
def get_profile_picture(user_id):
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

    return {"profile_picture_url": url}, 200


def update_account():
    return ("update_account")

def delete_account():
    return ("delete_account")

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

def add_notification(user_id):
    return (f"add_notification {user_id}")

def get_notifications():
    return ("get_notifications")

def add_badge():
    return ("add_badge")

def get_badges():
    return ("get_badges")

def add_user_badge(user_id):
    return (f"add_user_badge {user_id}")

def get_user_badges(user_id):
    return (f"get_user_badges {user_id}")

### Helper functions ###