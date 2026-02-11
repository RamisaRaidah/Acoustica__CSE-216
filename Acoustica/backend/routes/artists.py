from flask import Blueprint, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

artists = Blueprint("artists", __name__)

@artists.get("/api/artists/health")
def health():
    return jsonify("artists")

@artists.get("/api/artists/me/dashboard")
def get_dashboard():
    return jsonify("get_dashboard")

@artists.get("/api/artists/me")
def get_profile():
    return jsonify("get_profile")