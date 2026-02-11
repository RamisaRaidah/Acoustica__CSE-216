from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def sign_up():
    return ("sign_up")

def sign_in():
    return ("sign_in")

def sign_out():
    return ("sign_out")

def refresh():
    return ("refresh")