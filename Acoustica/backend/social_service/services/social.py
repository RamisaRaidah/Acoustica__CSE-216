from storage_service.services import storage
from db import execute_sql
import logging
import sys
from user_service.services.notifications import create_notification

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def send_friend_request(user_id):
    return (f"send_friend_request {user_id}")

def get_friend_requests():
    return ("get_friend_requests")

def handle_friend_request(request_id):
    return (f"handle_friend_request {request_id}")

def get_friends():
    return ("get_friends")

def remove_friend(friend_id):
    return (f"remove_friend {friend_id}")

def create_family():
    return ("create_family")

def get_family_details(family_id):
    return (f"get_family_details {family_id}")    

def delete_family(family_id):
    return (f"delete_family {family_id}")

def add_family_member(family_id, member_id):
    return (f"add_family_member {family_id} {member_id}")

def remove_family_member(family_id, member_id):
    return (f"remove_family_member {family_id} {member_id}")

def share_to_friend(friend_id):
    return (f"share_to_friend {friend_id}")

def share_to_family(family_id, asset_id, user_id, note=None):
    if note and len(note) > 80:
        return {"error": "Note exceeds 80 character limit"}, 400
    
    membership_check = """
        SELECT f.parent_account_id
        FROM family f
        JOIN plan_subscription s ON s.subscription_id = f.subscription_id
        WHERE f.family_id = %s
          AND s.end_date >= CURRENT_DATE
          AND s.is_active = TRUE
          AND (
              f.parent_account_id = %s
              OR EXISTS (
                  SELECT 1 FROM family_member fm
                  WHERE fm.family_id = f.family_id
                    AND fm.member_id = %s
              )
          )
    """
    family = execute_sql(membership_check, (family_id, user_id, user_id), fetch_one=True)

    if not family:
        return {"error": "Family not found, subscription inactive, or user is not a member"}, 403

    asset_check = """
        SELECT asset_type FROM asset 
        WHERE asset_id = %s
        AND asset_type IN ('song', 'album', 'playlist')
    """
    asset = execute_sql(asset_check, (asset_id,), fetch_one=True)
    if not asset:
        return {"error": "Asset not found or not a shareable type (must be song, album, or playlist)"}, 404

    sql = """
        INSERT INTO family_shared_content (sender_id, family_id, content_id, note, date_time)
        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
    """
    execute_sql(sql, (user_id, family_id, asset_id, note))

    create_notification(user_id, 'Your content has been shared to family!')


    members = execute_sql(
        """
        SELECT member_id FROM family_member
        WHERE family_id = %s AND member_id != %s
        """,
        (family_id, user_id), fetch_all=True
    )

    logging.info(f"Member number: {len(members)}")
    

    sender = execute_sql(
        "SELECT first_name, last_name FROM users WHERE user_id = %s",
        (user_id,), fetch_one=True
    )
    sender_name = f"{sender['first_name']} {sender['last_name']}" if sender else "A family member"

    if members:
        asset_type = asset["asset_type"]
        for member in members:
            id=member["member_id"]
            logging.info(f"Sending notifications to {id}")
            create_notification(
                member["member_id"],
                f"{sender_name} shared a {asset_type} with your family!"
            )

    return {"message": "Content successfully shared to family."}, 200

def get_friend_shared_contents():
    return ("get_friend_shared_contents")

def remove_friend_shared_content(friend_share_id):
    return (f"remove_friend_shared_content {friend_share_id}")

