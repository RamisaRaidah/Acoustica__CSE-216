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

playlists = Blueprint("playlists", __name__) 

@playlists.route("/playlists")
def playlists_home():
    return jsonify("playlists")