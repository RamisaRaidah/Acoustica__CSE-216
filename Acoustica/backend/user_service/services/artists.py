from db import execute_sql
import logging
import sys
from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def get_dashboard():
    return ("get_dashboard")

def get_profile():
    return ("get_profile")

### get_artists ###
def get_artists():
    command = """
        SELECT artist_id, stage_name artist_name, profile_picture
        FROM artist a JOIN users u ON (a.artist_id = u.user_id) 
    """

    result = execute_sql(command, fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        for r in result:
            if r['profile_picture']:
                signed_url = storage.generate_signed_url(r['profile_picture'])
                if signed_url:
                    r['profile_picture'] = signed_url
                else:
                    r['profile_picture'] = "null"
            else:
                r['profile_picture'] = "null"

        return result, 200  


def get_artist_info(artist_id, viewer_id=None):
    profile_sql = """
        SELECT 
            a.artist_id,
            u.first_name,
            u.last_name,
            a.stage_name,
            u.bio,
            u.profile_picture,
            COUNT(DISTINCT fa.listener_id) as follower_count,
            COUNT(DISTINCT sa.song_id) as song_count
        FROM artist a
        JOIN users u ON u.user_id = a.artist_id
        LEFT JOIN followed_artist fa ON fa.artist_id = a.artist_id
        LEFT JOIN song_artist sa ON sa.artist_id = a.artist_id
        WHERE a.artist_id = %s
        GROUP BY a.artist_id, u.first_name, u.last_name, a.stage_name, u.bio, u.profile_picture
    """
    profile = execute_sql(profile_sql, (artist_id,), fetch_one=True)
    if not profile:
        return {"error": "Artist not found"}, 404

    profile = dict(profile)
    profile["profile_picture_url"] = storage.generate_signed_url(
        profile["profile_picture"] if profile["profile_picture"] else "Images/Profile_Pictures/Default_pfp.png"
    )
    del profile["profile_picture"]

    monthly_sql = """
        SELECT COUNT(DISTINCT ssh.listener_id) as monthly_listeners
        FROM song_stream_history ssh
        JOIN song s ON s.song_id = ssh.song_id
        JOIN song_artist sa ON sa.song_id = s.song_id
        WHERE sa.artist_id = %s
        AND ssh.date_time >= NOW() - INTERVAL '30 days'
    """
    monthly = execute_sql(monthly_sql, (artist_id,), fetch_one=True)
    profile["monthly_listeners"] = monthly["monthly_listeners"] if monthly else 0

    profile["is_following"] = False
    if viewer_id:
        follow_check = execute_sql(
            "SELECT 1 FROM followed_artist WHERE listener_id = %s AND artist_id = %s",
            (viewer_id, artist_id), fetch_one=True
        )
        profile["is_following"] = follow_check is not None

    return profile, 200

### get_artist_song_metadata ###
def get_artist_song_metadata(artist_id):
    command = """
        SELECT song_id
        FROM song s JOIN album a ON (s.album_id = a.album_id)
        WHERE a.owner_id = %s
    """

    result = execute_sql(command, (artist_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        song_ids = []
        for r in result:
            song_ids.append(r['song_id'])

        return song_ids, 200


### Helper functions ###