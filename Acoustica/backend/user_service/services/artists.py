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
        SELECT artist_id, (first_name || ' ' || last_name) name, profile_picture
        FROM artist a JOIN users u ON (a.artist_id = u.user_id) 
    """

    result = execute_sql(command, fetch_all = True)
    artists = []
    for r in result:
        artists.append({'artist_id': r['artist_id'], 'artist_name': r['name'], 'profile_picture_url': storage.generate_signed_url(r['profile_picture'])})

    return artists, 200  

### Helper functions ###