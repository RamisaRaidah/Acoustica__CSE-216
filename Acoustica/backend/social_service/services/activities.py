from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def send_email():
    return ("send_email")

def cheer():
    return ("cheer")

def ban_asset(asset_id):
    return (f"ban_asset {asset_id}")