def get_family_shared_contents(family_id, user_id):
    membership_check = """
        SELECT f.family_name
        FROM family f
        JOIN plan_subscription s ON s.subscription_id = f.subscription_id
        WHERE f.family_id = %s
          AND s.end_date >= CURRENT_DATE
          AND s.is_active = TRUE
          AND (
              f.parent_account_id = %s
              OR EXISTS (
                  SELECT 1 FROM family_member fm
                  WHERE fm.family_id = f.family_id
                    AND fm.member_id = %s
              )
          )
    """

    family_name=execute_sql(membership_check, (family_id, user_id, user_id), fetch_one=True)
    if not family_name:
        return {"error": "Family not found, subscription inactive, or user is not a member"}, 403

    sql = """
        SELECT
            fsc.family_shared_id,
            fsc.content_id,
            fsc.sender_id,
            fsc.date_time,
            a.asset_type,
            u.first_name || ' ' || u.last_name  AS sender_name,
            u.profile_picture AS sender_profile_picture,
            COALESCE(artist.first_name || ' ' || artist.last_name, 'Unknown') AS artist_name,

            CASE a.asset_type
                WHEN 'song'     THEN s.title
                WHEN 'album'    THEN al.title
                WHEN 'playlist' THEN pl.title
            END AS content_title,

            CASE a.asset_type
                WHEN 'song'     THEN al_s.cover_picture   -- song's album cover
                WHEN 'album'    THEN al.cover_picture
                WHEN 'playlist' THEN pl.cover_picture
            END AS cover_picture,

            fsc.note,

            CASE a.asset_type
                WHEN 'song'     THEN s.song_id
                WHEN 'album'    THEN al.album_id
                WHEN 'playlist' THEN pl.playlist_id
            END AS typed_id

        FROM family_shared_content fsc
        JOIN asset a  ON a.asset_id       = fsc.content_id
        JOIN users u  ON u.user_id        = fsc.sender_id

        LEFT JOIN song     s    ON a.asset_type = 'song'     AND s.asset_id  = a.asset_id
        LEFT JOIN album    al_s ON a.asset_type = 'song'     AND al_s.album_id = s.album_id

        LEFT JOIN album    al   ON a.asset_type = 'album'    AND al.asset_id = a.asset_id

        LEFT JOIN playlist pl   ON a.asset_type = 'playlist' AND pl.asset_id = a.asset_id

        LEFT JOIN users artist 
                ON artist.user_id = 
                    CASE a.asset_type
                        WHEN 'song' THEN al_s.owner_id
                        WHEN 'album' THEN al.owner_id
                        WHEN 'playlist' THEN pl.creator_id
                    END

        WHERE fsc.family_id = %s
        ORDER BY fsc.date_time DESC
    """
    rows = execute_sql(sql, (family_id,), fetch_all=True)

    if not rows:
        return {
                    "family_name": family_name["family_name"], 
                    "message": "No shared content found for this family.", "data": []
                }, 200

    contents = []
    for row in rows:

        contents.append({
            "family_shared_id": row["family_shared_id"],
            "content_id":       row["content_id"],
            "sender_id":        row["sender_id"],
            "date_time":        row["date_time"],
            "asset_type":       row["asset_type"],
            "sender_name":      row["sender_name"],
            "sender_profile_picture": storage.generate_signed_url(row["sender_profile_picture"]) if row["sender_profile_picture"] else None,
            "content_title":    row["content_title"],
            "cover_picture":    storage.generate_signed_url(row["cover_picture"]) if row["cover_picture"] else None,
            "note":             row["note"],
            "typed_id":         row["typed_id"],
            "artist_name": row["artist_name"]
        })

    return {    
                "family_name": family_name["family_name"],
                "data": contents
            }, 200


def remove_family_shared_content(family_id, family_shared_id, user_id):
    check = """
        SELECT 1 FROM family_shared_content
        WHERE family_shared_id = %s
          AND family_id = %s
          AND sender_id = %s
    """
    if not execute_sql(check, (family_shared_id, family_id, user_id), fetch_one=True):
        return {"error": "Share not found or you are not the sender"}, 403

    sql = """
        DELETE FROM family_shared_content
        WHERE family_shared_id = %s
    """
    execute_sql(sql, (family_shared_id,))

    return {"message": "Shared content removed successfully."}, 200


def get_user_family(user_id):
    """
    Returns the single family the user belongs to (as parent or member),
    paired with an active subscription.
    """
    sql = """
        SELECT
            f.family_id,
            f.family_name
        FROM family f
        JOIN plan_subscription s ON s.subscription_id = f.subscription_id
        WHERE s.end_date >= CURRENT_DATE
          AND s.is_active = TRUE
          AND (
              f.parent_account_id = %s
              OR EXISTS (
                  SELECT 1 FROM family_member fm
                  WHERE fm.family_id = f.family_id
                    AND fm.member_id = %s
              )
          )
        LIMIT 1
    """
    row = execute_sql(sql, (user_id, user_id), fetch_one=True)
    if not row:
        return {"error": "No active family found for this user"}, 404

    return {"family_id": row["family_id"], "family_name": row["family_name"]}, 200


### Helper functions ###