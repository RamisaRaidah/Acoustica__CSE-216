from psycopg2.extras import RealDictCursor
from db import execute_sql, get_db_connection
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)


################################################### get_me ##################################################################
def get_me(user_id):
    sql="""
    SELECT user_id, email, first_name, last_name, user_type
    FROM users
    WHERE user_id=%s
    """

    user=execute_sql(sql,(user_id,),fetch_one=True)
    if not user:
        return {"error": "User not found"}, 404

    return user, 200


######################################### Onboarding ##################################################################
def onboarding(user_id, user_type, data):

    connection = get_db_connection()
    if connection is None:
        return {"error": "Database connection failed"}, 500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:

                if user_type == "listener":
                    listener_type = data.get("listener_type", "free")

                    cursor.execute("""
                        UPDATE listener
                        SET listener_type = %s
                        WHERE listener_id = %s
                        RETURNING listener_id
                    """, (listener_type, user_id))

                elif user_type == "artist":
                    stage_name = data.get("stage_name")
                    bank_account = data.get("bank_account")

                    cursor.execute("""
                        UPDATE artist
                        SET stage_name = %s,
                            bank_account = %s
                        WHERE artist_id = %s
                        RETURNING artist_id
                    """, (stage_name, bank_account, user_id))

                updated = cursor.fetchone()

                if not updated:
                    return {"error": "Onboarding failed"}, 400

        return {"message": "Onboarding completed"}, 200

    except Exception as e:
        connection.rollback()
        return {"error": "Onboarding failed"}, 500

    finally:
        connection.close()



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

def set_app_mode():
    return ("set_app_mode")

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