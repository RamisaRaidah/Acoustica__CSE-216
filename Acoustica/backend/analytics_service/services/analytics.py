from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

### search_song ###

def search_song(seed):
    seed = seed.lower().replace(" ", "")
    param = (f"%{seed}%",)

    songs_query = """
        SELECT song_id, s.album_id, s.title, a.title album_name, stage_name artist_name, length
        FROM song s JOIN album a ON (s.album_id = a.album_id) JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE LOWER(REPLACE(s.title, ' ', '')) LIKE %s
        LIMIT 5
    """

    songs = execute_sql(songs_query, param, fetch_all = True) or []

    return {"songs": songs}, 200

### search_album ###

def search_album(seed):
    seed = seed.lower().replace(" ", "")
    param = (f"%{seed}%",)

    albums_query = """
        SELECT album_id, title, stage_name artist_name
        FROM album a JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE LOWER(REPLACE(title, ' ', '')) LIKE %s
        LIMIT 5
    """

    albums = execute_sql(albums_query, param, fetch_all = True) or []

    return {"albums": albums}, 200

### search_artist ###

def search_artist(seed):
    seed = seed.lower().replace(" ", "")
    param = (f"%{seed}%",)

    artists_query = """
        SELECT artist_id, stage_name artist_name
        FROM artist a JOIN users u ON (a.artist_id = u.user_id)
        WHERE LOWER(REPLACE(stage_name, ' ', '')) LIKE %s
        LIMIT 5
    """

    artists = execute_sql(artists_query, param, fetch_all = True) or []

    return {"artists": artists}, 200

def recommend_song():
    return ("recommend_song")

def generate_mix():
    return ("generate_mix")

def generate_playlist():
    return ("generate_playlist")

def recommend_collaborators(artist_id):
    return (f"recommend_collaborators {artist_id}")

def view_audience_overlap(artist_id):
    return (f"view_audience_overlap {artist_id}")

def get_listener_analytics(listener_id):
    return (f"get_listener_analytics {listener_id}")

def get_artist_analytics(artist_id):
    return (f"get_artist_analytics {artist_id}")

def get_artist_sales_stats(artist_id):
    return (f"get_artist_sales_stats {artist_id}")

def get_family_analytics(family_id):
    return (f"get_family_analytics {family_id}")

def get_countries():
    result = execute_sql(
        "SELECT country_id, country_name FROM country ORDER BY country_name",
        fetch_all=True
    )
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500

def get_languages():
    result = execute_sql(
        "SELECT language_id, language_name FROM language ORDER BY language_name",
        fetch_all=True
    )
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500

def get_genres():
    result = execute_sql(
        "SELECT genre_id, genre_name FROM genre ORDER BY genre_name",
        fetch_all=True
    )
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500

def get_moods():
    result = execute_sql(
        "SELECT mood_id, mood_name FROM mood ORDER BY mood_name",
        fetch_all=True
    )
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500

def get_instruments():
    result = execute_sql(
        "SELECT instrument_id, instrument_name FROM instrument ORDER BY instrument_name",
        fetch_all=True
    )
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500
    
### Helper functions ###