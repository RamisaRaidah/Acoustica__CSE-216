from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def get_dashboard():
    return ("get_dashboard")

def get_profile():
    return ("get_profile")