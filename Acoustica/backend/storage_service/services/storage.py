import logging
import sys
import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

STORAGE_ENDPOINT = os.getenv('STORAGE_ENDPOINT')
STORAGE_ACCESS_KEY = os.getenv('STORAGE_ACCESS_KEY')
STORAGE_SECRET_KEY = os.getenv('STORAGE_SECRET_KEY')
STORAGE_BUCKET = os.getenv('STORAGE_BUCKET')
STORAGE_REGION = os.getenv('STORAGE_REGION')

if not all([STORAGE_ENDPOINT, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY, STORAGE_BUCKET]):
    logging.error("Missing storage configuration in environment variables!")
    raise ValueError("Storage configuration incomplete. Check your .env file.")

s3_client = boto3.client(
    's3',
    endpoint_url=STORAGE_ENDPOINT,
    aws_access_key_id=STORAGE_ACCESS_KEY,
    aws_secret_access_key=STORAGE_SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name=STORAGE_REGION
)

logging.info(f"Storage client initialized for bucket: {STORAGE_BUCKET}")

def upload_file_to_storage(file, s3_key, content_type, metadata=None):
    """
    Upload file to Backblaze B2 storage
    
    Args:
        file (str): File object
        s3_key (str): S3 key (path in bucket), e.g., "music/song.mp3"
        content_type (str): MIME type, e.g., "audio/mpeg"
        metadata (dict): Optional metadata dict
    
    Returns:
        bool: True if successful, False otherwise
    
    Example:
        upload_file_to_storage(
            "/tmp/song.mp3",
            "music/uuid123.mp3",
            "audio/mpeg",
            {"original-filename": "song.mp3"}
        )
    """
    try:
        extra_args = {'ContentType': content_type}
        
        if metadata:
            extra_args['Metadata'] = metadata
        
        s3_client.upload_fileobj(
            Fileobj=file,
            Bucket=STORAGE_BUCKET,
            Key=s3_key,
            ExtraArgs=extra_args
        )
        
        logging.info(f"Uploaded: {s3_key} to {STORAGE_BUCKET}")
        return True
    
    except ClientError as e:
        logging.error(f"Storage upload error: {e}")
        return False
    except FileNotFoundError as e:
        logging.error(f"File not found: {file}")
        return False
    except Exception as e:
        logging.error(f"Unexpected upload error: {e}")
        return False


# ===== GENERATE SIGNED URL =====
def generate_signed_url(s3_key, expires_in=3600):
    """
    Generate a presigned URL for accessing a private file
    
    Args:
        s3_key (str): S3 key (path in bucket), e.g., "music/song.mp3"
        expires_in (int): URL expiry time in seconds (default: 3600 = 1 hour)
    
    Returns:
        str: Signed URL or None if error
    
    Example:
        url = generate_signed_url("music/uuid123.mp3", expires_in=3600)
        # Returns: "https://...backblazeb2.com/...?X-Amz-Signature=..."
    """
    try:
        signed_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': STORAGE_BUCKET,
                'Key': s3_key
            },
            ExpiresIn=expires_in
        )
        
        logging.info(f"Generated signed URL for: {s3_key} (expires in {expires_in}s)")
        return signed_url
    
    except ClientError as e:
        logging.error(f"Error generating signed URL for {s3_key}: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error generating signed URL: {e}")
        return None


# ===== DELETE FILE =====
def delete_file_from_storage(s3_key):
    """
    Delete file from storage
    
    Args:
        s3_key (str): S3 key (path in bucket) to delete
    
    Returns:
        bool: True if successful, False otherwise
    
    Example:
        delete_file_from_storage("music/uuid123.mp3")
    """
    try:
        s3_client.delete_object(
            Bucket=STORAGE_BUCKET,
            Key=s3_key
        )
        
        logging.info(f"Deleted: {s3_key} from {STORAGE_BUCKET}")
        return True
    
    except ClientError as e:
        logging.error(f"Storage delete error for {s3_key}: {e}")
        return False
    except Exception as e:
        logging.error(f"Unexpected delete error: {e}")
        return False


