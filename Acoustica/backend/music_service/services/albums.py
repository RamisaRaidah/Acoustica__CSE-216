from db import get_db_connection, execute_sql
from psycopg2.extras import RealDictCursor
import logging
import sys

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def create_album(title, description, release_date, cover_picture, copyright_certificate):
    if not title or not release_date or not copyright_certificate:
        return {"error": "missing required fields"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500
    
    album_id = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Uploading to db
                cursor.execute(
                    """
                    INSERT INTO album (title, description, release_date, cover_picture, copyright_certificate)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING album_id
                    """, (title, description, release_date, "null", "null")
                )
                album_id = cursor.fetchone()["album_id"]
                
                # Uploading to cloud
                s3_key = f"Docs/album{album_id}.{storage.get_file_extension(copyright_certificate)}"
                success = storage.upload_file_to_storage(
                    copyright_certificate.stream,
                    s3_key,
                    copyright_certificate.mimetype
                )

                if not success:
                    raise Exception()

                if cover_picture:
                    s3_key = f"Images/album{album_id}.{storage.get_file_extension(cover_picture)}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        s3_key,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                cursor.execute(
                    """
                    UPDATE album
                    SET copyright_certificate = %s
                    WHERE album_id = %s
                    """, (f"Docs/album{album_id}.{storage.get_file_extension(copyright_certificate)}", album_id)
                )
                if cover_picture:
                    cursor.execute(
                        """
                        UPDATE album
                        SET cover_picture = %s
                        WHERE album_id = %s
                        """, (f"Images/album{album_id}.{storage.get_file_extension(cover_picture)}", album_id)
                    )
                
    except Exception as e:
        connection.rollback()
        storage.delete_file_from_storage(f"Docs/album{album_id}.{storage.get_file_extension(copyright_certificate)}")
        if cover_picture:
            storage.delete_file_from_storage(f"Images/album{album_id}.{storage.get_file_extension(cover_picture)}")
        return {"error": "album creation failed"}, 500
    finally:
        connection.close()
    
    logging.info(title, description, release_date, cover_picture, copyright_certificate)
    return {"message": "album created successfully"}, 201

def get_album_details(album_id):
    return (f"get_album_details {album_id}")

def edit_album(album_id):
    return (f"edit_album {album_id}")

def delete_album(album_id):
    return (f"delete_album {album_id}")

def add_song_to_album(album_id,song_id):
    return (f"add_song_to_album {album_id} {song_id}")

def remove_song_from_album(album_id,song_id):
    return (f"remove_song_from_album {album_id} {song_id}")

### Helper functions ###