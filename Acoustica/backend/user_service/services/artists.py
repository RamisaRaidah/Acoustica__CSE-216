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
    artists = []
    for r in result:
        if r['profile_picture']:
            profile_picture_url = r['profile_picture']
        else:
            profile_picture_url = "Images/Profile_Pictures/Default_pfp.png"

        artists.append({'artist_id': r['artist_id'], 'artist_name': r['artist_name'], 'profile_picture_url': storage.generate_signed_url(profile_picture_url)})

    return artists, 200  


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


### Helper functions ###