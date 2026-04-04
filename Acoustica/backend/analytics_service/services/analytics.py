from flask import json
from storage_service.services import storage
from db import execute_sql
import logging
import sys

from flask_jwt_extended import get_jwt_identity
from utils.ai_agent import generate_response

import random
import difflib

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
        SELECT s.song_id, s.album_id, s.title, a.title album_title, ar.artist_id owner_id, ar.stage_name owner_name, s.length, s.asset_id
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
        SELECT a.album_id, a.title, ar.stage_name owner_name, a.asset_id
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
        SELECT a.artist_id, a.stage_name artist_name, u.asset_id
        FROM artist a JOIN users u ON (a.artist_id = u.user_id)
        WHERE LOWER(REPLACE(stage_name, ' ', '')) LIKE %s
        LIMIT 5
    """

    artists = execute_sql(artists_query, param, fetch_all = True) or []

    return {"artists": artists}, 200

### search_playlist ###
def search_playlist(seed):
    seed = seed.lower().replace(" ", "")
    param = (f"%{seed}%",)

    playlists_query = """
        SELECT p.playlist_id, p.title, p.creator_id, (u.first_name || ' ' || u.last_name) creator_name, p.asset_id
        FROM playlist p JOIN users u ON (p.creator_id = u.user_id)
        WHERE LOWER(REPLACE(title, ' ', '')) LIKE %s
        LIMIT 5
    """

    playlists = execute_sql(playlists_query, param, fetch_all = True) or []

    return {"playlists": playlists}, 200

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
    result = execute_sql("SELECT * FROM fn_get_trending_songs(10, NULL, NULL, NULL, NULL, NULL)", fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_popular_songs ###
def get_popular_songs():
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, NULL, NULL, NULL, NULL)", fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_recommended_songs ###
def get_recommended_songs():
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 50, NULL, NULL, NULL, NULL, NULL)", (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_trending_artists ###
def get_trending_artists():
    result = execute_sql("SELECT * FROM fn_get_trending_artists(9, NULL, NULL, NULL)", fetch_all = True)

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
    result = execute_sql("SELECT * FROM fn_get_popular_artists(9, NULL, NULL, NULL)", fetch_all = True)

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
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, %s , NULL, NULL, NULL, NULL)", (genre_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_genre_popular_songs ###
def get_genre_popular_songs(genre_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, %s , NULL, NULL, NULL, NULL)", (genre_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_genre_recommended_songs ###
def get_genre_recommended_songs(genre_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, %s, NULL , NULL , NULL, NULL)", (get_jwt_identity(), genre_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_mood_trending_songs_ ###
def get_mood_trending_songs(mood_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, NULL, %s , NULL, NULL, NULL)", (mood_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_mood_popular_songs ###
def get_mood_popular_songs(mood_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, %s , NULL, NULL, NULL)", (mood_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_mood_recommended_songs ###
def get_mood_recommended_songs(mood_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, %s , NULL , NULL, NULL)", (get_jwt_identity(), mood_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_language_trending_songs_ ###
def get_language_trending_songs(language_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, NULL, NULL , %s , NULL, NULL)", (language_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_language_popular_songs ###
def get_language_popular_songs(language_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, NULL , %s , NULL, NULL)", (language_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_language_recommended_songs ###
def get_language_recommended_songs(language_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, NULL , %s , NULL, NULL)", (get_jwt_identity(), language_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### get_instrument_trending_songs_ ###
def get_instrument_trending_songs(instrument_id):
    result = execute_sql("SELECT * FROM fn_get_trending_songs(5, NULL, NULL , NULL , %s, NULL)", (instrument_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_instrument_popular_songs ###
def get_instrument_popular_songs(instrument_id):
    result = execute_sql("SELECT * FROM fn_get_popular_songs(10, NULL, NULL , NULL , %s, NULL)", (instrument_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_instrument_recommended_songs ###
def get_instrument_recommended_songs(instrument_id):
    result = execute_sql("SELECT * FROM fn_get_recommended_songs(%s, 10, NULL, NULL , NULL , %s, NULL)", (get_jwt_identity(), instrument_id), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    

##################### Artist Public Profile page Stats #####################
def get_artist_stats(artist_id):
    top_songs_result = execute_sql("""
        SELECT 
            DISTINCT
            s.song_id,
            s.title,
            s.play_count,
            alb.cover_picture
        FROM song s
        JOIN song_artist sa ON sa.song_id = s.song_id
        JOIN album alb ON alb.album_id = s.album_id
        WHERE sa.artist_id = %s
        ORDER BY s.play_count DESC
        LIMIT 4
    """, (artist_id,), fetch_all=True)

    top_songs = []
    for song in (top_songs_result or []):
        song_data = dict(song)
        cover_picture = song_data.pop("cover_picture")
        song_data["cover_picture_url"] = storage.generate_signed_url(cover_picture) if cover_picture else None
        top_songs.append(song_data)

    monthly_listeners_sql = """
        SELECT 
            TO_CHAR(DATE_TRUNC('month', ssh.date_time), 'Mon') AS month,
            COUNT(DISTINCT ssh.listener_id) AS listener_count
        FROM song_stream_history ssh
        JOIN song_artist sa ON sa.song_id = ssh.song_id
        WHERE sa.artist_id = %s
        AND ssh.date_time >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', ssh.date_time)
        ORDER BY DATE_TRUNC('month', ssh.date_time)
    """
    monthly_result = execute_sql(monthly_listeners_sql, (artist_id,), fetch_all=True)
    monthly_listeners = [dict(row) for row in (monthly_result or [])]

    total_plays_sql = """
        SELECT SUM(s.play_count) AS total_plays
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

