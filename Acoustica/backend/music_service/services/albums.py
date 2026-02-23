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

### create_album ###
def create_album(title, description, release_date, cover_picture, copyright_certificate):
    if not title or not release_date or not copyright_certificate:
        return {"error": "missing required fields"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500
    
    album_id = None
    copyright_certificate_ext = None
    cover_picture_ext = None
    
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
                copyright_certificate_ext = storage.get_file_extension(copyright_certificate_ext)
                copyright_certificate_path = f"Docs/album{album_id}.{copyright_certificate_ext}"
                success = storage.upload_file_to_storage(
                    copyright_certificate.stream,
                    copyright_certificate_path,
                    copyright_certificate.mimetype
                )

                if not success:
                    raise Exception()

                if cover_picture:
                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/album{album_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
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
                    """, (f"Docs/album{album_id}.{copyright_certificate_ext}", album_id)
                )
                if cover_picture:
                    cursor.execute(
                        """
                        UPDATE album
                        SET cover_picture = %s
                        WHERE album_id = %s
                        """, (f"Images/album{album_id}.{cover_picture_ext}", album_id)
                    )
                
    except Exception as e:
        connection.rollback()
        storage.delete_file_from_storage(f"Docs/album{album_id}.{copyright_certificate_ext}")
        if cover_picture:
            storage.delete_file_from_storage(f"Images/album{album_id}.{cover_picture_ext}")
        return {"error": "album creation failed"}, 500
    
    finally:
        connection.close()
    
    return {"message": "album created successfully"}, 201

### get_albums
def get_albums():
    result = execute_sql(
        "SELECT album_id, title FROM album",
        fetch_all = True
    )

    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500
    
### get_album_details
def get_album_details(album_id):
    album_id = int(album_id)
    
    result = execute_sql(
        "SELECT * FROM album WHERE album_id = %s", (album_id,),
        fetch_all = True
    )
    
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500

def edit_album(album_id):
    return (f"edit_album {album_id}")

def delete_album(album_id):
    return (f"delete_album {album_id}")

def add_song_to_album(album_id,song_id):
    return (f"add_song_to_album {album_id} {song_id}")

def remove_song_from_album(album_id,song_id):
    return (f"remove_song_from_album {album_id} {song_id}")

### Helper functions ###