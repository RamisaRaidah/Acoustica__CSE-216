import io
import subprocess

from db import get_db_connection, execute_sql, release_connection
from psycopg2.extras import RealDictCursor
import logging
import sys
from mutagen import File

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
                cursor.execute("SELECT title FROM song WHERE LOWER(REPLACE(title, ' ', '')) = %s", (title.lower().replace(' ', ''),))
                
                if cursor.fetchone():
                    return {"error": "exists"}, 500
                
                cursor.execute("""
                    INSERT INTO song (title, album_id, language_id, length, release_date, song_audio, lyrics, visibility, copyright_certificate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING song_id
                    """, (title, album, language, length, release_date, 'null', 'null', 'private', 'null')
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
        if str(e) == 'song already exists':
            return {"error": "song already exists"}, 500
        if song_id:
            storage.delete_file_from_storage(f"Docs/Copyright_Certificates/song{song_id}.pdf")
            storage.delete_file_from_storage(f"Songs/song{song_id}.mp3")
        if lyrics:
            storage.delete_file_from_storage(f"Docs/Lyrics/song{song_id}.txt")
        return {"error": "song upload failed"}, 500
    
    finally:
        release_connection(connection)

    logging.info(title)
    
    return {"message": "song uploaded successfully"}, 201

### get_song_datails ###
def get_song_details(song_id):
    command = "SELECT * FROM song WHERE song_id=%s"
    result = execute_sql(command, (song_id,), fetch_one=True)

    if not result:
        return {"error": "coudn't find song"}, 401
    
    return {""}

def edit_song(song_id):
    return (f"edit_song {song_id}")

def delete_song(song_id):
    return (f"delete_song {song_id}")

def get_song_audio(song_id):
    result = execute_sql(
        "SELECT song_audio FROM song WHERE song_id = %s", (song_id,), 
        fetch_one = True
    )
    if not result:
        return {"error": "coudn't find song audio"}, 401
    
    song_path = result['song_audio']
    logging.info(song_path)
    song_signed_url = storage.generate_signed_url(song_path)
    if not song_signed_url:
        return {"error": "failed to generate signed url"}, 401
    
    return {"stream_url": song_signed_url}, 200

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