### get_smart_recommendations ###
def get_smart_recommendations(prompt):
    genres = execute_sql("SELECT genre_id, genre_name FROM genre", fetch_all=True)
    moods = execute_sql("SELECT mood_id, mood_name FROM mood", fetch_all=True)
    languages = execute_sql("SELECT language_id, language_name FROM language", fetch_all=True)
    instruments = execute_sql("SELECT instrument_id, instrument_name FROM instrument", fetch_all=True)
    artists = execute_sql("SELECT artist_id, stage_name FROM artist", fetch_all=True)

    response = generate_response(prompt)

    try:
        filters = json.loads(response)
    except (json.JSONDecodeError, TypeError):
        filters = {}

    selected_genres = [fuzzy_match(g, genres, "genre_name")["genre_id"] for g in (filters.get("genres") or []) if fuzzy_match(g, genres, "genre_name")] or genres
    selected_moods = [fuzzy_match(m, moods, "mood_name")["mood_id"] for m in (filters.get("moods") or []) if fuzzy_match(m, moods, "mood_name")] or moods
    selected_languages = [fuzzy_match(l, languages, "language_name")["language_id"] for l in (filters.get("languages") or []) if fuzzy_match(l, languages, "language_name")] or languages
    selected_instruments = [fuzzy_match(i, instruments, "instrument_name")["instrument_id"] for i in (filters.get("instruments") or []) if fuzzy_match(i, instruments, "instrument_name")] or instruments
    selected_artists = [fuzzy_match(a, artists, "stage_name")["artist_id"] for a in (filters.get("artists") or []) if fuzzy_match(a, artists, "stage_name")] or artists
    
    logging.info(filters.get("genres"))
    logging.info(filters.get("moods"))
    logging.info(filters.get("languages"))
    logging.info(filters.get("instruments"))
    logging.info(filters.get("artists"))

    where_clauses = []
    params = []

    if filters.get("languages"):
        where_clauses.append("l.language_id IN %s")
        params.append(tuple(selected_languages))

    if filters.get("artists"):
        where_clauses.append("sa.artist_id IN %s")
        params.append(tuple(selected_artists))

    where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    score_parts = []

    if filters.get("genres"):
        ids = ", ".join(str(g) for g in selected_genres)
        score_parts.append(f"(sg.genre_id IN ({ids}))::int")

    if filters.get("moods"):
        ids = ", ".join(str(m) for m in selected_moods)
        score_parts.append(f"(sm.mood_id IN ({ids}))::int")

    if filters.get("instruments"):
        ids = ", ".join(str(i) for i in selected_instruments)
        score_parts.append(f"(si.instrument_id IN ({ids}))::int")

    score_sql = " + ".join(score_parts) if score_parts else "0"

    command = f"""
        SELECT 
            s.song_id, 
            s.title, 
            s.album_id, 
            a.title album_title, 
            s.language_id, 
            l.language_name language, 
            s.length, 
            s.release_date,
            s.play_count, 
            a.owner_id, 
            ar.stage_name owner_name, 
            s.asset_id
        FROM 
            song s
            JOIN album a ON (s.album_id = a.album_id)
            JOIN artist ar ON (a.owner_id = ar.artist_id)
            JOIN language l ON (s.language_id = l.language_id)
            JOIN song_artist sa ON (s.song_id = sa.song_id)
            JOIN song_genre sg ON (s.song_id = sg.song_id)
            JOIN song_mood sm ON (s.song_id = sm.song_id)
            JOIN song_instrument si ON (s.song_id = si.song_id)
        {where_sql}
        GROUP BY 
            s.song_id, 
            s.title, 
            s.album_id, 
            a.title, 
            s.language_id, 
            l.language_name, 
            s.length, 
            s.release_date,
            s.play_count, 
            a.owner_id, 
            ar.stage_name, 
            s.asset_id
        HAVING MAX({score_sql}) > 0
        ORDER BY MAX({score_sql}) DESC, s.play_count DESC
        LIMIT 15
    """

    result = execute_sql(command, params, fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### Helper functions ###
def fuzzy_match(name, items, key):
    names = [i[key] for i in items]
    matches = difflib.get_close_matches(name.lower(), [n.lower() for n in names], n = 1, cutoff = 0.6)
    if matches:
        return next((i for i in items if i[key].lower() == matches[0]), None)
    return None