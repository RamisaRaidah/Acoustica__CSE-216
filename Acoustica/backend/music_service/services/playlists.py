from db import get_db_connection, execute_sql, release_connection
from psycopg2.extras import RealDictCursor
import logging
import sys
from flask_jwt_extended import get_jwt_identity

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

### create_playlist ###
def create_playlist(title, description, visibility, cover_picture):
    if not title or not visibility:
        return {"error": "missing required fields"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500
    
    playlist_id = None
    cover_picture_ext = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Uploading to db
                cursor.execute(
                    """
                    INSERT INTO playlist (title, creator_id, description, cover_picture, visibility)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING playlist_id
                    """, (title, get_jwt_identity(), description, None, visibility)
                )
                playlist_id = cursor.fetchone()["playlist_id"]

                if not playlist_id:
                    raise Exception()
                
                # Uploading to cloud
                if cover_picture:
                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/playlist{playlist_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                if cover_picture:
                    cursor.execute(
                        """
                        UPDATE playlist
                        SET cover_picture = %s
                        WHERE playlist_id = %s
                        """, (f"Images/playlist{playlist_id}.{cover_picture_ext}", playlist_id)
                    )

                connection.commit()
                
    except Exception as e:
        connection.rollback()
        if cover_picture:
            storage.delete_file_from_storage(f"Images/playlist{playlist_id}.{cover_picture_ext}")
        return {"error": "playlist creation failed"}, 500
    
    finally:
        release_connection(connection)
    
    return {"message": "playlist created successfully"}, 201

def get_playlist_details(playlist_id):
    return (f"get_playlist_details {playlist_id}")

def edit_playlist(playlist_id):
    return (f"edit_playlist {playlist_id}")

def delete_playlist(playlist_id):
    return (f"delete_playlist {playlist_id}")

def add_song_to_playlist(playlist_id,song_id):
    return (f"add_song_to_playlist {playlist_id} {song_id}")

def remove_song_from_playlist(playlist_id,song_id):
    return (f"remove_song_from_playlist {playlist_id} {song_id}")

def set_playlist_visibility(playlist_id):
    return (f"set_playlist_visibility {playlist_id}")

### Helper functions ###