from db import get_db_connection, execute_sql, release_connection
from psycopg2.extras import RealDictCursor
import logging
import sys
from flask_jwt_extended import get_jwt_identity
from mutagen import File

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

### upload_song ###
def upload_song(title, album, language, release_date, song_file, lyrics, copyright_certificate):
    if not title or not album or not language or not release_date or not song_file or not copyright_certificate:
        return {"error": "Missing file or title"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500

    song_id = None
    song_file_ext = None

    song_file.stream.seek(0)
    audio = File(song_file.stream)

    if not audio or not hasattr(audio, "info"):
        return {"error": "invalid audio file"}, 400
    
    length = audio.info.length
    song_file.stream.seek(0)
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Uploading to db
                cursor.execute(
                    """
                    INSERT INTO song (title, album_id, owner_id, language_id, length, release_date, song_audio, lyrics, visibility, copyright_certificate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING song_id
                    """, (title, album, get_jwt_identity(), language, length, release_date, 'null', 'null', 'private', 'null')
                )
                song_id = cursor.fetchone()["song_id"]

                if not song_id:
                    raise Exception()
                
                # Uploading to cloud
                copyright_certificate_path = f"Docs/song{song_id}.pdf"
                success = storage.upload_file_to_storage(
                    copyright_certificate.stream,
                    copyright_certificate_path,
                    copyright_certificate.mimetype
                )

                if not success:
                    raise Exception()
                
                song_file_ext = storage.get_file_extension(song_file)
                song_file_path = f"Songs/song{song_id}.{song_file_ext}"
                success = storage.upload_file_to_storage(
                    song_file.stream,
                    song_file_path,
                    song_file.mimetype
                )

                if not success:
                    raise Exception()

                if lyrics:
                    lyrics_path = f"Docs/lyrics{song_id}.txt"
                    success = storage.upload_file_to_storage(
                        lyrics.stream,
                        lyrics_path,
                        lyrics.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                cursor.execute(
                    """
                    UPDATE song
                    SET copyright_certificate = %s
                    WHERE song_id = %s
                    """, (f"Docs/song{song_id}.pdf", song_id)
                )
                cursor.execute(
                    """
                    UPDATE song
                    SET song_audio = %s
                    WHERE song_id = %s
                    """, (f"Songs/song{song_id}.{song_file_ext}", song_id)
                )
                if lyrics:
                    cursor.execute(
                        """
                        UPDATE song
                        SET lyrics = %s
                        WHERE song_id = %s
                        """, (f"Docs/lyrics{song_id}.txt", song_id)
                    )
                
                connection.commit()
                
    except Exception as e:
        connection.rollback()
        if song_id:
            storage.delete_file_from_storage(f"Docs/song{song_id}.pdf")
            storage.delete_file_from_storage(f"Songs/song{song_id}.{song_file_ext}")
        if lyrics:
            storage.delete_file_from_storage(f"Docs/lyrics{song_id}.txt")
        return {"error": "song upload failed"}, 500
    
    finally:
        release_connection(connection)

    logging.info(title)
    
    return {"message": "song uploaded successfully"}, 201

def get_song_details(song_id):
    command = "SELECT * FROM song WHERE song_id=%s"
    result = execute_sql(command, (1,), fetch_one=True)

    if not result:
        return {"error": "coudn't find song"}, 401
    
    return {""}

def edit_song(song_id):
    return (f"edit_song {song_id}")

def delete_song(song_id):
    return (f"delete_song {song_id}")

def get_song_audio(song_id):
    command = "SELECT song_audio FROM song WHERE song_id = %s"
    result = execute_sql(command, (song_id,), fetch_one = True)
    if not result:
        return {"error": "coudn't find song audio"}, 401
    
    song_path = result['song_audio']
    logging.info(song_path)
    song_signed_url = storage.generate_signed_url(song_path)
    if not song_signed_url:
        return {"error": "failed to generate signed url"}, 401
    
    return {"stream_url": song_signed_url}, 200

### Helper functions ###