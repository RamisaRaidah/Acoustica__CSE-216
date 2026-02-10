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

admins = Blueprint("admins", __name__) 

@admins.get("/admins")
def health():
    return jsonify("admins")

@admins.get("/api/admins/me/dashboard")
def get_dashboard():
    return jsonify("get_dashboard")

@admins.get("/api/admins/me")
def get_profile():
    return jsonify("get_profile")