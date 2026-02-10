from flask import Blueprint, render_template, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

listeners = Blueprint("listeners", __name__) 

@listeners.route("/listeners")
def listeners_home():
    return jsonify("listeners")