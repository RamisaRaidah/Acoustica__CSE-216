from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def send_email():
    return ("send_email")

def cheer():
    return ("cheer")

def ban_asset(asset_id):
    return (f"ban_asset {asset_id}")

### Helper functions ###