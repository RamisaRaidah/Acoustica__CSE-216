from storage_service.services import storage
from db import execute_sql
import logging
import sys

from flask_jwt_extended import get_jwt_identity

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
        SELECT song_id, s.album_id, s.title, a.title album_name, ar.artist_id owner_id, ar.stage_name owner_name, s.length
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
        SELECT album_id, title, stage_name owner_name
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

### get_countries ###
def get_countries():
    result = execute_sql(
        "SELECT country_id, country_name FROM country ORDER BY country_name",
        fetch_all=True
    )

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_languages ###
def get_languages():
    result = execute_sql(
        "SELECT language_id, language_name FROM language ORDER BY language_name",
        fetch_all=True
    )
    
    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_genres ###
def get_genres():
    result = execute_sql(
        "SELECT genre_id, genre_name FROM genre ORDER BY genre_name",
        fetch_all=True
    )
    
    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_moods ###
def get_moods():
    result = execute_sql(
        "SELECT mood_id, mood_name FROM mood ORDER BY mood_name",
        fetch_all=True
    )
    
    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_instruments ###
def get_instruments():
    result = execute_sql(
        "SELECT instrument_id, instrument_name FROM instrument ORDER BY instrument_name",
        fetch_all=True
    )
    
    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_trending_songs ###
def get_trending_songs():
    result = execute_sql("SELECT * FROM fn_get_trending_songs(10, NULL, NULL, NULL, NULL)", fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_popular_songs ###
def get_popular_songs():
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, NULL, NULL, NULL)", fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_recommended_songs ###
def get_recommended_songs():
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, NULL, NULL, NULL)", (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_trending_artists ###
def get_trending_artists():
    command = """
        SELECT artist_id, stage_name artist_name, profile_picture
        FROM artist a JOIN users u ON (a.artist_id = u.user_id) 
        LIMIT 8
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

### get_popular_artists ###
def get_popular_artists():
    command = """
        SELECT artist_id, stage_name artist_name, profile_picture
        FROM artist a JOIN users u ON (a.artist_id = u.user_id)
        LIMIT 8 
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
    
### get_genre_trending_songs_ ###
def get_genre_trending_songs(genre_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, %s , NULL, NULL, NULL)", (genre_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_genre_popular_songs ###
def get_genre_popular_songs(genre_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, %s , NULL, NULL, NULL)", (genre_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_genre_recommended_songs ###
def get_genre_recommended_songs(genre_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, %s, NULL , NULL , NULL)", (get_jwt_identity(), genre_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_mood_trending_songs_ ###
def get_mood_trending_songs(mood_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, NULL, %s , NULL, NULL)", (mood_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_mood_popular_songs ###
def get_mood_popular_songs(mood_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, %s , NULL, NULL)", (mood_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_mood_recommended_songs ###
def get_mood_recommended_songs(mood_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, %s , NULL , NULL)", (get_jwt_identity(), mood_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_language_trending_songs_ ###
def get_language_trending_songs(language_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, NULL, NULL , %s , NULL)", (language_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_language_popular_songs ###
def get_language_popular_songs(language_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, NULL , %s , NULL)", (language_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_language_recommended_songs ###
def get_language_recommended_songs(language_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, NULL , %s , NULL)", (get_jwt_identity(), language_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_instrument_trending_songs_ ###
def get_instrument_trending_songs(instrument_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, NULL, NULL , NULL , %s)", (instrument_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_instrument_popular_songs ###
def get_instrument_popular_songs(instrument_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, NULL , NULL , %s)", (instrument_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_instrument_recommended_songs ###
def get_instrument_recommended_songs(instrument_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, NULL , NULL , %s)", (get_jwt_identity(), instrument_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    

##################### Artist Public Profile page Stats #####################
def get_artist_stats(artist_id):
    """Get statistics for artist charts"""
    
    top_songs_sql = """
        SELECT 
            DISTINCT s.song_id,
            s.title,
            s.play_count,
            al.cover_picture
        FROM song s
        LEFT JOIN album al ON al.album_id = s.album_id
        WHERE al.owner_id = %s
        ORDER BY s.play_count DESC
        LIMIT 4
    """
    top_songs_result = execute_sql(top_songs_sql, (artist_id,), fetch_all=True)
    
    top_songs = []
    for song in (top_songs_result or []):
        song_data = dict(song)
        song_data["cover_picture_url"] = storage.generate_signed_url(song_data["cover_picture"]) if song_data["cover_picture"] else None
        del song_data["cover_picture"]
        top_songs.append(song_data)
    
    monthly_listeners_sql = """
        SELECT 
            TO_CHAR(DATE_TRUNC('month', ssh.date_time), 'Mon') as month,
            COUNT(DISTINCT ssh.listener_id) as listener_count
        FROM song_stream_history ssh
        JOIN song s ON s.song_id = ssh.song_id
        WHERE sa.owner_id = %s
        AND ssh.date_time >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', ssh.date_time)
        ORDER BY DATE_TRUNC('month', ssh.date_time)
    """
    monthly_result = execute_sql(monthly_listeners_sql, (artist_id,), fetch_all=True)
    monthly_listeners = [dict(row) for row in (monthly_result or [])]
    

    total_plays_sql = """
        SELECT SUM(s.play_count) as total_plays
        FROM song s
        JOIN song_artist sa ON sa.song_id = s.song_id
        WHERE sa.artist_id = %s
    """
    total_result = execute_sql(total_plays_sql, (artist_id,), fetch_one=True)
    total_plays = total_result["total_plays"] if total_result and total_result["total_plays"] else 0
    
    return {
        "top_songs": top_songs,
        "monthly_listeners": monthly_listeners,
        "total_plays": int(total_plays)
    }, 200

### Helper functions ###