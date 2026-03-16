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

### create_album ###
def create_album(title, description, release_date, cover_picture, copyright_certificate):
    if not title or not release_date or not copyright_certificate:
        return {"error": "missing required fields"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500
    
    album_id = None
    cover_picture_ext = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                # Uploading to db
                cursor.execute("""
                    INSERT INTO album (title, description, owner_id, release_date, cover_picture, visibility, copyright_certificate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING album_id
                    """, (title, description, get_jwt_identity(), release_date, None, 'private', 'null')
                )
                album_id = cursor.fetchone()["album_id"]

                if not album_id:
                    raise Exception()
                
                # Uploading to cloud
                copyright_certificate_path = f"Docs/Copyright_Certificates/album{album_id}.pdf"
                success = storage.upload_file_to_storage(
                    copyright_certificate.stream,
                    copyright_certificate_path,
                    copyright_certificate.mimetype
                )

                if not success:
                    raise Exception()

                if cover_picture:
                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                cursor.execute("""
                    UPDATE album
                    SET copyright_certificate = %s
                    WHERE album_id = %s
                    """, (f"Docs/Copyright_Certificates/album{album_id}.pdf", album_id)
                )
                if cover_picture:
                    cursor.execute("""
                        UPDATE album
                        SET cover_picture = %s
                        WHERE album_id = %s
                        """, (f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}", album_id)
                    )

                connection.commit()
                
    except Exception as e:
        connection.rollback()
        if album_id:
            storage.delete_file_from_storage(f"Docs/Copyright_Certificates/album{album_id}.pdf")
        if cover_picture:
            storage.delete_file_from_storage(f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}")
        return {"error": "album creation failed"}, 500
    
    finally:
        release_connection(connection)
    
    return {"message": "album created successfully"}, 201

### get_albums ###
def get_albums():
    result = execute_sql(
        "SELECT album_id, title FROM album",
        fetch_all = True
    )

    return result, 200

### get_album_details ###
def get_album_details(album_id):
    album_id = int(album_id)

    result = execute_sql(
        "SELECT album_id, asset_id, title, description, owner_id, release_date, visibility FROM album WHERE album_id = %s", (album_id,),
        fetch_all = True
    )
    
    if result:
        return result, 200
    else:
        return {"error": "coudn't fetch data"}, 500
    
### get_album_cover_picture ###  
def get_album_cover_picture(album_id):
    result = execute_sql(
        "SELECT cover_picture FROM album WHERE album_id = %s", (album_id,),
        fetch_one = True
    )

    if not result:
        return {"error": "coudn't fetch data"}, 500
    
    album_cover_picture_path = result["cover_picture"]
    signed_url = storage.generate_signed_url(album_cover_picture_path)

    logging.info(album_cover_picture_path)

    if not signed_url:
        return {"error": "coudn't generate signed url"}
    
    return {"cover_picture_url": signed_url}, 200

### get_my_albums ### 
def get_my_albums():
    result = execute_sql(
        "SELECT album_id, title FROM album WHERE owner_id = %s", (get_jwt_identity(),),
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