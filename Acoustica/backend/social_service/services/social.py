from db import execute_sql
import logging
import sys

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

def share_to_family(family_id, asset_id, user_id):
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
        SELECT 1 FROM asset 
        WHERE asset_id = %s
        AND asset_type IN ('song', 'album', 'playlist')
    """
    if not execute_sql(asset_check, (asset_id,), fetch_one=True):
        return {"error": "Asset not found or not a shareable type (must be song, album, or playlist)"}, 404

    sql = """
        INSERT INTO family_shared_content (sender_id, family_id, content_id, date_time)
        VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
    """
    execute_sql(sql, (user_id, family_id, asset_id))

    return {"message": "Content successfully shared to family."}, 200


def get_friend_shared_contents():
    return ("get_friend_shared_contents")

def remove_friend_shared_content(friend_share_id):
    return (f"remove_friend_shared_content {friend_share_id}")

def get_family_shared_contents(family_id, user_id):
    membership_check = """
        SELECT 1
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
    if not execute_sql(membership_check, (family_id, user_id, user_id), fetch_one=True):
        return {"error": "Family not found, subscription inactive, or user is not a member"}, 403

    sql = """
        SELECT
            fsc.family_shared_id,
            fsc.content_id,
            fsc.sender_id,
            fsc.date_time,
            a.asset_type,
            u.first_name || ' ' || u.last_name  AS sender_name,
            u.profile_picture                    AS sender_profile_picture,

            -- Title: resolved per asset type
            CASE a.asset_type
                WHEN 'song'     THEN s.title
                WHEN 'album'    THEN al.title
                WHEN 'playlist' THEN pl.title
            END AS content_title,

            -- Cover: resolved per asset type
            CASE a.asset_type
                WHEN 'song'     THEN al_s.cover_picture   -- song's album cover
                WHEN 'album'    THEN al.cover_picture
                WHEN 'playlist' THEN pl.cover_picture
            END AS cover_picture

        FROM family_shared_content fsc
        JOIN asset a  ON a.asset_id       = fsc.content_id
        JOIN users u  ON u.user_id        = fsc.sender_id

        -- Song joins
        LEFT JOIN song     s    ON a.asset_type = 'song'     AND s.asset_id  = a.asset_id
        LEFT JOIN album    al_s ON a.asset_type = 'song'     AND al_s.album_id = s.album_id

        -- Album join
        LEFT JOIN album    al   ON a.asset_type = 'album'    AND al.asset_id = a.asset_id

        -- Playlist join
        LEFT JOIN playlist pl   ON a.asset_type = 'playlist' AND pl.asset_id = a.asset_id

        WHERE fsc.family_id = %s
        ORDER BY fsc.date_time DESC
    """
    rows = execute_sql(sql, (family_id,), fetch_all=True)

    if not rows:
        return {"message": "No shared content found for this family.", "data": []}, 200

    contents = [
        {
            "family_shared_id": row[0],
            "content_id":        row[1],
            "sender_id":         row[2],
            "date_time":         row[3],
            "asset_type":        row[4],
            "sender_name":       row[5],
            "sender_profile_picture": row[6],
            "content_title":     row[7],
            "cover_picture":     row[8],
        }
        for row in rows
    ]

    return {"data": contents}, 200


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

### Helper functions ###