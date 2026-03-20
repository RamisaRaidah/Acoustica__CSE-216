from db import execute_sql
import logging
import sys
from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    steam=sys.stdout
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

        artists.append({'artist_id': r['artist_id'], 'artist_name': r['name'], 'profile_picture_url': storage.generate_signed_url(profile_picture_url)})

    return artists, 200  

### Helper functions ###