# ===== CHECK IF FILE EXISTS =====
def file_exists_in_storage(s3_key):
    """
    Check if file exists in storage
    
    Args:
        s3_key (str): S3 key to check
    
    Returns:
        bool: True if exists, False otherwise
    """
    try:
        s3_client.head_object(Bucket=STORAGE_BUCKET, Key=s3_key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
        logging.error(f"Error checking file existence: {e}")
        return False


# ===== LIST FILES =====
def list_files_in_storage(prefix='', max_keys=1000):
    """
    List files in storage with optional prefix
    
    Args:
        prefix (str): Prefix to filter (e.g., "music/" to list all music files)
        max_keys (int): Maximum number of files to return
    
    Returns:
        list: List of file keys, or empty list if error
    
    Example:
        files = list_files_in_storage(prefix="music/")
        # Returns: ["music/song1.mp3", "music/song2.mp3", ...]
    """
    try:
        response = s3_client.list_objects_v2(
            Bucket=STORAGE_BUCKET,
            Prefix=prefix,
            MaxKeys=max_keys
        )
        
        if 'Contents' not in response:
            return []
        
        files = [obj['Key'] for obj in response['Contents']]
        logging.info(f"Listed {len(files)} files with prefix '{prefix}'")
        return files
    
    except ClientError as e:
        logging.error(f"Error listing files: {e}")
        return []


# ===== GET FILE METADATA =====
def get_file_metadata(s3_key):
    """
    Get metadata about a file
    
    Args:
        s3_key (str): S3 key
    
    Returns:
        dict: File metadata (size, content_type, etc.) or None if error
    """
    try:
        response = s3_client.head_object(Bucket=STORAGE_BUCKET, Key=s3_key)
        
        metadata = {
            'size': response.get('ContentLength'),
            'content_type': response.get('ContentType'),
            'last_modified': response.get('LastModified'),
            'metadata': response.get('Metadata', {})
        }
        
        return metadata
    
    except ClientError as e:
        logging.error(f"Error getting file metadata for {s3_key}: {e}")
        return None


# ===== CHECK STORAGE CONNECTION =====
def check_storage_connection():
    """
    Test if storage connection is working
    
    Returns:
        bool: True if connected, False otherwise
    """
    try:
        s3_client.head_bucket(Bucket=STORAGE_BUCKET)
        logging.info(f"Storage connection OK: {STORAGE_BUCKET}")
        return True
    except ClientError as e:
        logging.error(f"Storage connection failed: {e}")
        return False


# ===== DOWNLOAD FILE (Optional) =====
def download_file_from_storage(s3_key, local_path):
    """
    Download file from storage to local path
    
    Args:
        s3_key (str): S3 key to download
        local_path (str): Local path to save file
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        s3_client.download_file(STORAGE_BUCKET, s3_key, local_path)
        logging.info(f"Downloaded: {s3_key} to {local_path}")
        return True
    except ClientError as e:
        logging.error(f"Download error: {e}")
        return False


# ===== GENERATE UPLOAD URL (Advanced) =====
def generate_upload_presigned_url(s3_key, content_type, expires_in=900):
    """
    Generate presigned URL for direct upload from frontend
    
    Args:
        s3_key (str): S3 key where file will be uploaded
        content_type (str): MIME type
        expires_in (int): URL expiry (default: 900s = 15 minutes)
    
    Returns:
        dict: {'url': ..., 'fields': {...}} or None if error
    
    Note: This is for advanced use case where frontend uploads directly
    """
    try:
        presigned_post = s3_client.generate_presigned_post(
            Bucket=STORAGE_BUCKET,
            Key=s3_key,
            Fields={'Content-Type': content_type},
            Conditions=[
                {'Content-Type': content_type},
                ['content-length-range', 0, 104857600]  
            ],
            ExpiresIn=expires_in
        )
        
        logging.info(f"Generated upload presigned URL for: {s3_key}")
        return presigned_post
    
    except ClientError as e:
        logging.error(f"Error generating upload URL: {e}")
        return None


# Extracting file extension
def get_file_extension(file):
    if not file or not file.filename:
        return None
    
    _, ext = os.path.splitext(file.filename)

    if not ext:
        return None
    
    ext = ext[1:].lower()

    return ext
