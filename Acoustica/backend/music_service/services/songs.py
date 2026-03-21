import io
import subprocess

from db import get_db_connection, execute_sql, release_connection
from psycopg2.extras import RealDictCursor
import logging
import sys
from mutagen import File
from flask_jwt_extended import get_jwt_identity

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

### upload_song ###
def upload_song(title, album, collaborators, language, genres, moods, instruments, release_date, song_file, lyrics, copyright_certificate):
    if not title or not album or not language or not genres or not moods or not instruments or not release_date or not song_file or not copyright_certificate:
        return {"error": "missing data"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500

    song_id = None

    song_file = compress_audio(song_file)

    song_file.seek(0)
    audio = File(song_file)

    if not audio or not hasattr(audio, "info"):
        return {"error": "invalid audio file"}, 400
    
    length = audio.info.length
    song_file.seek(0)
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Uploading to db
                cursor.execute("SELECT 1 FROM song WHERE LOWER(REPLACE(title, ' ', '')) = %s", (title.lower().replace(' ', ''),))
                
                if cursor.fetchone():
                    return {"error": "exists"}, 500
                
                cursor.execute("""
                    INSERT INTO song (title, album_id, language_id, length, release_date, song_audio, lyrics, visibility, copyright_certificate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING song_id
                    """, (title, album, language, length, release_date, 'null', None, 'private', 'null')
                )
                song_id = cursor.fetchone()["song_id"]

                if not song_id:
                    raise Exception()
                
                # Uploading to cloud
                copyright_certificate_path = f"Docs/Copyright_Certificates/song{song_id}.pdf"
                success = storage.upload_file_to_storage(
                    copyright_certificate.stream,
                    copyright_certificate_path,
                    copyright_certificate.mimetype
                )

                if not success:
                    raise Exception()
                
                song_file_path = f"Songs/song{song_id}.mp3"
                success = storage.upload_file_to_storage(
                    song_file,
                    song_file_path,
                    "audio/mpeg"
                )

                if not success:
                    raise Exception()

                if lyrics:
                    lyrics_path = f"Docs/Lyrics/song{song_id}.txt"
                    success = storage.upload_file_to_storage(
                        lyrics.stream,
                        lyrics_path,
                        lyrics.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                cursor.execute("""
                    UPDATE song
                    SET copyright_certificate = %s
                    WHERE song_id = %s
                    """, (f"Docs/Copyright_Certificates/song{song_id}.pdf", song_id)
                )
                cursor.execute("""
                    UPDATE song
                    SET song_audio = %s
                    WHERE song_id = %s
                    """, (f"Songs/song{song_id}.mp3", song_id)
                )
                if lyrics:
                    cursor.execute("""
                        UPDATE song
                        SET lyrics = %s
                        WHERE song_id = %s
                        """, (f"Docs/Lyrics/song{song_id}.txt", song_id)
                    )

                # Uploading song other metadata in db
                for collaborator in collaborators:
                    artist, role = collaborator.split(':')
                    cursor.execute("INSERT INTO song_artist (song_id, artist_id, role) VALUES (%s, %s, %s)", (song_id, artist, role.lower()))

                for genre in genres:
                    cursor.execute("INSERT INTO song_genre (song_id, genre_id) VALUES (%s, %s)", (song_id, genre))

                for mood in moods:
                    cursor.execute("INSERT INTO song_mood (song_id, mood_id) VALUES (%s, %s)", (song_id, mood))

                for instrument in instruments:
                    cursor.execute("INSERT INTO song_instrument (song_id, instrument_id) VALUES (%s, %s)", (song_id, instrument))
                
                connection.commit()
                
    except Exception as e:
        connection.rollback()
        if song_id:
            storage.delete_file_from_storage(f"Docs/Copyright_Certificates/song{song_id}.pdf")
            storage.delete_file_from_storage(f"Songs/song{song_id}.mp3")
        if lyrics:
            storage.delete_file_from_storage(f"Docs/Lyrics/song{song_id}.txt")
        return {"error": "failed"}, 500
    
    finally:
        release_connection(connection)

    logging.info(title)
    
    return {"message": "successful"}, 201

### get_song_datails ###
def get_song_metadata(song_id):
    command = """
        SELECT s.song_id, s.title, s.album_id, a.title album_title, s.language_id, l.language_name language, s.length, s.release_date, s.lyrics, s.visibility, s.copyright_certificate, s.play_count, a.owner_id, ar.stage_name owner_name
        FROM song s JOIN album a ON (s.album_id = a.album_id) JOIN language l ON (s.language_id = l.language_id) JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE song_id=%s
    """
    result = execute_sql(command, (song_id,), fetch_one = True)

    if not result:
        return {"error": "coudn't fetch data"}, 500
    
    return result, 200

### get_song_audio ###
def get_song_audio(song_id):
    result = execute_sql(
        "SELECT song_audio FROM song WHERE song_id = %s", (song_id,), 
        fetch_one = True
    )

    if result:
        signed_url = storage.generate_signed_url(result['song_audio'])
        if signed_url:
            return {"stream_url": signed_url}, 200
    
    return {"error": "failed to fetch data"}, 401

### get_song_lyrics ###
def get_song_lyrics(song_id):
    result = execute_sql(
        "SELECT lyrics FROM song WHERE song_id = %s", (song_id,), 
        fetch_one = True
    )

    if result and result['lyrics']:
        signed_url = storage.generate_signed_url(result['lyrics'])
        if signed_url:
            return {"lyrics": signed_url}, 200
        else:
            return {"error": "failed to fetch data"}, 401
    else:
        return {"lyrics": "no lyrics"}, 200

### get_song_copyright_certificate ###
def get_song_copyright_certificate(song_id):
    result = execute_sql(
        "SELECT copyright_certificate FROM song WHERE song_id = %s", (song_id,), 
        fetch_one = True
    )

    if result:
        signed_url = storage.generate_signed_url(result['copyright_certificate'])
        if signed_url:
            return {"copyright_certificate": signed_url}, 200
    
    return {"error": "failed to fetch data"}, 401

### get_song_collaborators ###
def get_song_collaborators(song_id):
    command = """
        SELECT s.artist_id, a.stage_name artist_name, s.role
        FROM song_artist s JOIN artist a ON (s.artist_id = a.artist_id)
        WHERE song_id = %s
    """
    result = execute_sql(command, (song_id,), fetch_all = True)

    if result:
        collaborators = []
        for r in result:
            collaborators.append({'artist_id': r['artist_id'], 'artist_name': r['artist_name'], 'role': r['role']})
        
        return collaborators, 200
    
    return {"error": "failed to fetch data"}, 401

### get_song_genres ###
def get_song_genres(song_id):
    command = """
        SELECT s.genre_id, g.genre_name
        FROM song_genre s JOIN genre g ON (s.genre_id = g.genre_id)
        WHERE song_id = %s
    """
    result = execute_sql(command, (song_id,), fetch_all = True)

    if result:
        genres = []
        for r in result:
            genres.append({'genre_id': r['genre_id'], 'genre_name': r['genre_name']})
        
        return genres, 200
    
    return {"error": "failed to fetch data"}, 401

### get_song_moods ###
def get_song_moods(song_id):
    command = """
        SELECT s.mood_id, m.mood_name
        FROM song_mood s JOIN mood m ON (s.mood_id = m.mood_id)
        WHERE song_id = %s
    """
    result = execute_sql(command, (song_id,), fetch_all = True)

    if result:
        moods = []
        for r in result:
            moods.append({'mood_id': r['mood_id'], 'mood_name': r['mood_name']})
        
        return moods, 200
    
    return {"error": "failed to fetch data"}, 401

### get_song_instruments ###
def get_song_instruments(song_id):
    command = """
        SELECT s.instrument_id, i.instrument_name
        FROM song_instrument s JOIN instrument i ON (s.instrument_id = i.instrument_id)
        WHERE song_id = %s
    """
    result = execute_sql(command, (song_id,), fetch_all = True)

    if result:
        instruments = []
        for r in result:
            instruments.append({'instrument_id': r['instrument_id'], 'instrument_name': r['instrument_name']})
        
        return instruments, 200
    
    return {"error": "failed to fetch data"}, 401

### edit_song ###
def edit_song(song_id, title, album, added_collaborators, deleted_collaborators, language, added_genres, deleted_genres, added_moods, deleted_moods, added_instruments, deleted_instruments, release_date, lyrics, copyright_certificate, lyrics_action, copyright_certificate_action):
    if not title or not album or not language or not release_date:
        return {"error": "missing data"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500

    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Uploading to db
                cursor.execute("SELECT 1 FROM song WHERE LOWER(REPLACE(title, ' ', '')) = %s AND song_id != %s", (title.lower().replace(' ', ''), song_id))
                
                if cursor.fetchone():
                    return {"error": "exists"}, 500
                
                cursor.execute("""
                    UPDATE song
                    SET title = %s, album_id = %s, language_id = %s, release_date = %s
                    WHERE song_id = %s
                """, (title, album, language, release_date, song_id)
                )
                
                # Uploading to cloud
                if copyright_certificate_action == 'replace' and copyright_certificate:
                    cursor.execute("SELECT copyright_certificate FROM song WHERE song_id = %s", (song_id,))
                    cc = cursor.fetchone()['copyright_certificate']
                    if cc:
                        storage.delete_file_from_storage(cc)

                    copyright_certificate_path = f"Docs/Copyright_Certificates/song{song_id}.pdf"
                    success = storage.upload_file_to_storage(
                        copyright_certificate.stream,
                        copyright_certificate_path,
                        copyright_certificate.mimetype
                    )

                    if not success:
                        raise Exception()
                
                if lyrics_action == 'replace' and lyrics:
                    cursor.execute("SELECT lyrics FROM song WHERE song_id = %s", (song_id,))
                    cc = cursor.fetchone()['lyrics']
                    if cc:
                        storage.delete_file_from_storage(cc)

                    lyrics_path = f"Docs/Lyrics/song{song_id}.txt"
                    success = storage.upload_file_to_storage(
                        lyrics.stream,
                        lyrics_path,
                        lyrics.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                    cursor.execute("""
                        UPDATE song
                        SET lyrics = %s
                        WHERE song_id = %s
                        """, (f"Docs/Lyrics/song{song_id}.txt", song_id,)
                    )
                    
                elif lyrics_action == 'replace' and not lyrics:
                    cursor.execute("SELECT lyrics FROM song WHERE song_id = %s", (song_id,))
                    lyrics_prev = cursor.fetchone()['lyrics']
                    if lyrics_prev:
                        storage.delete_file_from_storage(lyrics_prev)

                    cursor.execute("""
                        UPDATE song
                        SET lyrics = NULL
                        WHERE song_id = %s
                        """, (song_id,)
                    )
                    
                # Uploading song other metadata in db
                for collaborator in added_collaborators:
                    artist, role = collaborator.split(':')
                    cursor.execute("INSERT INTO song_artist (song_id, artist_id, role) VALUES (%s, %s, %s)", (song_id, artist, role.lower()))

                for collaborator in deleted_collaborators:
                    artist, role = collaborator.split(':')
                    cursor.execute("DELETE FROM song_artist WHERE song_id = %s AND artist_id = %s AND role = %s", (song_id, artist, role.lower()))

                for genre in added_genres:
                    cursor.execute("INSERT INTO song_genre (song_id, genre_id) VALUES (%s, %s)", (song_id, genre))

                for genre in deleted_genres:
                    cursor.execute("DELETE FROM song_genre WHERE song_id = %s AND genre_id = %s", (song_id, genre))

                for mood in added_moods:
                    cursor.execute("INSERT INTO song_mood (song_id, mood_id) VALUES (%s, %s)", (song_id, mood))

                for mood in deleted_moods:
                    cursor.execute("DELETE FROM song_mood WHERE song_id = %s AND mood_id = %s", (song_id, mood))

                for instrument in added_instruments:
                    cursor.execute("INSERT INTO song_instrument (song_id, instrument_id) VALUES (%s, %s)", (song_id, instrument))

                for instrument in deleted_instruments:
                    cursor.execute("DELETE FROM song_instrument WHERE song_id = %s AND instrument_id = %s", (song_id, instrument))
                
                connection.commit()
                
    except Exception as e:
        connection.rollback()
        if copyright_certificate_action == 'replace' and copyright_certificate:
            storage.delete_file_from_storage(f"Docs/Copyright_Certificates/song{song_id}.pdf")
        if lyrics_action == 'replace' and lyrics:
            storage.delete_file_from_storage(f"Docs/Lyrics/song{song_id}.txt")
        return {"error": "failed"}, 500
    
    finally:
        release_connection(connection)

    return {"message": "successful"}, 201

### delete_song ###
def delete_song(song_id):
    connection = get_db_connection()

    if connection is None:
        return {"error": "couldn't connect to db"}, 500
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT asset_id FROM song WHERE song_id = %s", (song_id,))
                
                result = cursor.fetchone()
                asset_id = result['asset_id']

                if not asset_id:
                    raise Exception()
                
                cursor.execute("DELETE FROM asset WHERE asset_id = %s", (asset_id,))

    except Exception as e:
        connection.rollback()
        return {"error": "failed"}
    
    finally:
        release_connection(connection)

    return {"message": "successful"}, 201

def like_song(song_id):
    result = execute_sql(
        "SELECT 1 FROM liked_song WHERE listener_id = %s AND song_id = %s",
        (get_jwt_identity(), song_id),
        fetch_one=True
    )

    if result is None:
        success = execute_sql(
            "INSERT INTO liked_song (listener_id, song_id) VALUES (%s, %s)",
            (get_jwt_identity(), song_id)
        )
    else:
        success = execute_sql(
            "DELETE FROM liked_song WHERE listener_id = %s AND song_id = %s",
            (get_jwt_identity(), song_id)
        )

    if success is not None:
        return {'message': 'successful'}, 200
    return {'error': 'failed'}, 500

### Helper functions ###

def compress_audio(file) -> io.BytesIO:
    input_bytes = file.read()

    try:
        process = subprocess.run(
            ["ffmpeg", "-i", "pipe:0", "-c:a", "libmp3lame", "-b:a", "192k", "-f", "mp3", "pipe:1"],
            input=input_bytes,
            capture_output=True,
            check=True
        )
        return io.BytesIO(process.stdout)
    except subprocess.CalledProcessError as e:
        logging.error(f"FFmpeg compression failed: {e.stderr.decode()}")
        raise ValueError("Audio compression failed. File may be corrupt or unsupported.")