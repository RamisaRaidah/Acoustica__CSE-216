from db import execute_sql
import logging
import sys
from flask_jwt_extended import get_jwt_identity
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

### add_stream_history ###
def add_stream_history(segments):
    if not segments:
        return {"error": "no data"}, 400

    listener_id = get_jwt_identity()
    values = []
    placeholders = []
    played_songs = []

    for segment in segments:
        song_id = segment.get('song_id')
        datetime = segment.get('datetime')
        duration = int(segment.get('duration'))
        progress = float(segment.get('progress'))

        placeholders.append("(%s, %s, %s, %s, %s)")
        values.extend([listener_id, song_id, datetime, duration, progress])

        if duration >= 30:
            played_songs.append(song_id)

    command1 = f"""
        INSERT INTO song_stream_history (listener_id, song_id, date_time, duration, progress)
        VALUES {', '.join(placeholders)}
    """

    command2 = """
        UPDATE song 
        SET play_count = play_count + 1
        WHERE song_id IN %s
    """

    result = execute_sql(command1, values)

    if played_songs and result:
        execute_sql(command2, (tuple(played_songs),))

    return {"message": "inserted"}, 200

def get_stream_history():
    return ("get_stream_history")

### get_daily_stream_time ###
def get_daily_stream_time():
    command = """   
        SELECT SUM(duration) stream_time
        FROM song_stream_history
        WHERE listener_id = %s AND date_time >= CURRENT_DATE AND date_time < CURRENT_DATE + INTERVAL '1 day'
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_one = True)

    print(f"Stream time: {result['stream_time']}")
    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return {"stream_time": 0}, 200
    else:
        return result, 200

### get_last_listening ###

def get_last_listening():
    command = """
        SELECT s.song_id, h.progress
        FROM song_stream_history h JOIN song s ON (h.song_id = s.song_id)
        WHERE listener_id = %s
        ORDER BY song_stream_id DESC
        LIMIT 1
    """
    result = execute_sql(command, (get_jwt_identity(),), fetch_one = True)

    logging.info(result)
    
    if not result:
        return {
            "song_id": -1,
            "progress": 0
        }, 200
    
    return result, 200

def add_liked_song(song_id):
    return (f"add_liked_song {song_id}")

### get_liked_songs ###
def get_liked_songs():
    command = """
        SELECT s.song_id, s.title, a.album_id, s.length, a.owner_id, ar.stage_name owner_name
        FROM liked_song l JOIN song s ON (l.song_id = s.song_id) JOIN album a ON (s.album_id = a.album_id) JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE listener_id = %s
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_liked_albums ###
def get_liked_albums():
    command = """
        SELECT a.album_id, a.title, a.owner_id, ar.stage_name owner_name
        FROM liked_album l JOIN album a ON (l.album_id = a.album_id) JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE listener_id = %s
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_liked_playlists ###
def get_liked_playlists():
    command = """
        SELECT p.playlist_id, p.title, p.cover_picture
        FROM liked_playlist l JOIN playlist p ON (l.playlist_id = p.playlist_id)
        WHERE listener_id = %s
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data!"}, 500
    elif result is None:
        return [], 200
    else:
        playlists = []
        for r in result:
            playlists.append({'playlist_id': r['playlist_id'], 'title': r['title'], 'cover_picture_url': storage.generate_signed_url(r['cover_picture'])})
        
        return playlists, 200
    
### get_recently_played_songs ###
def get_recently_played_songs():
    command = """
        SELECT s.song_id, s.title, s.album_id, a.title album_title, 
            s.language_id, l.language_name language, s.length, 
            s.release_date, s.lyrics, s.copyright_certificate, 
            s.play_count, a.owner_id, ar.stage_name owner_name
        FROM song s 
        JOIN album a ON (s.album_id = a.album_id) 
        JOIN language l ON (s.language_id = l.language_id) 
        JOIN artist ar ON (a.owner_id = ar.artist_id)
        JOIN (
            SELECT DISTINCT ON (song_id) song_id, date_time
            FROM song_stream_history
            WHERE listener_id = %s AND duration > 30
            ORDER BY song_id, date_time DESC
        ) latest ON (s.song_id = latest.song_id)
        ORDER BY latest.date_time DESC
        LIMIT 5;
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

def add_followed_artist(artist_id):
    return (f"add_followed_artist {artist_id}")

def get_followed_artists():
    return ("get_followed_artists")

### Helper functions ###